import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  startOfDay,
  toCalendarDate,
  fromCalendarDate,
  formatISODate,
  parseISODate,
  formatRelative,
} from '@/lib/date-utils'

const FIXED_NOW = new Date(2025, 5, 15, 12, 0, 0) // June 15, 2025 noon

describe('startOfDay', () => {
  it('returns midnight of the given date', () => {
    const d = new Date(2025, 5, 15, 14, 30, 45, 999)
    const result = startOfDay(d)
    expect(result.getHours()).toBe(0)
    expect(result.getMinutes()).toBe(0)
    expect(result.getSeconds()).toBe(0)
    expect(result.getMilliseconds()).toBe(0)
  })

  it('does not mutate the input date', () => {
    const d = new Date(2025, 5, 15, 14, 0)
    startOfDay(d)
    expect(d.getHours()).toBe(14)
  })
})

describe('toCalendarDate / fromCalendarDate', () => {
  it('round-trips ISO date with no drift', () => {
    const iso = '2025-07-04'
    const cal = toCalendarDate(iso)
    expect(cal).not.toBeNull()
    expect(fromCalendarDate(cal!)).toBe(iso)
  })

  it('returns null for null input', () => {
    expect(toCalendarDate(null)).toBeNull()
  })

  it('returns null for invalid date string', () => {
    expect(toCalendarDate('not-a-date')).toBeNull()
  })
})

describe('formatISODate / parseISODate', () => {
  it('round-trips YYYY-MM-DD with no drift', () => {
    const iso = '2025-07-04'
    const parsed = parseISODate(iso)
    expect(formatISODate(parsed)).toBe(iso)
  })

  it('parseISODate uses local timezone (not UTC)', () => {
    const d = parseISODate('2025-07-04')
    expect(d.getMonth()).toBe(6)  // July (0-indexed)
    expect(d.getDate()).toBe(4)
  })
})

describe('formatRelative', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Today" for today\'s date', () => {
    expect(formatRelative('2025-06-15')).toBe('Today')
  })

  it('returns "Tomorrow" for tomorrow', () => {
    expect(formatRelative('2025-06-16')).toBe('Tomorrow')
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(formatRelative('2025-06-14')).toBe('Yesterday')
  })

  it('returns a locale string for other dates', () => {
    const result = formatRelative('2025-06-20')
    expect(result).toMatch(/Jun/)
  })
})
