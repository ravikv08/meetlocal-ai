import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/booking-actions', () => ({
  acceptBooking: vi.fn().mockResolvedValue(undefined),
  declineBooking: vi.fn().mockResolvedValue(undefined),
  markBookingCompleted: vi.fn().mockResolvedValue(undefined),
}))

import { BookingActionBar } from '@/components/BookingActionBar'
import { acceptBooking, declineBooking } from '@/lib/booking-actions'

describe('BookingActionBar', () => {
  describe('local + requested status', () => {
    it('renders Accept and Decline buttons', () => {
      render(
        <BookingActionBar
          bookingId="b-1"
          status="requested"
          role="local"
          hasStripePayment={false}
        />,
      )
      expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
    })

    it('calls acceptBooking with bookingId when Accept is clicked', async () => {
      render(
        <BookingActionBar
          bookingId="b-1"
          status="requested"
          role="local"
          hasStripePayment={false}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /accept/i }))

      expect(vi.mocked(acceptBooking)).toHaveBeenCalledOnce()
      const fd = vi.mocked(acceptBooking).mock.calls[0][0] as FormData
      expect(fd.get('bookingId')).toBe('b-1')
    })

    it('calls declineBooking with bookingId when Decline is clicked', async () => {
      render(
        <BookingActionBar
          bookingId="b-1"
          status="requested"
          role="local"
          hasStripePayment={false}
        />,
      )
      await userEvent.click(screen.getByRole('button', { name: /decline/i }))

      expect(vi.mocked(declineBooking)).toHaveBeenCalledOnce()
      const fd = vi.mocked(declineBooking).mock.calls[0][0] as FormData
      expect(fd.get('bookingId')).toBe('b-1')
    })
  })

  describe('traveler + requested status', () => {
    it('renders awaiting-accept message (no action buttons)', () => {
      render(
        <BookingActionBar
          bookingId="b-1"
          status="requested"
          role="traveler"
          hasStripePayment={false}
        />,
      )
      expect(screen.getByText(/request sent/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /accept/i })).not.toBeInTheDocument()
    })
  })

  describe('completed status', () => {
    it('renders a Leave review link', () => {
      render(
        <BookingActionBar
          bookingId="b-1"
          status="completed"
          role="traveler"
          hasStripePayment={false}
        />,
      )
      expect(screen.getByRole('link', { name: /leave review/i })).toHaveAttribute(
        'href',
        '/review/b-1',
      )
    })
  })
})
