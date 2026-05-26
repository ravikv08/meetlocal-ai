import { describe, it, expect } from 'vitest'
import { formatPrice, initialsFrom, avatarGradient } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats whole-dollar amounts (no decimal places)', () => {
    expect(formatPrice(1000)).toBe('$10')
  })

  it('rounds to nearest dollar', () => {
    expect(formatPrice(1500)).toBe('$15')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })

  it('converts cents correctly for large amounts', () => {
    expect(formatPrice(20000)).toBe('$200')
  })
})

describe('initialsFrom', () => {
  it('returns first letters of two-word name', () => {
    expect(initialsFrom('John Doe')).toBe('JD')
  })

  it('returns single letter for one-word name', () => {
    expect(initialsFrom('Cher')).toBe('C')
  })

  it('uppercases initials', () => {
    expect(initialsFrom('alice bob')).toBe('AB')
  })

  it('takes only first two words of multi-word name', () => {
    expect(initialsFrom('Maria Jose Lopez')).toBe('MJ')
  })
})

describe('avatarGradient', () => {
  it('returns a CSS linear-gradient string', () => {
    const result = avatarGradient('user-123')
    expect(result).toMatch(/^linear-gradient\(/)
  })

  it('is deterministic — same seed always produces same gradient', () => {
    expect(avatarGradient('abc')).toBe(avatarGradient('abc'))
  })

  it('different seeds produce different gradients', () => {
    expect(avatarGradient('user-1')).not.toBe(avatarGradient('user-2'))
  })
})
