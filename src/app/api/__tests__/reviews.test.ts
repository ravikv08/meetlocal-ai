// src/app/api/__tests__/reviews.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const mockPrisma = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
  review: {
    upsert: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
  },
  $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops as Promise<unknown>[])),
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST } from '@/app/api/reviews/route'
import { auth } from '@/auth'

function makeReviewRequest(body: object) {
  return new Request('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const booking = {
  travelerId: 'traveler-1',
  local: { userId: 'local-user-1' },
}

describe('POST /api/reviews', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(makeReviewRequest({ bookingId: 'b-1', subjectId: 'u-2', rating: 5 }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when rating is out of range', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 6 }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 403 when user is not a participant in the booking', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'stranger-99' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(403)
  })

  it('keeps both reviews hidden when only the first review is submitted', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.review.upsert.mockResolvedValue({ id: 'rev-1', visible: false })
    mockPrisma.review.findFirst.mockResolvedValue(null) // no counterpart yet

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('flips both reviews visible in a single $transaction when both have submitted', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.review.upsert.mockResolvedValue({ id: 'rev-traveler', visible: false })
    mockPrisma.review.findFirst.mockResolvedValue({ id: 'rev-local', visible: false })

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { visible: true } }),
    )
  })
})
