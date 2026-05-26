// src/app/api/__tests__/upload.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/storage', () => ({
  uploadProfilePhoto: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
}))

import { POST } from '@/app/api/upload/route'
import { auth } from '@/auth'

function makeUploadRequest(file: File) {
  const form = new FormData()
  form.append('file', file)
  return new Request('http://localhost/api/upload', { method: 'POST', body: form })
}

describe('POST /api/upload', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null as never)
    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(401)
  })

  it('returns 400 for unsupported MIME type', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const file = new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('unsupported')
  })

  it('returns 413 for a file over 8 MB', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const bigData = new Uint8Array(9 * 1024 * 1024).fill(0)
    const file = new File([bigData], 'big.jpg', { type: 'image/jpeg' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(413)
  })

  it('returns 200 with URL for a valid jpeg upload', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const file = new File(['imgdata'], 'photo.jpg', { type: 'image/jpeg' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://example.com/photo.jpg')
  })

  it('accepts png and webp in addition to jpeg', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    for (const type of ['image/png', 'image/webp'] as const) {
      const file = new File(['data'], 'photo', { type })
      const res = await POST(makeUploadRequest(file))
      expect(res.status).toBe(200)
    }
  })
})
