import { describe, it, expect, vi } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  feedback: {
    create: vi.fn(),
    count: vi.fn(),
  },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import {
  isPmfAnswer,
  recordPmfSurvey,
  recordReportUser,
  hasUserAnsweredPmf,
} from '@/lib/feedback'

describe('isPmfAnswer', () => {
  it('accepts valid answers', () => {
    expect(isPmfAnswer('very')).toBe(true)
    expect(isPmfAnswer('somewhat')).toBe(true)
    expect(isPmfAnswer('not')).toBe(true)
  })

  it('rejects invalid strings', () => {
    expect(isPmfAnswer('yes')).toBe(false)
    expect(isPmfAnswer('')).toBe(false)
    expect(isPmfAnswer('VERY')).toBe(false)
  })
})

describe('recordPmfSurvey', () => {
  it('calls prisma.feedback.create with kind pmf_survey', async () => {
    mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-1' })
    await recordPmfSurvey({ userId: 'user-1', answer: 'very', note: null })
    expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'pmf_survey',
          userId: 'user-1',
          data: expect.objectContaining({ answer: 'very' }),
        }),
      }),
    )
  })
})

describe('recordReportUser', () => {
  it('creates a report_user feedback record', async () => {
    mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-2' })
    await recordReportUser({
      reporterId: 'user-1',
      reportedUserId: 'user-2',
      reason: 'spam',
    })
    expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'report_user',
          userId: 'user-1',
          data: expect.objectContaining({ reportedUserId: 'user-2', reason: 'spam' }),
        }),
      }),
    )
  })
})

describe('hasUserAnsweredPmf', () => {
  it('returns true when feedback count > 0', async () => {
    mockPrisma.feedback.count.mockResolvedValue(1)
    expect(await hasUserAnsweredPmf('user-1')).toBe(true)
  })

  it('returns false when feedback count is 0', async () => {
    mockPrisma.feedback.count.mockResolvedValue(0)
    expect(await hasUserAnsweredPmf('user-1')).toBe(false)
  })
})
