import { describe, it, expect, vi } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  localProfile: { findUnique: vi.fn() },
  booking: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  user: { findUnique: vi.fn().mockResolvedValue({ name: 'Sam', email: 'sam@example.com' }) },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = vi.hoisted(() => ({
  paymentIntents: {
    capture: vi.fn().mockResolvedValue({}),
    cancel: vi.fn().mockResolvedValue({}),
  },
}))
vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  isStripeConfigured: vi.fn().mockReturnValue(false),
  createCheckoutSessionForBooking: vi.fn().mockResolvedValue('https://checkout.stripe.com/pay/cs_test'),
}))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  bookingRequestedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
  bookingAcceptedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import {
  createBookingForTraveler,
  acceptBookingByUser,
  declineBookingByUser,
  markBookingCompletedByUser,
  type CreateBookingInput,
  type BookingActorContext,
} from '@/lib/bookings'
import { isStripeConfigured } from '@/lib/stripe'

const activeLocal = {
  id: 'local-1',
  userId: 'local-user-1',
  status: 'active',
  ratePerHour: 5000,
  tagline: 'Great guide',
  user: { name: 'Maria', email: 'maria@example.com' },
}

const bookingInput: CreateBookingInput = {
  travelerId: 'traveler-1',
  travelerEmail: 'sam@example.com',
  travelerName: 'Sam',
  localId: 'local-1',
  hours: 2,
  slot: '18:00',
  when: '2025-07-04',
}

const baseBooking = {
  id: 'booking-1',
  status: 'requested',
  stripePaymentIntentId: null,
  travelerId: 'traveler-1',
  totalAmount: 11100,
  local: {
    userId: 'local-user-1',
    tagline: 'Great guide',
    user: { id: 'local-user-1', name: 'Maria', email: 'maria@example.com' },
  },
  traveler: { id: 'traveler-1', name: 'Sam', email: 'sam@example.com' },
}

describe('createBookingForTraveler — fee math', () => {
  it('calculates subtotal, serviceFee (8%), taxes (3%), and totalAmount as integers', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue({ ...baseBooking, id: 'b-new' })

    await createBookingForTraveler(bookingInput)

    const [createCall] = mockPrisma.booking.create.mock.calls
    const data = (createCall as [{ data: Record<string, number> }])[0].data
    const subtotal = 5000 * 2
    const serviceFee = Math.round(subtotal * 0.08)
    const taxes = Math.round(subtotal * 0.03)
    const expectedTotal = subtotal + serviceFee + taxes

    expect(data.totalAmount).toBe(expectedTotal)
    expect(Number.isInteger(data.totalAmount)).toBe(true)
    expect(Number.isInteger(data.platformFee)).toBe(true)
  })

  it('platformFee is 22% of subtotal', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    await createBookingForTraveler(bookingInput)

    const [createCall] = mockPrisma.booking.create.mock.calls
    const data = (createCall as [{ data: Record<string, number> }])[0].data
    expect(data.platformFee).toBe(Math.round(5000 * 2 * 0.22))
  })
})

describe('createBookingForTraveler — status guards', () => {
  it('throws "Local not available" when local status is paused', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({ ...activeLocal, status: 'paused' })
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })

  it('throws "Local not available" when local status is removed', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({ ...activeLocal, status: 'removed' })
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })

  it('throws when local is not found', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(null)
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })
})

describe('createBookingForTraveler — Stripe', () => {
  it('returns checkoutUrl: null when Stripe is not configured', async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(false)
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    const result = await createBookingForTraveler(bookingInput)
    expect(result.checkoutUrl).toBeNull()
  })

  it('returns a checkout URL when Stripe is configured', async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(true)
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    const result = await createBookingForTraveler(bookingInput)
    expect(result.checkoutUrl).toContain('checkout.stripe.com')
  })
})

describe('acceptBookingByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions status to confirmed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })

    await acceptBookingByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'confirmed' }) }),
    )
  })

  it('throws when booking is already confirmed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    await expect(acceptBookingByUser(ctx)).rejects.toThrow('Cannot accept a booking that is confirmed')
  })

  it('throws when actor is neither the local nor an admin', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    await expect(
      acceptBookingByUser({ ...ctx, actorUserId: 'stranger-99', isAdmin: false }),
    ).rejects.toThrow('forbidden')
  })

  it('admin can accept any booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    await expect(
      acceptBookingByUser({ ...ctx, actorUserId: 'admin-user', isAdmin: true }),
    ).resolves.not.toThrow()
  })

  it('guards the transition on status="requested" so concurrent accepts cannot double-confirm', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })

    await acceptBookingByUser(ctx)

    // The compound where is the concurrency guard — both actors pass the app-level
    // status check, but only one update can match.
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking-1', status: 'requested' },
      }),
    )
  })

  it('translates the P2025 race loss into a conflict error', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockRejectedValue(
      Object.assign(new Error('Record to update not found.'), { code: 'P2025' }),
    )

    await expect(acceptBookingByUser(ctx)).rejects.toThrow(
      'Booking no longer available to accept',
    )
    // The loser of the race must never capture the payment.
    expect(mockStripe.paymentIntents.capture).not.toHaveBeenCalled()
  })

  it('rethrows non-P2025 update errors unchanged', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    const boom = new Error('connection refused')
    mockPrisma.booking.update.mockRejectedValue(boom)

    await expect(acceptBookingByUser(ctx)).rejects.toThrow('connection refused')
  })

  it('captures the Stripe PaymentIntent after confirming when one exists', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      ...baseBooking,
      status: 'requested',
      stripePaymentIntentId: 'pi_xyz',
    })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })

    await acceptBookingByUser(ctx)

    expect(mockStripe.paymentIntents.capture).toHaveBeenCalledWith('pi_xyz')
  })

  it('does not capture when Stripe was not used for the booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })

    await acceptBookingByUser(ctx)

    expect(mockStripe.paymentIntents.capture).not.toHaveBeenCalled()
  })

  it('swallows a Stripe capture failure instead of failing the accept', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      ...baseBooking,
      status: 'requested',
      stripePaymentIntentId: 'pi_fail',
    })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    mockStripe.paymentIntents.capture.mockRejectedValueOnce(new Error('card_error'))

    await expect(acceptBookingByUser(ctx)).resolves.toMatchObject({ status: 'confirmed' })
    expect(mockPrisma.booking.update).toHaveBeenCalled()
  })
})

describe('declineBookingByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions requested → cancelled', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })

    await declineBookingByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    )
  })

  it('also allows declining a confirmed booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })
    await expect(declineBookingByUser(ctx)).resolves.not.toThrow()
  })

  it('throws when booking is already cancelled', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'cancelled' })
    await expect(declineBookingByUser(ctx)).rejects.toThrow('Cannot decline')
  })

  it('cancels the Stripe PaymentIntent when one exists', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      ...baseBooking,
      status: 'requested',
      stripePaymentIntentId: 'pi_abc',
    })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })

    await declineBookingByUser(ctx)
    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_abc')
  })
})

describe('markBookingCompletedByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions confirmed → completed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'completed' })

    await markBookingCompletedByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }),
    )
  })

  it('throws when booking is still in requested status', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    await expect(markBookingCompletedByUser(ctx)).rejects.toThrow('Cannot complete')
  })
})
