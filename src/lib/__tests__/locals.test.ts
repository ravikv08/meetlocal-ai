import { describe, it, expect, vi } from 'vitest'

const mockPrisma = vi.hoisted(() => ({
  localProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}))
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  applicationReceivedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
  applicationApprovedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import {
  submitLocalApplication,
  createLocalProfileAsAdmin,
  setLocalProfileStatus,
  setLocalVerificationFlag,
} from '@/lib/locals'
import { sendEmail } from '@/lib/email'
import type { LocalApplicationInput } from '@/lib/schemas/local'

const baseApplicationInput: LocalApplicationInput = {
  city: 'miami',
  neighborhood: 'Wynwood',
  tagline: 'Your Miami insider guide',
  bio: 'I have lived in Miami for 10 years and know all the hidden gems.',
  ratePerHourDollars: 50,
  residency: 'rooted',
  yearsInCity: 10,
  tags: ['food'],
  languages: ['English'],
  dateOfBirth: '1990-01-01',
  governmentIdUrl: 'https://example.com/id.jpg',
  selfieUrl: 'https://example.com/selfie.jpg',
}

describe('submitLocalApplication — handle normalization', () => {
  it('strips @ prefix from Instagram handle', async () => {
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-1' })

    await submitLocalApplication({
      userId: 'user-1',
      adminEmails: [],
      input: { ...baseApplicationInput, instagramHandle: '@miami_maria' },
    })

    const [call] = mockPrisma.localProfile.create.mock.calls
    const data = (call as [{ data: { instagramHandle: string } }])[0].data
    expect(data.instagramHandle).toBe('miami_maria')
  })

  it('accepts handle without @ prefix unchanged', async () => {
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-1' })

    await submitLocalApplication({
      userId: 'user-1',
      adminEmails: [],
      input: { ...baseApplicationInput, instagramHandle: 'miami_maria' },
    })

    const [call] = mockPrisma.localProfile.create.mock.calls
    const data = (call as [{ data: { instagramHandle: string } }])[0].data
    expect(data.instagramHandle).toBe('miami_maria')
  })

  it('stores null when handle is empty string', async () => {
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-1' })

    await submitLocalApplication({
      userId: 'user-1',
      adminEmails: [],
      input: { ...baseApplicationInput, instagramHandle: '' },
    })

    const [call] = mockPrisma.localProfile.create.mock.calls
    const data = (call as [{ data: { instagramHandle: string | null } }])[0].data
    expect(data.instagramHandle).toBeNull()
  })
})

describe('submitLocalApplication — URL normalization', () => {
  it('stores valid HTTPS URL as-is', async () => {
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-1' })

    await submitLocalApplication({
      userId: 'user-1',
      adminEmails: [],
      input: { ...baseApplicationInput, linkedinUrl: 'https://linkedin.com/in/maria' },
    })

    const [call] = mockPrisma.localProfile.create.mock.calls
    const data = (call as [{ data: { linkedinUrl: string } }])[0].data
    expect(data.linkedinUrl).toBe('https://linkedin.com/in/maria')
  })

  it('stores null for URL without http/https protocol', async () => {
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-1' })

    await submitLocalApplication({
      userId: 'user-1',
      adminEmails: [],
      input: { ...baseApplicationInput, websiteUrl: 'not-a-url' },
    })

    const [call] = mockPrisma.localProfile.create.mock.calls
    const data = (call as [{ data: { websiteUrl: string | null } }])[0].data
    expect(data.websiteUrl).toBeNull()
  })
})

describe('createLocalProfileAsAdmin', () => {
  it('creates a profile with active status when activate: true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user-1' })
    mockPrisma.localProfile.findUnique.mockResolvedValue(null)
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-new', status: 'active' })

    const result = await createLocalProfileAsAdmin({
      mode: 'new',
      newEmail: 'newlocal@example.com',
      newName: 'New Local',
      city: 'miami',
      neighborhood: 'Wynwood',
      tagline: 'Your Miami guide',
      bio: 'Ten years showing visitors the real Miami gems.',
      ratePerHourDollars: 50,
      residency: 'rooted',
      yearsInCity: 10,
      tags: ['food'],
      languages: ['English'],
      activate: true,
    })

    expect(mockPrisma.localProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'active' }) }),
    )
    expect(result.profile.status).toBe('active')
  })

  it('throws when the user already has a local profile', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' })
    mockPrisma.localProfile.findUnique.mockResolvedValue({ id: 'lp-existing' })

    await expect(
      createLocalProfileAsAdmin({
        mode: 'new',
        newEmail: 'existing@example.com',
        newName: 'Existing',
        city: 'miami',
        neighborhood: 'Wynwood',
        tagline: 'Your Miami guide',
        bio: 'Ten years showing visitors the real Miami gems.',
        ratePerHourDollars: 50,
        residency: 'rooted',
        yearsInCity: 10,
        tags: ['food'],
        languages: ['English'],
        activate: false,
      }),
    ).rejects.toThrow('already has a local profile')
  })
})

describe('setLocalProfileStatus', () => {
  it('updates status in the database', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({
      id: 'lp-1',
      status: 'pending',
      user: { name: 'Maria', email: 'maria@example.com' },
    })
    mockPrisma.localProfile.update.mockResolvedValue({})

    await setLocalProfileStatus({
      input: { id: 'lp-1', status: 'active' },
      baseUrl: 'http://localhost:3000',
    })

    expect(mockPrisma.localProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'active' } }),
    )
  })

  it('sends approval email on first activation (pending → active)', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({
      id: 'lp-1',
      status: 'pending',
      user: { name: 'Maria', email: 'maria@example.com' },
    })
    mockPrisma.localProfile.update.mockResolvedValue({})

    await setLocalProfileStatus({
      input: { id: 'lp-1', status: 'active' },
      baseUrl: 'http://localhost:3000',
    })

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'maria@example.com' }),
    )
  })

  it('does NOT send email when transitioning active → paused', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({
      id: 'lp-1',
      status: 'active',
      user: { name: 'Maria', email: 'maria@example.com' },
    })
    mockPrisma.localProfile.update.mockResolvedValue({})

    await setLocalProfileStatus({
      input: { id: 'lp-1', status: 'paused' },
      baseUrl: 'http://localhost:3000',
    })

    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('throws not found when local profile does not exist', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(null)

    await expect(
      setLocalProfileStatus({
        input: { id: 'lp-missing', status: 'active' },
        baseUrl: 'http://localhost:3000',
      }),
    ).rejects.toThrow('not found')
  })
})

describe('setLocalVerificationFlag', () => {
  it('updates only the specified flag field', async () => {
    mockPrisma.localProfile.update.mockResolvedValue({})

    await setLocalVerificationFlag({ id: 'lp-1', flag: 'idVerified', value: true })

    expect(mockPrisma.localProfile.update).toHaveBeenCalledWith({
      where: { id: 'lp-1' },
      data: { idVerified: true },
    })
  })

  it('can set bgChecked independently of idVerified', async () => {
    mockPrisma.localProfile.update.mockResolvedValue({})

    await setLocalVerificationFlag({ id: 'lp-1', flag: 'bgChecked', value: true })

    const [call] = mockPrisma.localProfile.update.mock.calls
    const data = (call as [{ data: Record<string, unknown> }])[0].data
    expect(data).toEqual({ bgChecked: true })
    expect(data.idVerified).toBeUndefined()
  })
})
