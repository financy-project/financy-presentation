import { useApolloClient, useQuery } from '@apollo/client/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  ListTransactionsData,
  ListTransactionsVariables,
  TransactionListItem,
} from '@/modules/transactions/graphql/queries'
import { LIST_TRANSACTIONS } from '@/modules/transactions/graphql/queries'
import type { PeriodValue } from '@/modules/transactions/components/period-select'
import type { TransactionTypeFilterValue } from '@/modules/transactions/components/transaction-type-select'
import { useDebouncedValue } from '@/modules/transactions/hooks/use-debounced-value'

const FALLBACK_ERROR_MESSAGE = 'Não foi possível carregar as transações.'
const PAGE_SIZE = 10
const DESCRIPTION_DEBOUNCE_MS = 400

export interface TransactionFilterValues {
  description: string
  type: TransactionTypeFilterValue
  categoryId: string // '' = "Todas"
  period: PeriodValue // always set — defaults to the current month/year
}

export interface UseListTransactionsResult {
  transactions: TransactionListItem[]
  isLoading: boolean
  error: string | null
  page: number
  totalPages: number
  totalRecord: number
  pageSize: number
  goToPage: (page: number) => void
}

export function useListTransactions(filters: TransactionFilterValues): UseListTransactionsResult {
  const client = useApolloClient()
  const [page, setPage] = useState(1)
  const [cursors, setCursors] = useState<Record<number, string | undefined>>({ 1: undefined })
  const [seenData, setSeenData] = useState<ListTransactionsData | undefined>(undefined)
  const [isResolvingPage, setIsResolvingPage] = useState(false)
  const [resolveError, setResolveError] = useState<string | null>(null)

  const debouncedDescription = useDebouncedValue(filters.description, DESCRIPTION_DEBOUNCE_MS)

  const filtersKey = JSON.stringify({
    description: debouncedDescription,
    type: filters.type,
    categoryId: filters.categoryId,
    period: filters.period,
  })

  // A fresh AbortController per distinct filtersKey — its signal is
  // threaded into this render's useQuery call below via
  // context.fetchOptions, which Apollo's HttpLink forwards into the
  // underlying fetch. Apollo's own variable-change handling only *ignores*
  // a stale response, it doesn't cancel the network request, hence doing
  // it explicitly here. Creating it via useMemo (a pure derivation, safe
  // to run during render) rather than mutating a ref during render keeps
  // this correct under React's rules for refs/render. filtersKey is only
  // the trigger for a new instance, not a value the controller depends
  // on, so it's intentionally unused inside the factory.
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const abortController = useMemo(() => new AbortController(), [filtersKey])

  // Aborts the *previous* filtersKey's controller once a new one has
  // genuinely taken over — detected by comparing against a ref rather
  // than aborting unconditionally in a `useEffect` cleanup. A cleanup
  // fires on every unmount, including the harmless mount→cleanup→mount
  // cycle React's StrictMode simulates in development on initial mount;
  // since `abortController` is the *same* memoized instance across that
  // simulated cycle (filtersKey hasn't changed), a cleanup-based abort
  // would cancel the one real in-flight request for this render before
  // it ever gets a chance to resolve. Comparing here instead only aborts
  // when the ref's previous value differs from the current one — i.e.
  // filtersKey actually changed — which StrictMode's replay alone can't
  // trigger.
  const previousAbortControllerRef = useRef<AbortController | null>(null)
  useEffect(() => {
    if (
      previousAbortControllerRef.current &&
      previousAbortControllerRef.current !== abortController
    ) {
      previousAbortControllerRef.current.abort()
    }
    previousAbortControllerRef.current = abortController
  }, [abortController])

  // null on the very first render only — guarantees the block below runs
  // once up front and again every time the *debounced* filters actually
  // change.
  const [lastFiltersKey, setLastFiltersKey] = useState<string | null>(null)

  let effectivePage = page
  let effectiveCursors = cursors
  let effectiveSeenData = seenData

  if (filtersKey !== lastFiltersKey) {
    setLastFiltersKey(filtersKey)

    effectivePage = 1
    effectiveCursors = { 1: undefined }
    effectiveSeenData = undefined
    setPage(1)
    setCursors({ 1: undefined })
    setSeenData(undefined)
  }

  const variables: ListTransactionsVariables = {
    first: PAGE_SIZE,
    after: effectiveCursors[effectivePage],
    description: debouncedDescription || undefined,
    type: filters.type || undefined,
    categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
    month: filters.period.month,
    year: filters.period.year,
  }

  const { data, loading, error } = useQuery<ListTransactionsData, ListTransactionsVariables>(
    LIST_TRANSACTIONS,
    {
      variables,
      fetchPolicy: 'cache-and-network',
      context: { fetchOptions: { signal: abortController.signal } },
    },
  )

  // Adjust cursors during render (React's recommended alternative to a
  // setState-in-effect) when the query returns fresh data for this page —
  // the guard on `seenData` keeps this idempotent per response, since the
  // page-cursor map must persist across page navigations rather than reset.
  if (data && data !== effectiveSeenData) {
    setSeenData(data)

    const { hasNextPage, endCursor } = data.listTransactions.pageInfo

    if (hasNextPage && endCursor && effectiveCursors[effectivePage + 1] === undefined) {
      setCursors((prev) => ({ ...prev, [effectivePage + 1]: endCursor }))
    }
  }

  // While a page-change fetch is in flight, Apollo has no cache entry for
  // the new cursor yet (`data` is undefined) — fall back to the last
  // successful response so the table keeps showing its previous rows/totals
  // and only needs to swap the body for skeleton rows while `isLoading`.
  const resolvedData = data ?? effectiveSeenData
  const totalRecord = resolvedData?.listTransactions.totalRecord ?? 0

  // Cancelling a request rejects its promise with an AbortError, which
  // Apollo surfaces as a networkError — that's this hook's own doing (see
  // above), not a real failure, so it must never flash as the returned
  // error just because the user changed a filter.
  const isAbortError = error?.name === 'AbortError'

  const goToPage = async (target: number) => {
    if (target === effectivePage || target < 1 || isResolvingPage) return

    if (target === 1 || effectiveCursors[target] !== undefined) {
      setPage(target)
      return
    }

    // The API only supports opaque forward cursors (no offset-based random
    // access), so a page's cursor can only be resolved from the page right
    // before it. Jumping straight to a page number the user hasn't visited
    // yet (anything past the immediate next page) requires walking the
    // intermediate pages first — via the Apollo cache, so already-fetched
    // pages resolve instantly and only genuinely new ones hit the network —
    // instead of silently doing nothing. Each intermediate query carries the
    // same filter variables as the current view, so walking forward never
    // drifts from the active filters.
    let knownPage = 1
    while (effectiveCursors[knownPage + 1] !== undefined) knownPage++

    setIsResolvingPage(true)
    setResolveError(null)

    try {
      let cursor = effectiveCursors[knownPage]
      const resolvedCursors: Record<number, string | undefined> = {}

      for (let p = knownPage; p < target; p++) {
        const { data: pageData } = await client.query<ListTransactionsData, ListTransactionsVariables>({
          query: LIST_TRANSACTIONS,
          variables: {
            first: PAGE_SIZE,
            after: cursor,
            description: debouncedDescription || undefined,
            type: filters.type || undefined,
            categoryIds: filters.categoryId ? [filters.categoryId] : undefined,
            month: filters.period.month,
            year: filters.period.year,
          },
        })
        const { hasNextPage, endCursor } = pageData?.listTransactions.pageInfo ?? {}

        if (!hasNextPage || !endCursor) return

        cursor = endCursor
        resolvedCursors[p + 1] = endCursor
      }

      setCursors((prev) => ({ ...prev, ...resolvedCursors }))
      setPage(target)
    } catch {
      setResolveError(FALLBACK_ERROR_MESSAGE)
    } finally {
      setIsResolvingPage(false)
    }
  }

  return {
    transactions: resolvedData?.listTransactions.edges.map((edge) => edge.node) ?? [],
    isLoading: loading || isResolvingPage,
    error: (error && !isAbortError) || resolveError ? FALLBACK_ERROR_MESSAGE : null,
    page: effectivePage,
    totalPages: Math.ceil(totalRecord / PAGE_SIZE),
    totalRecord,
    pageSize: PAGE_SIZE,
    goToPage,
  }
}
