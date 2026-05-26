import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/app/book/[localId]/actions', () => ({
  createBooking: vi.fn().mockResolvedValue(undefined),
}))

import { BookingPanel } from '@/app/local/[id]/BookingPanel'
import { createBooking } from '@/app/book/[localId]/actions'

const defaultProps = {
  localId: 'local-1',
  localName: 'Maria Lopez',
  ratePerHour: 5000, // $50/hr
  rating: 4.85,
  initialDate: '2026-06-10',
  spots: [],
}

describe('BookingPanel', () => {
  it('renders with the rate and a price summary visible', () => {
    render(<BookingPanel {...defaultProps} />)
    // Header shows "$50 / hour"
    expect(screen.getByText('$50')).toBeInTheDocument()
    expect(screen.getByText('/ hour')).toBeInTheDocument()
    // Submit button shows the total
    expect(screen.getByRole('button', { name: /send request/i })).toBeInTheDocument()
  })

  it('updates the price summary when hours select is changed to 4', async () => {
    render(<BookingPanel {...defaultProps} />)

    // "Hours" is a <select> with options "1h".."6h" and value as the number
    const selects = screen.getAllByRole('combobox')
    // There are two selects: Start time and Hours; Hours is the second one
    const hoursSelect = selects[1]
    fireEvent.change(hoursSelect, { target: { value: '4' } })

    // 4h × $50 = $200 subtotal, $16 fee, $6 tax = $222 total
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send request · \$222/i })).toBeInTheDocument()
    })
  })

  it('calls createBooking with a FormData containing required fields on submit', async () => {
    render(<BookingPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(vi.mocked(createBooking)).toHaveBeenCalledOnce()
    })
    const fd = vi.mocked(createBooking).mock.calls[0][0] as FormData
    expect(fd.get('localId')).toBe('local-1')
    expect(fd.get('hours')).toBe('3')
    expect(fd.get('when')).toBe('2026-06-10')
    expect(fd.get('slot')).toBeTruthy()
  })

  it('disables the submit button and shows Sending… while the action is pending', async () => {
    // Never-resolving mock simulates a long-running action
    vi.mocked(createBooking).mockImplementation(() => new Promise(() => {}))

    render(<BookingPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /sending/i })
      expect(btn).toBeDisabled()
    })
  })

  it('shows an error alert when createBooking rejects', async () => {
    vi.mocked(createBooking).mockRejectedValue(new Error('booking failed'))

    render(<BookingPanel {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /send request/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/something went wrong/i)
    })
  })
})
