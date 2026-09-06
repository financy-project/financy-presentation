import type { JSX } from 'react'

import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface PeriodValue {
  month: number // 1-12
  year: number
}

export interface PeriodSelectProps {
  id?: string
  label?: string
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

// Distance (px) from the bottom of the list before triggering the next
// batch — fires slightly before the user hits the physical end.
const SCROLL_LOAD_MORE_THRESHOLD_PX = 24

// Descending list of {month, year} from the current month back through
// January of `oldestYear` — never includes a future month, per product
// decision (period filter only looks backward in time).
function buildPeriodOptions(currentYear: number, currentMonth: number, oldestYear: number): PeriodValue[] {
  const options: PeriodValue[] = []

  for (let year = currentYear; year >= oldestYear; year--) {
    const startMonth = year === currentYear ? currentMonth : 12
    for (let month = startMonth; month >= 1; month--) {
      options.push({ month, year })
    }
  }

  return options
}

function formatPeriod(period: PeriodValue): string {
  return `${MONTH_LABELS[period.month - 1]} / ${period.year}`
}

// Month/year dropdown for the transactions period filter. Initially lists
// the current year (up to the current month) plus all of the previous
// year; scrolling to the bottom of the list loads one more year further
// back (never forward, since the period filter never looks into the
// future).
export function PeriodSelect({
  id = 'period',
  label = 'Período',
  value,
  onChange,
}: PeriodSelectProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const now = useMemo(() => new Date(), [])
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const [oldestYear, setOldestYear] = useState(currentYear - 1)

  const options = useMemo(
    () => buildPeriodOptions(currentYear, currentMonth, oldestYear),
    [currentYear, currentMonth, oldestYear],
  )

  function handleSelect(period: PeriodValue) {
    onChange(period)
    setOpen(false)
  }

  function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget

    if (scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_MORE_THRESHOLD_PX) {
      setOldestYear((prev) => prev - 1)
    }
  }

  return (
    <div className="grid gap-2" data-slot="period-select">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="field"
            size="xl"
            className="w-full justify-between px-3 py-3.5 gap-1.5"
          >
            <span>{formatPeriod(value)}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-1">
          <div
            role="listbox"
            aria-label={label}
            onScroll={handleScroll}
            className="max-h-72 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = option.month === value.month && option.year === value.year

              return (
                <Button
                  key={`${option.year}-${option.month}`}
                  type="button"
                  variant="option"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(option)}
                  className="h-auto w-full justify-start rounded-md px-2 py-1.5 text-left"
                >
                  {formatPeriod(option)}
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
