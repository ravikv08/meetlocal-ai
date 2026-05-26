import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhotoUpload } from '@/components/PhotoUpload'

describe('PhotoUpload', () => {
  it('renders a file input', () => {
    render(<PhotoUpload name="photoUrl" />)
    // FileTrigger renders a hidden <input type="file">
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
  })

  it('shows the upload button label', () => {
    render(<PhotoUpload name="photoUrl" />)
    expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument()
  })

  it('shows a preview img after a successful file selection', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ url: 'https://example.com/photo.jpg' }),
    })

    render(<PhotoUpload name="photoUrl" />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      const preview = screen.getByAltText('upload preview')
      expect(preview).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })
  })

  it('shows an error message when the upload fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: 'file too large' }),
    })

    render(<PhotoUpload name="photoUrl" />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })

    await userEvent.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText('file too large')).toBeInTheDocument()
    })
  })

  it('shows existing photo when initialUrl is provided', () => {
    render(<PhotoUpload name="photoUrl" initialUrl="https://example.com/existing.jpg" />)
    const img = screen.getByAltText('upload preview')
    expect(img).toHaveAttribute('src', 'https://example.com/existing.jpg')
  })
})
