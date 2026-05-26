// src/app/api/__tests__/messages.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const mockPrisma = vi.hoisted(() => ({
  booking: { findUnique: vi.fn() },
  message: { create: vi.fn() },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServer: vi.fn().mockReturnValue({
    channel: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue({}),
    }),
  }),
}))
vi.mock('@/lib/supabase', () => ({
  channelForBooking: vi.fn().mockReturnValue('booking:booking-1'),
}))

import { POST } from '@/app/api/messages/route'
import { auth } from '@/auth'

function makeRequest(body: object) {
  return new Request('http://localhost/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const booking = {
  travelerId: 'traveler-1',
  local: { userId: 'local-user-1' },
}

const createdMessage = {
  id: 'msg-1',
  body: 'Hello!',
  senderId: 'traveler-1',
  createdAt: new Date('2025-06-15T12:00:00Z'),
  sender: { name: 'Sam', image: null },
}

describe('POST /api/messages', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const res = await POST(makeRequest({ bookingId: 'b-1', body: 'hi' }))
    expect(res.status).toBe(401)
  })

  it('returns 404 when booking does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(null)
    const res = await POST(makeRequest({ bookingId: 'booking-ghost', body: 'hi' }))
    expect(res.status).toBe(404)
  })

  it('returns 403 when user is not a participant in the booking', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'stranger-99' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'hi' }))
    expect(res.status).toBe(403)
  })

  it('persists message and returns 200 for a valid traveler participant', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.message.create.mockResolvedValue(createdMessage)

    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'Hello!' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.body).toBe('Hello!')
    expect(mockPrisma.message.create).toHaveBeenCalled()
  })

  it('local user can also send messages', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'local-user-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.message.create.mockResolvedValue({ ...createdMessage, senderId: 'local-user-1' })

    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'Welcome!' }))
    expect(res.status).toBe(200)
  })
})
