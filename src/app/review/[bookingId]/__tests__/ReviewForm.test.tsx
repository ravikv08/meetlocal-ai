import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from '@/app/review/[bookingId]/ReviewForm'

const defaultProps = {
  bookingId: 'booking-1',
  subjectId: 'subject-1',
  subjectName: 'Maria Lopez',
  submittedAlready: false,
  ratePerHour: 5000,
  hours: 2,
  reviewerKind: 'traveler' as const,
}

describe('ReviewForm', () => {
  it('shows thank-you screen when submittedAlready is true', () => {
    render(<ReviewForm {...defaultProps} submittedAlready />)
    expect(screen.getByText(/thanks, traveler/i)).toBeInTheDocument()
    // Publish button is not rendered on the thank-you screen
    expect(
      screen.queryByRole('button', { name: /publish review/i }),
    ).not.toBeInTheDocument()
  })

  it('submit button is disabled when no rating is selected', () => {
    render(<ReviewForm {...defaultProps} />)
    const publishBtn = screen.getByRole('button', { name: /publish review/i })
    expect(publishBtn).toBeDisabled()
  })

  it('clicking the 4th star enables the submit button', async () => {
    render(<ReviewForm {...defaultProps} />)

    // Stars are the first 5 buttons (SVG-only, no visible text content)
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter((b) => !b.textContent?.trim()).slice(0, 5)
    expect(starButtons).toHaveLength(5)

    await userEvent.click(starButtons[3]) // 4th star (index 3)

    const publishBtn = screen.getByRole('button', { name: /publish review/i })
    expect(publishBtn).not.toBeDisabled()
  })

  it('calls fetch POST /api/reviews with correct data after clicking the 4th star and submitting', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })

    render(<ReviewForm {...defaultProps} />)

    // 4th star: use text-free buttons to reliably isolate SVG-only star buttons
    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter((b) => !b.textContent?.trim()).slice(0, 5)
    await userEvent.click(starButtons[3]) // 4th star

    // Click submit
    await userEvent.click(screen.getByRole('button', { name: /publish review/i }))

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
        '/api/reviews',
        expect.objectContaining({ method: 'POST' }),
      )
    })

    const call = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse((call[1] as RequestInit).body as string)
    expect(body.rating).toBe(4)
    expect(body.bookingId).toBe('booking-1')
    expect(body.subjectId).toBe('subject-1')
  })

  it('shows the thank-you screen after a successful submit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    })

    render(<ReviewForm {...defaultProps} />)

    const allButtons = screen.getAllByRole('button')
    const starButtons = allButtons.filter((b) => !b.textContent?.trim()).slice(0, 5)
    await userEvent.click(starButtons[4]) // 5th star

    await userEvent.click(screen.getByRole('button', { name: /publish review/i }))

    await waitFor(() => {
      expect(screen.getByText(/thanks, traveler/i)).toBeInTheDocument()
    })
  })
})
