import { describe, it, expect, vi } from 'vitest'

const { mockUpload, mockGetPublicUrl, mockFrom, mockSupabase } = vi.hoisted(() => {
  const mockUpload = vi.fn().mockResolvedValue({ error: null })
  const mockGetPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/profile-photos/user-1/1234567890.jpg' },
  })
  const mockFrom = vi.fn().mockReturnValue({
    upload: mockUpload,
    getPublicUrl: mockGetPublicUrl,
  })
  const mockSupabase = {
    storage: { from: mockFrom },
  }
  return { mockUpload, mockGetPublicUrl, mockFrom, mockSupabase }
})

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServer: vi.fn().mockReturnValue(mockSupabase),
}))

import { uploadProfilePhoto, PROFILE_BUCKET } from '@/lib/storage'

describe('uploadProfilePhoto', () => {
  it('uploads to the profile-photos bucket', async () => {
    await uploadProfilePhoto({
      userId: 'user-1',
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
      buffer: new ArrayBuffer(100),
    })
    expect(mockFrom).toHaveBeenCalledWith(PROFILE_BUCKET)
    expect(mockUpload).toHaveBeenCalled()
  })

  it('constructs path as userId/timestamp.ext', async () => {
    await uploadProfilePhoto({
      userId: 'user-42',
      fileName: 'avatar.png',
      contentType: 'image/png',
      buffer: new ArrayBuffer(100),
    })
    const [path] = mockUpload.mock.calls.at(-1) as [string, ...unknown[]]
    expect(path).toMatch(/^user-42\/\d+\.png$/)
  })

  it('returns the public URL', async () => {
    const url = await uploadProfilePhoto({
      userId: 'user-1',
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
      buffer: new ArrayBuffer(100),
    })
    expect(url).toContain('profile-photos')
  })

  it('throws when Supabase returns an error', async () => {
    mockUpload.mockResolvedValueOnce({ error: { message: 'bucket full' } })
    await expect(
      uploadProfilePhoto({
        userId: 'user-1',
        fileName: 'photo.jpg',
        contentType: 'image/jpeg',
        buffer: new ArrayBuffer(100),
      }),
    ).rejects.toThrow('upload failed: bucket full')
  })
})
