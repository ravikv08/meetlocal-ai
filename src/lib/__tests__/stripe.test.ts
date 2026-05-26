import { describe, it, expect, vi } from 'vitest'

vi.mock('stripe', () => {
  class MockStripe {
    checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/pay/cs_test_abc',
        }),
      },
    }
    webhooks = { constructEvent: vi.fn() }
    paymentIntents = { cancel: vi.fn().mockResolvedValue({}) }
  }
  return { default: MockStripe }
})

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

describe('createCheckoutSessionForBooking — stripe configured', () => {
  it('returns checkout URL when stripe is configured and booking exists', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_abc')
    vi.resetModules()

    const { createCheckoutSessionForBooking } = await import('@/lib/stripe')

    mockPrisma.booking.findUnique.mockResolvedValue({
      id: 'b-1',
      hours: 2,
      totalAmount: 10000,
      currency: 'USD',
      local: {
        id: 'local-1',
        tagline: 'Your Miami guide',
        user: { name: 'Maria' },
      },
    })

    const url = await createCheckoutSessionForBooking({ bookingId: 'b-1', travelerEmail: 'sam@example.com' })
    expect(url).toBe('https://checkout.stripe.com/pay/cs_test_abc')

    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('throws when booking is not found', async () => {
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_abc')
    vi.resetModules()

    const { createCheckoutSessionForBooking } = await import('@/lib/stripe')
    mockPrisma.booking.findUnique.mockResolvedValue(null)

    await expect(createCheckoutSessionForBooking({ bookingId: 'not-found' })).rejects.toThrow('booking not found')

    vi.unstubAllEnvs()
    vi.resetModules()
  })
})

