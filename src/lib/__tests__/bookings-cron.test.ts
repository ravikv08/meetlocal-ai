import { describe, it, expect, vi } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  booking: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = vi.hoisted(() => ({
  paymentIntents: { cancel: vi.fn().mockResolvedValue({}) },
}))
vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }))

import { expireStaleRequestedBookings, ACCEPT_WINDOW_MINUTES } from '@/lib/bookings-cron'

const WINDOW_MS = ACCEPT_WINDOW_MINUTES * 60 * 1000

describe('expireStaleRequestedBookings', () => {
  it(`queries for requested bookings older than ${ACCEPT_WINDOW_MINUTES} minutes`, async () => {
    const now = new Date('2025-06-15T12:00:00Z')
    mockPrisma.booking.findMany.mockResolvedValue([])

    await expireStaleRequestedBookings(now)

    const [query] = mockPrisma.booking.findMany.mock.calls
    const where = (query as [{ where: { status: string; createdAt: { lt: Date } } }])[0].where
    expect(where.status).toBe('requested')

    const expectedCutoff = new Date(now.getTime() - WINDOW_MS)
    expect(where.createdAt.lt.getTime()).toBe(expectedCutoff.getTime())
  })

  it('marks each stale booking as cancelled', async () => {
    const stale = [
      { id: 'b-1', stripePaymentIntentId: null },
      { id: 'b-2', stripePaymentIntentId: null },
    ]
    mockPrisma.booking.findMany.mockResolvedValue(stale)
    mockPrisma.booking.update.mockResolvedValue({})

    await expireStaleRequestedBookings(new Date())

    expect(mockPrisma.booking.update).toHaveBeenCalledTimes(2)
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    )
  })

  it('cancels Stripe PaymentIntent when one exists', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: 'pi_xyz' },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    await expireStaleRequestedBookings(new Date())

    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_xyz')
  })

  it('still cancels booking even if Stripe cancel throws', async () => {
    mockStripe.paymentIntents.cancel.mockRejectedValueOnce(new Error('already cancelled'))
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: 'pi_fail' },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    const result = await expireStaleRequestedBookings(new Date())

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'b-1' }, data: { status: 'cancelled' } }),
    )
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('b-1')
  })

  it('returns correct count and ids', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: null },
      { id: 'b-2', stripePaymentIntentId: null },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    const result = await expireStaleRequestedBookings(new Date())

    expect(result.cancelled).toBe(2)
    expect(result.ids).toEqual(['b-1', 'b-2'])
    expect(result.errors).toHaveLength(0)
  })

  it('returns zero when no stale bookings exist', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([])

    const result = await expireStaleRequestedBookings(new Date())

    expect(result.cancelled).toBe(0)
    expect(result.ids).toHaveLength(0)
    expect(mockPrisma.booking.update).not.toHaveBeenCalled()
  })
})
