import { describe, it, expect, vi } from 'vitest'

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/pay/cs_test_abc',
        }),
      },
    },
  })),
}))

const mockPrisma = vi.hoisted(() => ({
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { isStripeConfigured } from '@/lib/stripe'

describe('isStripeConfigured', () => {
  it('returns false when STRIPE_SECRET_KEY is not set in test env', () => {
    expect(isStripeConfigured()).toBe(false)
  })
})

describe('createCheckoutSessionForBooking — no stripe configured', () => {
  it('throws when stripe is not configured', async () => {
    const { createCheckoutSessionForBooking } = await import('@/lib/stripe')
    await expect(
      createCheckoutSessionForBooking({ bookingId: 'b-1' }),
    ).rejects.toThrow('stripe not configured')
  })
})
