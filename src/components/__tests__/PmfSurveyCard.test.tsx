import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/lib/feedback-actions', () => ({
  submitPmfSurvey: vi.fn().mockResolvedValue(null),
}))

import { PmfSurveyCard } from '@/components/PmfSurveyCard'
import { submitPmfSurvey } from '@/lib/feedback-actions'

describe('PmfSurveyCard', () => {
  it('renders three answer options', () => {
    render(<PmfSurveyCard />)
    expect(screen.getByRole('button', { name: /very disappointed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /somewhat disappointed/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /not disappointed/i })).toBeInTheDocument()
  })

  it('calls submitPmfSurvey when an option is clicked', async () => {
    render(<PmfSurveyCard bookingId="booking-1" />)

    await userEvent.click(screen.getByRole('button', { name: /very disappointed/i }))

    await waitFor(() => {
      expect(vi.mocked(submitPmfSurvey)).toHaveBeenCalledOnce()
    })
    // The FormData passed should contain answer=very
    const fd = vi.mocked(submitPmfSurvey).mock.calls[0][0] as FormData
    expect(fd.get('answer')).toBe('very')
    expect(fd.get('bookingId')).toBe('booking-1')
  })

  it('shows the thank-you message after submission', async () => {
    render(<PmfSurveyCard />)

    await userEvent.click(screen.getByRole('button', { name: /somewhat disappointed/i }))

    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument()
    })
  })

  it('hides the card when Skip is clicked', async () => {
    const { container } = render(<PmfSurveyCard />)
    await userEvent.click(screen.getByRole('button', { name: /skip/i }))
    // The component returns null when hidden
    expect(container).toBeEmptyDOMElement()
  })
})
