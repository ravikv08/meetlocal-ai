import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import { DatePicker } from '@/components/DatePicker'

// Fix the system clock so calendar renders a known month.
const FIXED_DATE = new Date('2026-06-10T12:00:00Z')

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_DATE)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('DatePicker', () => {
  it('renders a calendar grid', () => {
    render(<DatePicker value={null} onChange={vi.fn()} />)
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('shows the current month heading', () => {
    render(<DatePicker value={null} onChange={vi.fn()} />)
    // AriaCalendar renders two h2 elements: one visible, one visually-hidden aria live region.
    // Use getAllByText and assert at least one contains "June 2026".
    const headings = screen.getAllByText(/june 2026/i)
    expect(headings.length).toBeGreaterThan(0)
  })

  it('calls onChange with the ISO date string when a date cell is clicked', () => {
    const onChange = vi.fn()
    render(<DatePicker value={null} onChange={onChange} />)

    // AriaCalendar renders cells as <td> with role="gridcell"
    const cells = screen.getAllByRole('gridcell')
    // Find the cell whose text content is exactly "15"
    const cell15 = cells.find((c) => c.textContent?.trim() === '15')
    expect(cell15).toBeDefined()

    // Click the inner focusable child (the div with aria-label) — AriaCalendar
    // places the interactive element inside the <td>, not on the td itself.
    // fireEvent is synchronous so no waitFor needed (avoids fake-timer conflicts).
    const clickTarget = cell15!.querySelector('[aria-label]') ?? cell15!
    fireEvent.click(clickTarget)

    expect(onChange).toHaveBeenCalledWith('2026-06-15')
  })

  it('shows the clear button when allowClear is true', () => {
    render(<DatePicker value="2026-06-15" onChange={vi.fn()} allowClear />)
    expect(screen.getByText(/anytime/i)).toBeInTheDocument()
  })

  it('calls onChange(null) when the clear button is clicked', async () => {
    const onChange = vi.fn()
    render(<DatePicker value="2026-06-15" onChange={onChange} allowClear />)

    // fireEvent avoids userEvent's internal setTimeout under fake timers
    fireEvent.click(screen.getByText(/anytime/i))
    expect(onChange).toHaveBeenCalledWith(null)
  })
})
