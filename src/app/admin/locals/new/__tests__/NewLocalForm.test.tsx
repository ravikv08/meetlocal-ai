import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/app/admin/locals/new/actions', () => ({
  createLocalAsAdmin: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/components/PhotoUpload', () => ({
  PhotoUpload: () => null,
}))

import { NewLocalForm } from '@/app/admin/locals/new/NewLocalForm'
import { createLocalAsAdmin } from '@/app/admin/locals/new/actions'

const defaultProps = {
  cities: [{ slug: 'bay-area', name: 'Bay Area' }],
  categories: [
    { id: 'food', label: 'Food & drink' },
    { id: 'art', label: 'Art & culture' },
  ],
  candidateUsers: [{ id: 'user-1', name: 'Sam Chen', email: 'sam@example.com' }],
}

describe('NewLocalForm', () => {
  it('defaults to existing-user mode when candidateUsers are present', () => {
    render(<NewLocalForm {...defaultProps} />)
    // In existing mode the "Pick a user" select combobox is visible.
    // Field renders a <label> wrapping a <Label> span + the select, so the
    // implicit accessible name is "Pick a user".
    expect(screen.getByRole('combobox', { name: /pick a user/i })).toBeInTheDocument()
    // New-mode placeholder inputs are NOT visible
    expect(screen.queryByPlaceholderText(/Carla M/i)).not.toBeInTheDocument()
  })

  it('switches to new-placeholder mode when that button is clicked', async () => {
    render(<NewLocalForm {...defaultProps} />)

    await userEvent.click(screen.getByRole('button', { name: /new placeholder/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Carla M/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/carla@meetlocal/i)).toBeInTheDocument()
    })
    expect(screen.queryByRole('combobox', { name: /pick a user/i })).not.toBeInTheDocument()
  })

  it('activate checkbox is checked by default', () => {
    render(<NewLocalForm {...defaultProps} />)
    // Only one type="checkbox" in the entire form — the "Activate immediately" checkbox.
    // Language buttons are type="button", not checkboxes.
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('calls createLocalAsAdmin when the form is submitted with a tag selected', async () => {
    const { container } = render(<NewLocalForm {...defaultProps} />)

    // Pick a category so the tags guard doesn't block submission
    await userEvent.click(screen.getByRole('button', { name: /food & drink/i }))

    // fireEvent.submit bypasses HTML5 required-field validation on the jsdom
    // elements (city select defaultValue="", neighborhood, tagline, bio, etc.)
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => {
      expect(vi.mocked(createLocalAsAdmin)).toHaveBeenCalledOnce()
    })
    const fd = vi.mocked(createLocalAsAdmin).mock.calls[0][0] as FormData
    expect(fd.get('mode')).toBe('existing')
    expect(fd.getAll('tags')).toContain('food')
  })
})
