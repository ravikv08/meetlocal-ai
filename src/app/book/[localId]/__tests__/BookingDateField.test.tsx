import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BookingDateField } from '@/app/book/[localId]/BookingDateField'
import { useRouter } from 'next/navigation'

const FIXED_DATE = new Date('2026-06-10T12:00:00Z')

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_DATE)
})

afterAll(() => {
  vi.useRealTimers()
})

describe('BookingDateField', () => {
  it('shows a trigger button with the formatted date', () => {
    render(
      <BookingDateField
        selectedDate="2026-06-10"
        preservedParams={{}}
        localId="local-1"
      />,
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calendar is not visible before the trigger is clicked', () => {
    render(
      <BookingDateField
        selectedDate="2026-06-10"
        preservedParams={{}}
        localId="local-1"
      />,
    )
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })

  it('calendar appears after clicking the trigger', () => {
    render(
      <BookingDateField
        selectedDate="2026-06-10"
        preservedParams={{}}
        localId="local-1"
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('grid')).toBeInTheDocument()
  })

  it('calls router.push with the new date when a day cell is picked', () => {
    const pushMock = vi.fn()
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      replace: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      refresh: vi.fn(),
    })

    render(
      <BookingDateField
        selectedDate="2026-06-10"
        preservedParams={{ hours: '3' }}
        localId="local-1"
      />,
    )

    // Open the picker
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('grid')).toBeInTheDocument()

    // Click day 20 — find the inner interactive element inside gridcell "20"
    const cells = screen.getAllByRole('gridcell')
    const cell20 = cells.find((c) => c.textContent?.trim() === '20')
    expect(cell20).toBeDefined()
    const interactiveEl = cell20!.querySelector('[aria-label]')
    expect(interactiveEl).toBeDefined()
    fireEvent.click(interactiveEl!)

    // fireEvent.click is synchronous; onChange calls router.push synchronously —
    // no waitFor needed (and waitFor hangs under vi.useFakeTimers()).
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('when=2026-06-20'),
    )
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('hours=3'),
    )
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/book/local-1'),
    )
  })
})
