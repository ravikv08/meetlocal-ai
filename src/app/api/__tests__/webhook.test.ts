// src/app/api/__tests__/webhook.test.ts
import { describe, it, expect, vi } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  webhookEvent: { create: vi.fn() },
  booking: { update: vi.fn(), findUnique: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = vi.hoisted(() => ({
  webhooks: { constructEvent: vi.fn() },
}))
vi.mock('@/lib/stripe', () => ({ stripe: mockStripe, isStripeConfigured: vi.fn().mockReturnValue(true) }))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  bookingRequestedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import { POST } from '@/app/api/stripe/webhook/route'

function makeRequest(body: string, sig: string) {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': sig },
    body,
  })
}

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when signature verification fails', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching')
    })
    const res = await POST(makeRequest('{}', 'bad-sig'))
    expect(res.status).toBe(400)
  })

  it('returns {replay: true} and 200 for a duplicate event id (P2002)', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_dupe',
      type: 'checkout.session.completed',
      data: { object: {} },
    })
    const p2002 = Object.assign(new Error('Unique constraint'), { code: 'P2002' })
    mockPrisma.webhookEvent.create.mockRejectedValueOnce(p2002)

    const res = await POST(makeRequest('{}', 'valid-sig'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.replay).toBe(true)
  })

  it('updates booking with paymentIntentId on checkout.session.completed', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { bookingId: 'booking-1' },
          payment_intent: 'pi_abc',
        },
      },
    })
    mockPrisma.webhookEvent.create.mockResolvedValue({})
    mockPrisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      hours: 2,
      totalAmount: 10000,
      travelerId: 't-1',
      local: { user: { name: 'Maria', email: null } },
      traveler: { name: 'Sam' },
    })

    const res = await POST(makeRequest('{}', 'valid-sig'))
    expect(res.status).toBe(200)
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stripePaymentIntentId: 'pi_abc' }),
      }),
    )
  })
})
