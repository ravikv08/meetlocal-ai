import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ── Supabase mock — must use vi.hoisted so instances survive factory hoisting ──
const mockChannel = vi.hoisted(() => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
}))

const mockSupabase = vi.hoisted(() => ({
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowser: vi.fn().mockReturnValue(mockSupabase),
  channelForBooking: vi.fn().mockReturnValue('booking:test-id'),
}))

vi.mock('@/components/ReportUserButton', () => ({
  ReportUserButton: () => null,
}))

vi.mock('@/components/PmfSurveyCard', () => ({
  PmfSurveyCard: () => null,
}))

import { ChatRoom } from '@/app/messages/[bookingId]/ChatRoom'

const baseProps = {
  bookingId: 'booking-1',
  bookingStatus: 'confirmed' as const,
  hours: 2,
  totalAmount: 11000,
  scheduledFor: null,
  meetingSpotName: null,
  currentUserId: 'user-1',
  currentUserName: 'Sam Chen',
  currentUserImage: null,
  counterpart: { id: 'user-2', name: 'Maria Lopez', image: null },
  role: 'traveler' as const,
  initialMessages: [
    {
      id: 'msg-1',
      body: 'Hello there!',
      senderId: 'user-2',
      senderName: 'Maria Lopez',
      createdAt: '2026-06-01T12:00:00Z',
    },
  ],
}

describe('ChatRoom', () => {
  it('renders initial messages', () => {
    render(<ChatRoom {...baseProps} />)
    expect(screen.getByText('Hello there!')).toBeInTheDocument()
  })

  it('subscribes to the Supabase channel on mount', () => {
    render(<ChatRoom {...baseProps} />)
    expect(mockSupabase.channel).toHaveBeenCalledWith('booking:test-id')
    expect(mockChannel.subscribe).toHaveBeenCalledOnce()
  })

  it('calls removeChannel on unmount', () => {
    const { unmount } = render(<ChatRoom {...baseProps} />)
    unmount()
    expect(mockSupabase.removeChannel).toHaveBeenCalledOnce()
  })

  it('updates the draft input as the user types', async () => {
    render(<ChatRoom {...baseProps} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Quick question')
    expect(input).toHaveValue('Quick question')
  })

  it('clears the input and appends the message after a successful send', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 'msg-new',
        body: 'Quick question',
        senderId: 'user-1',
        senderName: 'Sam Chen',
        createdAt: '2026-06-01T13:00:00Z',
      }),
    })

    render(<ChatRoom {...baseProps} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Quick question')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
        '/api/messages',
        expect.objectContaining({ method: 'POST' }),
      )
      expect(input).toHaveValue('')
      expect(screen.getByText('Quick question')).toBeInTheDocument()
    })
  })

  it('re-populates the draft when the send fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })

    render(<ChatRoom {...baseProps} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'Oops message')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(input).toHaveValue('Oops message')
    })
  })
})
