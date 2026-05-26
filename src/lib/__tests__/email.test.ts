import { describe, it, expect, vi } from 'vitest'
import {
  isEmailConfigured,
  sendEmail,
  bookingRequestedTemplate,
  bookingAcceptedTemplate,
  applicationReceivedTemplate,
  applicationApprovedTemplate,
  magicLinkTemplate,
} from '@/lib/email'

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-123' }),
    },
  })),
}))

describe('isEmailConfigured', () => {
  it('returns false when RESEND_API_KEY is not set', () => {
    expect(isEmailConfigured()).toBe(false)
  })
})

describe('sendEmail', () => {
  it('no-ops and returns {skipped: true} when Resend is not configured', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    })
    expect(result).toEqual({ skipped: true })
  })
})

describe('bookingRequestedTemplate', () => {
  const args = {
    localName: 'Maria',
    travelerName: 'Sam',
    hours: 2,
    totalCents: 6600,
    bookingId: 'booking-abc',
  }

  it('subject contains traveler name and hours', () => {
    const { subject } = bookingRequestedTemplate(args)
    expect(subject).toContain('Sam')
    expect(subject).toContain('2h')
  })

  it('html body contains local name and chat link', () => {
    const { html } = bookingRequestedTemplate(args)
    expect(html).toContain('Maria')
    expect(html).toContain('/messages/booking-abc')
  })

  it('text fallback contains booking link', () => {
    const { text } = bookingRequestedTemplate(args)
    expect(text).toContain('/messages/booking-abc')
  })
})

describe('bookingAcceptedTemplate', () => {
  const args = {
    travelerName: 'Sam',
    localName: 'Maria',
    bookingId: 'booking-abc',
  }

  it('subject contains local name', () => {
    const { subject } = bookingAcceptedTemplate(args)
    expect(subject).toContain('Maria')
  })

  it('html body contains traveler name and chat link', () => {
    const { html } = bookingAcceptedTemplate(args)
    expect(html).toContain('Sam')
    expect(html).toContain('/messages/booking-abc')
  })
})

describe('applicationReceivedTemplate', () => {
  it('subject contains applicant name', () => {
    const { subject } = applicationReceivedTemplate({ name: 'Alex' })
    expect(subject).toContain('Alex')
  })

  it('html contains admin review link', () => {
    const { html } = applicationReceivedTemplate({ name: 'Alex' })
    expect(html).toContain('/admin/locals')
  })
})

describe('applicationApprovedTemplate', () => {
  const args = { name: 'Alex', profileUrl: 'http://localhost:3000/local/abc' }

  it('subject contains live', () => {
    const { subject } = applicationApprovedTemplate(args)
    expect(subject).toContain('live')
  })

  it('html contains profile URL', () => {
    const { html } = applicationApprovedTemplate(args)
    expect(html).toContain('http://localhost:3000/local/abc')
  })
})

describe('magicLinkTemplate', () => {
  it('html and text both contain the magic link URL', () => {
    const url = 'http://localhost:3000/api/auth/callback/email?token=abc'
    const { html, text } = magicLinkTemplate({ url })
    expect(html).toContain(url)
    expect(text).toContain(url)
  })
})
