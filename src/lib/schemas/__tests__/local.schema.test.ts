import { describe, it, expect } from 'vitest'
import { LocalApplicationSchema, SetLocalStatusSchema, SetVerificationFlagSchema } from '@/lib/schemas/local'

const validApplication = {
  city: 'miami',
  neighborhood: 'Wynwood',
  tagline: 'Your Miami insider guide',
  bio: 'I have lived in Miami for 10 years and know all the hidden gems in the city.',
  ratePerHourDollars: 50,
  residency: 'rooted' as const,
  yearsInCity: 10,
  tags: ['food'],
  languages: ['English'],
  dateOfBirth: '1990-01-01',
  governmentIdUrl: 'https://example.com/id.jpg',
  selfieUrl: 'https://example.com/selfie.jpg',
}

describe('LocalApplicationSchema', () => {
  it('accepts a fully valid application', () => {
    expect(() => LocalApplicationSchema.parse(validApplication)).not.toThrow()
  })

  it('rejects missing bio', () => {
    const { bio: _bio, ...rest } = validApplication
    expect(() => LocalApplicationSchema.parse(rest)).toThrow()
  })

  it('rejects bio shorter than 40 characters', () => {
    expect(() =>
      LocalApplicationSchema.parse({ ...validApplication, bio: 'Too short.' }),
    ).toThrow('Bio is a bit short')
  })

  it('rejects rate below $15', () => {
    expect(() =>
      LocalApplicationSchema.parse({ ...validApplication, ratePerHourDollars: 10 }),
    ).toThrow('at least $15')
  })

  it('rejects invalid city slug', () => {
    expect(() =>
      LocalApplicationSchema.parse({ ...validApplication, city: 'atlantis' }),
    ).toThrow('Invalid city')
  })

  it('rejects applicant under 18', () => {
    const dob = new Date()
    dob.setFullYear(dob.getFullYear() - 17)
    expect(() =>
      LocalApplicationSchema.parse({
        ...validApplication,
        dateOfBirth: dob.toISOString().split('T')[0],
      }),
    ).toThrow('18+')
  })

  it('requires at least one tag', () => {
    expect(() =>
      LocalApplicationSchema.parse({ ...validApplication, tags: [] }),
    ).toThrow()
  })

  it('accepts handle with @ prefix', () => {
    expect(() =>
      LocalApplicationSchema.parse({ ...validApplication, instagramHandle: '@handle' }),
    ).not.toThrow()
  })
})

describe('SetLocalStatusSchema', () => {
  it('accepts valid status values', () => {
    expect(() => SetLocalStatusSchema.parse({ id: 'lp-1', status: 'active' })).not.toThrow()
    expect(() => SetLocalStatusSchema.parse({ id: 'lp-1', status: 'paused' })).not.toThrow()
  })

  it('rejects unknown status', () => {
    expect(() => SetLocalStatusSchema.parse({ id: 'lp-1', status: 'banned' })).toThrow()
  })
})

describe('SetVerificationFlagSchema', () => {
  it('accepts valid flag names', () => {
    expect(() =>
      SetVerificationFlagSchema.parse({ id: 'lp-1', flag: 'idVerified', value: true }),
    ).not.toThrow()
    expect(() =>
      SetVerificationFlagSchema.parse({ id: 'lp-1', flag: 'bgChecked', value: false }),
    ).not.toThrow()
  })

  it('rejects unknown flag name', () => {
    expect(() =>
      SetVerificationFlagSchema.parse({ id: 'lp-1', flag: 'fakeFlag', value: true }),
    ).toThrow()
  })
})
