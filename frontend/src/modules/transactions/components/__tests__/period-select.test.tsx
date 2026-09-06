import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PeriodSelect } from '@/modules/transactions/components/period-select'

// Fixed "now" so the option list (current year back through the previous
// year) is deterministic across test runs.
const FIXED_NOW = new Date(2025, 10, 15) // November 2025

// scrollTop/scrollHeight/clientHeight are getter-only on Element.prototype
// in jsdom — fireEvent's `target` override can't assign them directly, so
// shadow them as configurable own properties before dispatching.
function setListMetrics(el: HTMLElement, metrics: { scrollTop: number; scrollHeight: number; clientHeight: number }) {
  Object.defineProperty(el, 'scrollTop', { configurable: true, value: metrics.scrollTop })
  Object.defineProperty(el, 'scrollHeight', { configurable: true, value: metrics.scrollHeight })
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: metrics.clientHeight })
}

describe('PeriodSelect', () => {
  beforeEach(() => {
    // Fake only Date — faking timers wholesale hangs userEvent's internal
    // delays against Radix Popover's real rAF-driven positioning.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the trigger with the selected month/year formatted', () => {
    render(<PeriodSelect value={{ month: 11, year: 2025 }} onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Período' })).toHaveTextContent('Novembro / 2025')
  })

  it('lists the current year (up to the current month) plus all of the previous year, newest first, with no future months', async () => {
    const user = userEvent.setup()
    render(<PeriodSelect value={{ month: 11, year: 2025 }} onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Período' }))

    const options = screen.getAllByRole('option')
    // Nov..Jan 2025 (11) + Dec..Jan 2024 (12) = 23
    expect(options).toHaveLength(23)
    expect(options[0]).toHaveTextContent('Novembro / 2025')
    expect(options[options.length - 1]).toHaveTextContent('Janeiro / 2024')
    expect(screen.queryByText('Dezembro / 2025')).not.toBeInTheDocument()
  })

  it('calls onChange and closes the popover when an option is selected', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<PeriodSelect value={{ month: 11, year: 2025 }} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: 'Período' }))
    await user.click(screen.getByRole('option', { name: 'Outubro / 2025' }))

    expect(onChange).toHaveBeenCalledWith({ month: 10, year: 2025 })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('loads one more year back when the list is scrolled to the bottom', async () => {
    const user = userEvent.setup()
    render(<PeriodSelect value={{ month: 11, year: 2025 }} onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Período' }))
    expect(screen.getAllByRole('option')).toHaveLength(23)

    const listbox = screen.getByRole('listbox')
    setListMetrics(listbox, { scrollTop: 100, scrollHeight: 120, clientHeight: 20 })
    fireEvent.scroll(listbox)

    expect(screen.getAllByRole('option')).toHaveLength(35) // + Dec..Jan 2023 (12)
    expect(screen.getByRole('option', { name: 'Janeiro / 2023' })).toBeInTheDocument()
  })
})
