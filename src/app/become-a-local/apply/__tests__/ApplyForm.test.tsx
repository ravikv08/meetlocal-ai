import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/app/become-a-local/apply/actions', () => ({
  submitApplication: vi.fn().mockResolvedValue(null),
}))

// LiveSelfieCapture uses getUserMedia — returns null to avoid jsdom errors
vi.mock('@/components/LiveSelfieCapture', () => ({
  LiveSelfieCapture: () => null,
}))

// PhotoUpload calls fetch('/api/upload') on file selection — stub it out
vi.mock('@/components/PhotoUpload', () => ({
  PhotoUpload: () => null,
}))

import { ApplyForm } from '@/app/become-a-local/apply/ApplyForm'
import { submitApplication } from '@/app/become-a-local/apply/actions'

const defaultProps = {
  cities: [{ slug: 'bay-area', name: 'Bay Area' }],
  categories: [
    { id: 'food', label: 'Food & drink' },
    { id: 'art', label: 'Art & culture' },
  ],
  currentName: 'Alex Kim',
}

describe('ApplyForm', () => {
  it('shows an error when submitted without selecting any tags', async () => {
    const { container } = render(<ApplyForm {...defaultProps} />)

    // No tags picked, no IC — submit form directly (bypasses button disabled + HTML5 validation)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(screen.getByText(/pick at least one/i)).toBeInTheDocument()
    })
    expect(vi.mocked(submitApplication)).not.toHaveBeenCalled()
  })

  it('shows an error when submitted without accepting the IC agreement', async () => {
    const { container } = render(<ApplyForm {...defaultProps} />)

    // Pick a tag first so tags validation passes
    await userEvent.click(screen.getByRole('button', { name: /food & drink/i }))

    // Submit without checking IC agreement
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      // The link label also contains "Independent Contractor Agreement", so
      // target the error <div> via the "Please review and accept" prefix which
      // is unique to the error message.
      expect(screen.getByText(/please review and accept/i)).toBeInTheDocument()
    })
    expect(vi.mocked(submitApplication)).not.toHaveBeenCalled()
  })

  it('toggles a tag chip on/off when clicked', async () => {
    render(<ApplyForm {...defaultProps} />)

    const foodBtn = screen.getByRole('button', { name: /food & drink/i })

    // Click once to select — text prepends "✓ "
    await userEvent.click(foodBtn)
    expect(foodBtn.textContent).toMatch(/✓/)

    // Click again to deselect — "✓ " removed
    await userEvent.click(foodBtn)
    expect(foodBtn.textContent).not.toMatch(/✓/)
  })

  it('calls submitApplication on a valid submit (tags + IC checked)', async () => {
    const { container } = render(<ApplyForm {...defaultProps} />)

    // Pick a tag
    await userEvent.click(screen.getByRole('button', { name: /food & drink/i }))

    // Check IC agreement checkbox
    const icCheckbox = screen.getByRole('checkbox')
    await userEvent.click(icCheckbox)

    // Now submit form (bypasses HTML5 required validation)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(vi.mocked(submitApplication)).toHaveBeenCalledOnce()
    })
    const fd = vi.mocked(submitApplication).mock.calls[0][0] as FormData
    expect(fd.get('agreedIC')).toBe('1')
    expect(fd.getAll('tags')).toContain('food')
  })
})
