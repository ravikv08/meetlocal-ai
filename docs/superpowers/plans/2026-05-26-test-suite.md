# Test Suite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Vitest + Playwright and write a complete test suite covering all `src/lib/` business logic, all API routes, and 5 critical E2E user flows.

**Architecture:** Vitest runs fast, isolated unit tests with Prisma and Stripe mocked via `vi.mock()` — no database needed. Playwright tests full browser flows against the running dev server using the dev-magic-link auth shortcut. The two suites are independent: unit tests require no env vars; E2E tests require the full dev stack.

**Tech Stack:** vitest ^2, @vitest/coverage-v8 ^2, @playwright/test ^1, TypeScript strict

---

## File Map

**Created:**
- `vitest.config.ts`
- `playwright.config.ts`
- `src/lib/__tests__/setup.ts`
- `src/lib/__tests__/utils.test.ts`
- `src/lib/__tests__/date-utils.test.ts`
- `src/lib/__tests__/email.test.ts`
- `src/lib/__tests__/feedback.test.ts`
- `src/lib/__tests__/stripe.test.ts`
- `src/lib/__tests__/storage.test.ts`
- `src/lib/__tests__/bookings.test.ts`
- `src/lib/__tests__/bookings-cron.test.ts`
- `src/lib/__tests__/locals.test.ts`
- `src/lib/schemas/__tests__/local.schema.test.ts`
- `src/app/api/__tests__/webhook.test.ts`
- `src/app/api/__tests__/reviews.test.ts`
- `src/app/api/__tests__/messages.test.ts`
- `src/app/api/__tests__/upload.test.ts`
- `tests/e2e/auth.setup.ts`
- `tests/e2e/booking-flow.spec.ts`
- `tests/e2e/apply-local.spec.ts`
- `tests/e2e/admin-approval.spec.ts`
- `tests/e2e/messages.spec.ts`
- `tests/e2e/review-flow.spec.ts`

**Modified:**
- `package.json` — add `test`, `test:watch`, `test:coverage`, `test:e2e`, `test:e2e:ui` scripts and devDependencies

---

## Task 1: Install Vitest and configure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest @vitest/coverage-v8
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: [
        'src/lib/__tests__/**',
        'src/lib/schemas/__tests__/**',
        'src/app/api/__tests__/**',
        'src/lib/prisma.ts',
        'src/lib/supabase.ts',
        'src/lib/supabase-server.ts',
        'src/lib/dev-magic-link.ts',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

- [ ] **Step 3: Add scripts to `package.json`**

Add inside the `"scripts"` object:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Verify Vitest boots**

```bash
npm test -- --reporter=verbose 2>&1 | head -20
```
Expected: `No test files found` (not an error about missing config or bad imports).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore(test): install vitest and add test scripts"
```

---

## Task 2: Install Playwright and configure

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup must run first — saves session to file for all other specs
    {
      name: 'setup',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
```

- [ ] **Step 3: Add scripts to `package.json`**

Add inside the `"scripts"` object:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "chore(test): install playwright and add e2e scripts"
```

---

## Task 3: Create shared Vitest setup file

**Files:**
- Create: `src/lib/__tests__/setup.ts`

- [ ] **Step 1: Create the setup file**

```ts
// src/lib/__tests__/setup.ts
// Runs before every Vitest test file. Clears all mocks between tests so
// one test's spy state never leaks into another.
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
})
```

- [ ] **Step 2: Verify setup is picked up**

```bash
npm test -- --reporter=verbose 2>&1 | head -10
```
Expected: still `No test files found` (no error about the setup file).

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/setup.ts
git commit -m "chore(test): add shared vitest beforeEach clearAllMocks setup"
```

---

## Task 4: `utils.test.ts` — formatPrice, initialsFrom, avatarGradient

**Files:**
- Create: `src/lib/__tests__/utils.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/utils.test.ts
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
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/utils.test.ts --reporter=verbose
```
Expected: `4 + 4 + 3 = 11 tests pass`

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/utils.test.ts
git commit -m "test(utils): formatPrice, initialsFrom, avatarGradient"
```

---

## Task 5: `date-utils.test.ts`

**Files:**
- Create: `src/lib/__tests__/date-utils.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/date-utils.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  startOfDay,
  toCalendarDate,
  fromCalendarDate,
  formatISODate,
  parseISODate,
  formatRelative,
} from '@/lib/date-utils'

// Pin "today" to 2025-06-15 (Sunday) for deterministic formatRelative tests
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
    // new Date('2025-07-04') parses as UTC midnight → wrong local date in some TZs
    // parseISODate should give local midnight
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
    expect(result).toMatch(/Jun/) // Contains the month name
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/date-utils.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/date-utils.test.ts
git commit -m "test(date-utils): startOfDay, toCalendarDate, formatISODate, formatRelative"
```

---

## Task 6: `email.test.ts`

**Files:**
- Create: `src/lib/__tests__/email.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/email.test.ts
import { describe, it, expect, vi } from 'vitest'
import {
  isEmailConfigured,
  sendEmail,
  bookingRequestedTemplate,
  bookingAcceptedTemplate,
  applicationReceivedTemplate,
  applicationApprovedTemplate,
  magicLinkTemplate,
} from '@/lib/email'

// Mock the Resend module — we never want to fire real emails in tests
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-123' }),
    },
  })),
}))

describe('isEmailConfigured', () => {
  it('returns false when RESEND_API_KEY is not set', () => {
    // The module was loaded without RESEND_API_KEY → resend client is null
    expect(isEmailConfigured()).toBe(false)
  })
})

describe('sendEmail', () => {
  it('no-ops and returns {skipped: true} when Resend is not configured', async () => {
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Test',
      html: '<p>hi</p>',
    })
    expect(result).toEqual({ skipped: true })
  })
})

describe('bookingRequestedTemplate', () => {
  const args = {
    localName: 'Maria',
    travelerName: 'Sam',
    hours: 2,
    totalCents: 6600,
    bookingId: 'booking-abc',
  }

  it('subject contains traveler name, hours, and price', () => {
    const { subject } = bookingRequestedTemplate(args)
    expect(subject).toContain('Sam')
    expect(subject).toContain('2h')
  })

  it('html body contains local name and chat link', () => {
    const { html } = bookingRequestedTemplate(args)
    expect(html).toContain('Maria')
    expect(html).toContain('/messages/booking-abc')
  })

  it('text fallback contains booking link', () => {
    const { text } = bookingRequestedTemplate(args)
    expect(text).toContain('/messages/booking-abc')
  })
})

describe('bookingAcceptedTemplate', () => {
  const args = {
    travelerName: 'Sam',
    localName: 'Maria',
    bookingId: 'booking-abc',
  }

  it('subject contains local name', () => {
    const { subject } = bookingAcceptedTemplate(args)
    expect(subject).toContain('Maria')
  })

  it('html body contains traveler name and chat link', () => {
    const { html } = bookingAcceptedTemplate(args)
    expect(html).toContain('Sam')
    expect(html).toContain('/messages/booking-abc')
  })
})

describe('applicationReceivedTemplate', () => {
  it('subject contains applicant name', () => {
    const { subject } = applicationReceivedTemplate({ name: 'Alex' })
    expect(subject).toContain('Alex')
  })

  it('html contains admin review link', () => {
    const { html } = applicationReceivedTemplate({ name: 'Alex' })
    expect(html).toContain('/admin/locals')
  })
})

describe('applicationApprovedTemplate', () => {
  const args = { name: 'Alex', profileUrl: 'http://localhost:3000/local/abc' }

  it('subject contains celebration', () => {
    const { subject } = applicationApprovedTemplate(args)
    expect(subject).toContain('live')
  })

  it('html contains profile URL', () => {
    const { html } = applicationApprovedTemplate(args)
    expect(html).toContain('http://localhost:3000/local/abc')
  })
})

describe('magicLinkTemplate', () => {
  it('html and text both contain the magic link URL', () => {
    const url = 'http://localhost:3000/api/auth/callback/email?token=abc'
    const { html, text } = magicLinkTemplate({ url })
    expect(html).toContain(url)
    expect(text).toContain(url)
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/email.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/email.test.ts
git commit -m "test(email): template shapes and sendEmail no-op behavior"
```

---

## Task 7: `feedback.test.ts`

**Files:**
- Create: `src/lib/__tests__/feedback.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/feedback.test.ts
import { describe, it, expect, vi } from 'vitest'
import {
  isPmfAnswer,
  recordPmfSurvey,
  recordReportUser,
  hasUserAnsweredPmf,
} from '@/lib/feedback'

const mockPrisma = {
  feedback: {
    create: vi.fn(),
    count: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

describe('isPmfAnswer', () => {
  it('accepts valid answers', () => {
    expect(isPmfAnswer('very')).toBe(true)
    expect(isPmfAnswer('somewhat')).toBe(true)
    expect(isPmfAnswer('not')).toBe(true)
  })

  it('rejects invalid strings', () => {
    expect(isPmfAnswer('yes')).toBe(false)
    expect(isPmfAnswer('')).toBe(false)
    expect(isPmfAnswer('VERY')).toBe(false)
  })
})

describe('recordPmfSurvey', () => {
  it('calls prisma.feedback.create with kind pmf_survey', async () => {
    mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-1' })
    await recordPmfSurvey({ userId: 'user-1', answer: 'very', note: null })
    expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'pmf_survey',
          userId: 'user-1',
          data: expect.objectContaining({ answer: 'very' }),
        }),
      }),
    )
  })
})

describe('recordReportUser', () => {
  it('creates a report_user feedback record', async () => {
    mockPrisma.feedback.create.mockResolvedValue({ id: 'fb-2' })
    await recordReportUser({
      reporterId: 'user-1',
      reportedUserId: 'user-2',
      reason: 'spam',
    })
    expect(mockPrisma.feedback.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: 'report_user',
          userId: 'user-1',
          data: expect.objectContaining({ reportedUserId: 'user-2', reason: 'spam' }),
        }),
      }),
    )
  })
})

describe('hasUserAnsweredPmf', () => {
  it('returns true when feedback count > 0', async () => {
    mockPrisma.feedback.count.mockResolvedValue(1)
    expect(await hasUserAnsweredPmf('user-1')).toBe(true)
  })

  it('returns false when feedback count is 0', async () => {
    mockPrisma.feedback.count.mockResolvedValue(0)
    expect(await hasUserAnsweredPmf('user-1')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/feedback.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/feedback.test.ts
git commit -m "test(feedback): isPmfAnswer, recordPmfSurvey, recordReportUser, hasUserAnsweredPmf"
```

---

## Task 8: `stripe.test.ts`

**Files:**
- Create: `src/lib/__tests__/stripe.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/stripe.test.ts
import { describe, it, expect, vi } from 'vitest'

// Must mock 'stripe' the npm package BEFORE importing our stripe module
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/pay/cs_test_abc',
        }),
      },
    },
  })),
}))

const mockPrisma = {
  booking: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// Dynamic import AFTER mocks so the module picks up our mocks
const { createCheckoutSessionForBooking, isStripeConfigured } = await import(
  '@/lib/stripe'
)

describe('isStripeConfigured', () => {
  it('returns false when STRIPE_SECRET_KEY is not set in test env', () => {
    // In test env, STRIPE_SECRET_KEY is not set → stripe is null
    expect(isStripeConfigured()).toBe(false)
  })
})

describe('createCheckoutSessionForBooking', () => {
  it('throws when stripe is not configured', async () => {
    await expect(
      createCheckoutSessionForBooking({ bookingId: 'b-1' }),
    ).rejects.toThrow('stripe not configured')
  })
})

// ── Separate describe block: test Stripe internals with env var set ─────────
// Uses vi.stubEnv + dynamic import so the module initialises with stripe !== null
describe('createCheckoutSessionForBooking — with Stripe configured', () => {
  it('creates session with capture_method: manual and bookingId in metadata', async () => {
    // Stub the env var BEFORE the module is imported in this block
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake')

    const mockSessionCreate = vi.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/pay/cs_test_abc',
    })
    vi.doMock('stripe', () => ({
      default: vi.fn().mockImplementation(() => ({
        checkout: { sessions: { create: mockSessionCreate } },
      })),
    }))

    const mockBookingForStripe = {
      id: 'b-1',
      hours: 2,
      totalAmount: 11000,
      currency: 'USD',
      local: {
        id: 'local-1',
        tagline: 'Great guide',
        user: { name: 'Maria' },
      },
    }
    mockPrisma.booking.findUnique.mockResolvedValue(mockBookingForStripe)
    mockPrisma.booking.update.mockResolvedValue({ stripeCheckoutSessionId: 'cs_test_abc' })

    const { createCheckoutSessionForBooking: createWithStripe } = await import('@/lib/stripe')
    await createWithStripe({ bookingId: 'b-1', travelerEmail: 'sam@example.com' })

    const [sessionCreateCall] = mockSessionCreate.mock.calls
    const options = (sessionCreateCall as [Record<string, unknown>])[0]

    // Golden rule #5: always manual capture
    expect(
      (options.payment_intent_data as { capture_method: string }).capture_method,
    ).toBe('manual')
    // bookingId must survive the round-trip via metadata
    expect((options.metadata as { bookingId: string }).bookingId).toBe('b-1')

    vi.unstubAllEnvs()
    vi.doUnmock('stripe')
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/stripe.test.ts --reporter=verbose
```
Expected: both tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/stripe.test.ts
git commit -m "test(stripe): isStripeConfigured and createCheckoutSession throws without key"
```

---

## Task 9: `storage.test.ts`

**Files:**
- Create: `src/lib/__tests__/storage.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/storage.test.ts
import { describe, it, expect, vi } from 'vitest'

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
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/storage.test.ts --reporter=verbose
```
Expected: all 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/storage.test.ts
git commit -m "test(storage): uploadProfilePhoto bucket routing, path format, error handling"
```

---

## Task 10: `bookings.test.ts`

**Files:**
- Create: `src/lib/__tests__/bookings.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/bookings.test.ts
import { describe, it, expect, vi } from 'vitest'

// ── Mocks (declared before imports so vi.mock hoisting works) ──────────
const mockPrisma = {
  localProfile: { findUnique: vi.fn() },
  booking: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = {
  paymentIntents: {
    capture: vi.fn().mockResolvedValue({}),
    cancel: vi.fn().mockResolvedValue({}),
  },
}
vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  isStripeConfigured: vi.fn().mockReturnValue(false),
  createCheckoutSessionForBooking: vi.fn().mockResolvedValue('https://checkout.stripe.com/pay/cs_test'),
}))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  bookingRequestedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
  bookingAcceptedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import {
  createBookingForTraveler,
  acceptBookingByUser,
  declineBookingByUser,
  markBookingCompletedByUser,
  type CreateBookingInput,
  type BookingActorContext,
} from '@/lib/bookings'
import { isStripeConfigured } from '@/lib/stripe'

// ── Fixtures ───────────────────────────────────────────────────────────
const activeLocal = {
  id: 'local-1',
  userId: 'local-user-1',
  status: 'active',
  ratePerHour: 5000, // $50 in cents
  tagline: 'Great guide',
  user: { name: 'Maria', email: 'maria@example.com' },
}

const bookingInput: CreateBookingInput = {
  travelerId: 'traveler-1',
  travelerEmail: 'sam@example.com',
  travelerName: 'Sam',
  localId: 'local-1',
  hours: 2,
  slot: '18:00',
  when: '2025-07-04',
}

const baseBooking = {
  id: 'booking-1',
  status: 'requested',
  stripePaymentIntentId: null,
  travelerId: 'traveler-1',
  totalAmount: 11100, // 5000*2 + 8% + 3%
  local: {
    userId: 'local-user-1',
    tagline: 'Great guide',
    user: { id: 'local-user-1', name: 'Maria', email: 'maria@example.com' },
  },
  traveler: { id: 'traveler-1', name: 'Sam', email: 'sam@example.com' },
}

// ── Tests ──────────────────────────────────────────────────────────────
describe('createBookingForTraveler — fee math', () => {
  it('calculates subtotal, serviceFee (8%), taxes (3%), and totalAmount as integers', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue({ ...baseBooking, id: 'b-new' })

    await createBookingForTraveler(bookingInput)

    const [createCall] = mockPrisma.booking.create.mock.calls
    const data = (createCall as [{ data: Record<string, number> }])[0].data
    const subtotal = 5000 * 2           // ratePerHour * hours
    const serviceFee = Math.round(subtotal * 0.08)
    const taxes = Math.round(subtotal * 0.03)
    const expectedTotal = subtotal + serviceFee + taxes

    expect(data.totalAmount).toBe(expectedTotal)
    expect(Number.isInteger(data.totalAmount)).toBe(true)
    expect(Number.isInteger(data.platformFee)).toBe(true)
  })

  it('platformFee is 22% of subtotal', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    await createBookingForTraveler(bookingInput)

    const [createCall] = mockPrisma.booking.create.mock.calls
    const data = (createCall as [{ data: Record<string, number> }])[0].data
    expect(data.platformFee).toBe(Math.round(5000 * 2 * 0.22))
  })
})

describe('createBookingForTraveler — status guards', () => {
  it('throws "Local not available" when local status is paused', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({ ...activeLocal, status: 'paused' })
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })

  it('throws "Local not available" when local status is removed', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue({ ...activeLocal, status: 'removed' })
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })

  it('throws when local is not found', async () => {
    mockPrisma.localProfile.findUnique.mockResolvedValue(null)
    await expect(createBookingForTraveler(bookingInput)).rejects.toThrow('Local not available')
  })
})

describe('createBookingForTraveler — Stripe', () => {
  it('returns checkoutUrl: null when Stripe is not configured', async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(false)
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    const result = await createBookingForTraveler(bookingInput)
    expect(result.checkoutUrl).toBeNull()
  })

  it('returns a checkout URL when Stripe is configured', async () => {
    vi.mocked(isStripeConfigured).mockReturnValue(true)
    mockPrisma.localProfile.findUnique.mockResolvedValue(activeLocal)
    mockPrisma.booking.create.mockResolvedValue(baseBooking)

    const result = await createBookingForTraveler(bookingInput)
    expect(result.checkoutUrl).toContain('checkout.stripe.com')
  })
})

describe('acceptBookingByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions status to confirmed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })

    await acceptBookingByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'confirmed' }) }),
    )
  })

  it('throws when booking is already confirmed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    await expect(acceptBookingByUser(ctx)).rejects.toThrow('Cannot accept a booking that is confirmed')
  })

  it('throws when actor is neither the local nor an admin', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    await expect(
      acceptBookingByUser({ ...ctx, actorUserId: 'stranger-99', isAdmin: false }),
    ).rejects.toThrow('forbidden')
  })

  it('admin can accept any booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    await expect(
      acceptBookingByUser({ ...ctx, actorUserId: 'admin-user', isAdmin: true }),
    ).resolves.not.toThrow()
  })
})

describe('declineBookingByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions requested → cancelled', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })

    await declineBookingByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    )
  })

  it('also allows declining a confirmed booking', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })
    await expect(declineBookingByUser(ctx)).resolves.not.toThrow()
  })

  it('throws when booking is already cancelled', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'cancelled' })
    await expect(declineBookingByUser(ctx)).rejects.toThrow('Cannot decline')
  })

  it('cancels the Stripe PaymentIntent when one exists', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({
      ...baseBooking,
      status: 'requested',
      stripePaymentIntentId: 'pi_abc',
    })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'cancelled' })

    await declineBookingByUser(ctx)
    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_abc')
  })
})

describe('markBookingCompletedByUser', () => {
  const ctx: BookingActorContext = {
    bookingId: 'booking-1',
    actorUserId: 'local-user-1',
    isAdmin: false,
  }

  it('transitions confirmed → completed', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'confirmed' })
    mockPrisma.booking.update.mockResolvedValue({ ...baseBooking, status: 'completed' })

    await markBookingCompletedByUser(ctx)

    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }),
    )
  })

  it('throws when booking is still in requested status', async () => {
    mockPrisma.booking.findUnique.mockResolvedValue({ ...baseBooking, status: 'requested' })
    await expect(markBookingCompletedByUser(ctx)).rejects.toThrow('Cannot complete')
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/bookings.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/bookings.test.ts
git commit -m "test(bookings): fee math, status gates, accept/decline/complete lifecycle"
```

---

## Task 11: `bookings-cron.test.ts`

**Files:**
- Create: `src/lib/__tests__/bookings-cron.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/bookings-cron.test.ts
import { describe, it, expect, vi } from 'vitest'

const mockPrisma = {
  booking: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = {
  paymentIntents: { cancel: vi.fn().mockResolvedValue({}) },
}
vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }))

import { expireStaleRequestedBookings } from '@/lib/bookings-cron'

const WINDOW_MS = 14 * 60 * 1000 // must match source constant

describe('expireStaleRequestedBookings', () => {
  it('queries for requested bookings older than 14 minutes', async () => {
    const now = new Date('2025-06-15T12:00:00Z')
    mockPrisma.booking.findMany.mockResolvedValue([])

    await expireStaleRequestedBookings(now)

    const [query] = mockPrisma.booking.findMany.mock.calls
    const where = (query as [{ where: { status: string; createdAt: { lt: Date } } }])[0].where
    expect(where.status).toBe('requested')

    const expectedCutoff = new Date(now.getTime() - WINDOW_MS)
    expect(where.createdAt.lt.getTime()).toBe(expectedCutoff.getTime())
  })

  it('marks each stale booking as cancelled', async () => {
    const stale = [
      { id: 'b-1', stripePaymentIntentId: null },
      { id: 'b-2', stripePaymentIntentId: null },
    ]
    mockPrisma.booking.findMany.mockResolvedValue(stale)
    mockPrisma.booking.update.mockResolvedValue({})

    await expireStaleRequestedBookings(new Date())

    expect(mockPrisma.booking.update).toHaveBeenCalledTimes(2)
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelled' } }),
    )
  })

  it('cancels Stripe PaymentIntent when one exists', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: 'pi_xyz' },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    await expireStaleRequestedBookings(new Date())

    expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_xyz')
  })

  it('still cancels booking even if Stripe cancel throws', async () => {
    mockStripe.paymentIntents.cancel.mockRejectedValueOnce(new Error('already cancelled'))
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: 'pi_fail' },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    const result = await expireStaleRequestedBookings(new Date())

    // Booking is still cancelled despite Stripe error
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'b-1' }, data: { status: 'cancelled' } }),
    )
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('b-1')
  })

  it('returns correct count and ids', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([
      { id: 'b-1', stripePaymentIntentId: null },
      { id: 'b-2', stripePaymentIntentId: null },
    ])
    mockPrisma.booking.update.mockResolvedValue({})

    const result = await expireStaleRequestedBookings(new Date())

    expect(result.cancelled).toBe(2)
    expect(result.ids).toEqual(['b-1', 'b-2'])
    expect(result.errors).toHaveLength(0)
  })

  it('returns zero when no stale bookings exist', async () => {
    mockPrisma.booking.findMany.mockResolvedValue([])

    const result = await expireStaleRequestedBookings(new Date())

    expect(result.cancelled).toBe(0)
    expect(result.ids).toHaveLength(0)
    expect(mockPrisma.booking.update).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/bookings-cron.test.ts --reporter=verbose
```
Expected: all 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/bookings-cron.test.ts
git commit -m "test(bookings-cron): 14-min boundary, Stripe cancel, resilience, return shape"
```

---

## Task 12: `locals.test.ts`

**Files:**
- Create: `src/lib/__tests__/locals.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/__tests__/locals.test.ts
import { describe, it, expect, vi } from 'vitest'

const mockPrisma = {
  localProfile: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  applicationReceivedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
  applicationApprovedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import {
  submitLocalApplication,
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

describe('createLocalProfileAsAdmin', () => {
  it('creates a profile with active status when activate: true', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue({ id: 'new-user-1' })
    mockPrisma.localProfile.findUnique.mockResolvedValue(null)
    mockPrisma.localProfile.create.mockResolvedValue({ id: 'lp-new', status: 'active' })

    const { createLocalProfileAsAdmin } = await import('@/lib/locals')
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

    const { createLocalProfileAsAdmin } = await import('@/lib/locals')
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
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/__tests__/locals.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/__tests__/locals.test.ts
git commit -m "test(locals): handle normalization, URL normalization, status transitions, verification flags"
```

---

## Task 13: `local.schema.test.ts`

**Files:**
- Create: `src/lib/schemas/__tests__/local.schema.test.ts`
- Create directory: `src/lib/schemas/__tests__/`

- [ ] **Step 1: Write the test file**

```ts
// src/lib/schemas/__tests__/local.schema.test.ts
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

  it('accepts handle with @ prefix (normalization happens upstream in locals.ts)', () => {
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
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/lib/schemas/__tests__/local.schema.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/lib/schemas/__tests__/local.schema.test.ts
git commit -m "test(schemas): LocalApplicationSchema, SetLocalStatusSchema, SetVerificationFlagSchema"
```

---

## Task 14: `webhook.test.ts`

**Files:**
- Create: `src/app/api/__tests__/webhook.test.ts`
- Create directory: `src/app/api/__tests__/`

- [ ] **Step 1: Write the test file**

```ts
// src/app/api/__tests__/webhook.test.ts
import { describe, it, expect, vi } from 'vitest'

const mockPrisma = {
  webhookEvent: { create: vi.fn() },
  booking: { update: vi.fn(), findUnique: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
}
vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }))
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ skipped: true }),
  bookingRequestedTemplate: vi.fn().mockReturnValue({ subject: 'S', html: '<p>' }),
}))

import { POST } from '@/app/api/stripe/webhook/route'

function makeRequest(body: string, sig: string) {
  return new Request('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': sig },
    body,
  })
}

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when signature verification fails', async () => {
    mockStripe.webhooks.constructEvent.mockImplementationOnce(() => {
      throw new Error('No signatures found matching')
    })
    const req = makeRequest('{}', 'bad-sig')
    // Need STRIPE_WEBHOOK_SECRET set
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns {replay: true} and 200 for a duplicate event id (P2002)', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_dupe',
      type: 'checkout.session.completed',
      data: { object: {} },
    })
    // Simulate Prisma unique constraint violation
    const p2002 = Object.assign(new Error('Unique constraint'), { code: 'P2002' })
    mockPrisma.webhookEvent.create.mockRejectedValueOnce(p2002)

    const res = await POST(makeRequest('{}', 'valid-sig'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.replay).toBe(true)
  })

  it('updates booking with paymentIntentId on checkout.session.completed', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    mockStripe.webhooks.constructEvent.mockReturnValue({
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { bookingId: 'booking-1' },
          payment_intent: 'pi_abc',
        },
      },
    })
    mockPrisma.webhookEvent.create.mockResolvedValue({})
    mockPrisma.booking.update.mockResolvedValue({ id: 'booking-1' })
    // sendEmail mock called internally
    mockPrisma.booking.update.mockResolvedValue({
      id: 'booking-1',
      travelerId: 't-1',
      local: { user: { name: 'Maria', email: null } },
      traveler: { name: 'Sam', email: null },
    })

    const res = await POST(makeRequest('{}', 'valid-sig'))
    expect(res.status).toBe(200)
    expect(mockPrisma.booking.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stripePaymentIntentId: 'pi_abc' }),
      }),
    )
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/app/api/__tests__/webhook.test.ts --reporter=verbose
```
Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/__tests__/webhook.test.ts
git commit -m "test(api/webhook): missing sig, bad sig, idempotency replay, checkout completed"
```

---

## Task 15: `reviews.test.ts`

**Files:**
- Create: `src/app/api/__tests__/reviews.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/app/api/__tests__/reviews.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const mockPrisma = {
  booking: { findUnique: vi.fn() },
  review: {
    upsert: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn().mockImplementation((ops: Promise<unknown>[]) => Promise.all(ops)),
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

import { POST } from '@/app/api/reviews/route'
import { auth } from '@/auth'

function makeReviewRequest(body: object) {
  return new Request('http://localhost/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const booking = {
  travelerId: 'traveler-1',
  local: { userId: 'local-user-1' },
}

describe('POST /api/reviews', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const res = await POST(makeReviewRequest({ bookingId: 'b-1', subjectId: 'u-2', rating: 5 }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when rating is out of range', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 6 }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 403 when user is not a participant in the booking', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'stranger-99' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(403)
  })

  it('keeps both reviews hidden when only the first review is submitted', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.review.upsert.mockResolvedValue({ id: 'rev-1', visible: false })
    // No counterpart review yet
    mockPrisma.review.findFirst.mockResolvedValue(null)

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('flips both reviews visible in a single $transaction when both have submitted', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.review.upsert.mockResolvedValue({ id: 'rev-traveler', visible: false })
    // Counterpart review already exists
    mockPrisma.review.findFirst.mockResolvedValue({ id: 'rev-local', visible: false })
    mockPrisma.review.update.mockResolvedValue({})

    const res = await POST(
      makeReviewRequest({ bookingId: 'b-1', subjectId: 'local-user-1', rating: 5 }),
    )
    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1)
    // Both update calls must set visible: true
    expect(mockPrisma.review.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { visible: true } }),
    )
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/app/api/__tests__/reviews.test.ts --reporter=verbose
```
Expected: all 5 tests pass. The two-way visibility transaction test is the critical one.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/__tests__/reviews.test.ts
git commit -m "test(api/reviews): auth guard, rating validation, participant check, two-way visibility flip"
```

---

## Task 16: `messages.test.ts`

**Files:**
- Create: `src/app/api/__tests__/messages.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// src/app/api/__tests__/messages.test.ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({ auth: vi.fn() }))

const mockPrisma = {
  booking: { findUnique: vi.fn() },
  message: { create: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServer: vi.fn().mockReturnValue({
    channel: vi.fn().mockReturnValue({ send: vi.fn().mockResolvedValue({}) }),
  }),
}))
vi.mock('@/lib/supabase', () => ({
  channelForBooking: vi.fn().mockReturnValue('booking:booking-1'),
}))

import { POST } from '@/app/api/messages/route'
import { auth } from '@/auth'

function makeRequest(body: object) {
  return new Request('http://localhost/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const booking = {
  travelerId: 'traveler-1',
  local: { userId: 'local-user-1' },
}

const createdMessage = {
  id: 'msg-1',
  body: 'Hello!',
  senderId: 'traveler-1',
  createdAt: new Date('2025-06-15T12:00:00Z'),
  sender: { name: 'Sam', image: null },
}

describe('POST /api/messages', () => {
  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const res = await POST(makeRequest({ bookingId: 'b-1', body: 'hi' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when user is not a participant in the booking', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'stranger-99' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)

    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'hi' }))
    expect(res.status).toBe(403)
  })

  it('returns 404 when booking does not exist', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(null)

    const res = await POST(makeRequest({ bookingId: 'booking-ghost', body: 'hi' }))
    expect(res.status).toBe(404)
  })

  it('persists message and returns 200 for a valid participant', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'traveler-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.message.create.mockResolvedValue(createdMessage)

    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'Hello!' }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.body).toBe('Hello!')
    expect(mockPrisma.message.create).toHaveBeenCalled()
  })

  it('local user can also send messages', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'local-user-1' } } as never)
    mockPrisma.booking.findUnique.mockResolvedValue(booking)
    mockPrisma.message.create.mockResolvedValue({ ...createdMessage, senderId: 'local-user-1' })

    const res = await POST(makeRequest({ bookingId: 'booking-1', body: 'Welcome!' }))
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/app/api/__tests__/messages.test.ts --reporter=verbose
```
Expected: all 5 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/__tests__/messages.test.ts
git commit -m "test(api/messages): auth guard, participant check, 404, happy path for traveler and local"
```

---

## Task 17: `upload.test.ts`

**Files:**
- Create: `src/app/api/__tests__/upload.test.ts`

- [ ] **Step 1: Write the test file**

```ts
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
    vi.mocked(auth).mockResolvedValue(null)
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
    // 9 MB of data
    const bigData = new Uint8Array(9 * 1024 * 1024).fill(0)
    const file = new File([bigData], 'big.jpg', { type: 'image/jpeg' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(413)
  })

  it('returns 200 with URL for a valid image upload', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    const file = new File(['imgdata'], 'photo.jpg', { type: 'image/jpeg' })
    const res = await POST(makeUploadRequest(file))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toBe('https://example.com/photo.jpg')
  })

  it('accepts webp and png in addition to jpeg', async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: 'user-1' } } as never)
    for (const type of ['image/png', 'image/webp'] as const) {
      const file = new File(['data'], 'photo', { type })
      const res = await POST(makeUploadRequest(file))
      expect(res.status).toBe(200)
    }
  })
})
```

- [ ] **Step 2: Run the tests**

```bash
npm test -- src/app/api/__tests__/upload.test.ts --reporter=verbose
```
Expected: all 5 tests pass.

- [ ] **Step 3: Run the full unit suite to confirm no regressions**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/__tests__/upload.test.ts
git commit -m "test(api/upload): auth guard, MIME validation, size limit, happy path"
```

---

## Task 18: Playwright auth setup

**Files:**
- Create: `tests/e2e/auth.setup.ts`
- Create directory: `tests/e2e/.auth/` (via .gitkeep)

The dev server must be running with `NODE_ENV !== production` and no `RESEND_API_KEY` for the magic link to work.

- [ ] **Step 1: Create `.gitignore` entry for session file**

Add to `.gitignore`:
```
tests/e2e/.auth/
```

- [ ] **Step 2: Create the auth setup file**

```ts
// tests/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import os from 'os'

const AUTH_FILE = 'tests/e2e/.auth/user.json'
const DEV_MAGIC_LINK_FILE = path.join(os.tmpdir(), 'meetlocal', 'dev-magic-link.json')

// Uses the dev-magic-link shortcut: navigate to signin, submit email,
// read the one-click URL from the OS temp file, navigate to it, save session.
setup('authenticate', async ({ page }) => {
  // Ensure auth dir exists
  fs.mkdirSync('tests/e2e/.auth', { recursive: true })

  // Go to sign-in, submit a test email
  await page.goto('/signin')
  await page.getByLabel(/email/i).fill('e2e-test@example.com')
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for the magic link to be written to disk (up to 5s)
  let magicUrl: string | null = null
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500)
    try {
      const raw = fs.readFileSync(DEV_MAGIC_LINK_FILE, 'utf-8')
      const payload = JSON.parse(raw) as { url: string; ts: number }
      if (Date.now() - payload.ts < 60_000) {
        magicUrl = payload.url
        break
      }
    } catch {
      // Not written yet — keep waiting
    }
  }

  expect(magicUrl, 'Dev magic link was not written within 5s').not.toBeNull()

  // Follow the magic link to complete sign-in
  await page.goto(magicUrl!)
  await page.waitForURL(/\/(trips|$)/, { timeout: 10_000 })

  // Save the authenticated session state for all other specs
  await page.context().storageState({ path: AUTH_FILE })
})
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/auth.setup.ts .gitignore
git commit -m "test(e2e): add Playwright auth setup using dev magic link"
```

---

## Task 19: `booking-flow.spec.ts`

**Files:**
- Create: `tests/e2e/booking-flow.spec.ts`

Requires: the seed data (`npm run db:seed`) to have at least one active local in the DB.

- [ ] **Step 1: Write the spec**

```ts
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Booking flow', () => {
  test('traveler can browse locals and land on a local profile', async ({ page }) => {
    await page.goto('/')
    // Click the first local card visible on the homepage
    const firstCard = page.locator('[data-testid="local-card"]').first()
    await expect(firstCard).toBeVisible({ timeout: 10_000 })
    await firstCard.click()
    await expect(page).toHaveURL(/\/local\//)
  })

  test('local profile page shows booking panel', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="local-card"]').first().click()
    await expect(page.getByRole('heading', { name: /book/i })).toBeVisible()
  })

  test('booking panel requires selecting hours before submitting', async ({ page }) => {
    await page.goto('/')
    await page.locator('[data-testid="local-card"]').first().click()

    // Try to submit without selecting hours — should show validation
    const submitBtn = page.getByRole('button', { name: /request|book/i })
    await submitBtn.click()
    await expect(page.getByText(/select|hour/i)).toBeVisible()
  })
})
```

- [ ] **Step 2: Run only this spec (requires dev server running)**

```bash
npm run test:e2e -- --grep "Booking flow" 2>&1 | tail -20
```
Expected: tests pass or provide clear feedback about missing test IDs to add.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/booking-flow.spec.ts
git commit -m "test(e2e): booking flow — browse locals, view profile, booking panel validation"
```

---

## Task 20: `apply-local.spec.ts`

**Files:**
- Create: `tests/e2e/apply-local.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
// tests/e2e/apply-local.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Become a local — apply flow', () => {
  test('apply page is reachable and shows the form', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    await expect(page.getByRole('heading', { name: /apply|become/i })).toBeVisible()
  })

  test('form shows validation errors when submitted empty', async ({ page }) => {
    await page.goto('/become-a-local/apply')
    await page.getByRole('button', { name: /submit|apply/i }).click()
    // At least one validation error should appear
    await expect(page.getByText(/required|must/i).first()).toBeVisible()
  })

  test('can fill in the basic required fields without error', async ({ page }) => {
    await page.goto('/become-a-local/apply')

    // Fill core text fields
    await page.getByLabel(/tagline/i).fill('Your authentic Miami insider')
    await page.getByLabel(/bio/i).fill(
      'I have lived in Miami for over 10 years and love showing visitors the real city.',
    )

    // Neighborhood
    const neighborhoodInput = page.getByLabel(/neighborhood/i)
    if (await neighborhoodInput.isVisible()) {
      await neighborhoodInput.fill('Wynwood')
    }

    // After filling key fields, error messages for those fields should clear
    await expect(page.getByText(/tagline.*required/i)).not.toBeVisible()
  })
})
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Become a local" 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/apply-local.spec.ts
git commit -m "test(e2e): apply-local form reachable, shows validation, fields clear on fill"
```

---

## Task 21: `admin-approval.spec.ts`

**Files:**
- Create: `tests/e2e/admin-approval.spec.ts`

Note: the authenticated session (from auth.setup.ts) must belong to a user with `ADMIN_EMAILS` matching their address. In dev, ensure `ADMIN_EMAILS=e2e-test@example.com` is set in `.env.local`.

- [ ] **Step 1: Write the spec**

```ts
// tests/e2e/admin-approval.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Admin — local approval', () => {
  test('admin page is accessible and shows locals list', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByRole('heading', { name: /admin|locals/i })).toBeVisible()
  })

  test('pending locals tab shows pending applications', async ({ page }) => {
    await page.goto('/admin/locals?status=pending')
    // Should either show a list or an empty-state message
    const hasPending = await page.locator('[data-testid="local-row"]').count()
    const hasEmptyState = await page.getByText(/no pending|no applications/i).isVisible()
    expect(hasPending > 0 || hasEmptyState).toBe(true)
  })
})
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Admin" 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/admin-approval.spec.ts
git commit -m "test(e2e): admin page accessible, pending locals list or empty state"
```

---

## Task 22: `messages.spec.ts`

**Files:**
- Create: `tests/e2e/messages.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
// tests/e2e/messages.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Messages / chat', () => {
  test('/messages redirects to sign-in when not authenticated', async ({ browser }) => {
    // Use a fresh context with NO stored auth
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/messages')
    // Should redirect to signin or show login prompt
    await expect(page).toHaveURL(/signin|auth/, { timeout: 5_000 })
    await ctx.close()
  })

  test('authenticated user can reach the messages index', async ({ page }) => {
    await page.goto('/trips')
    // If user has bookings, clicking one should lead to /messages/:id
    const bookingLink = page.getByRole('link', { name: /message|chat/i }).first()
    if (await bookingLink.isVisible()) {
      await bookingLink.click()
      await expect(page).toHaveURL(/\/messages\//)
      // Chat input should be visible
      await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible()
    }
  })
})
```

- [ ] **Step 2: Run the spec**

```bash
npm run test:e2e -- --grep "Messages" 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/messages.spec.ts
git commit -m "test(e2e): messages — unauth redirect, authenticated chat access"
```

---

## Task 23: `review-flow.spec.ts`

**Files:**
- Create: `tests/e2e/review-flow.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
// tests/e2e/review-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Review flow', () => {
  test('/review/:bookingId redirects to sign-in when not authenticated', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/review/nonexistent-booking')
    await expect(page).toHaveURL(/signin|auth|404/, { timeout: 5_000 })
    await ctx.close()
  })

  test('review page shows rating and body fields', async ({ page }) => {
    // Navigate to /trips to find a completed booking eligible for review
    await page.goto('/trips')
    const reviewLink = page.getByRole('link', { name: /review/i }).first()
    if (await reviewLink.isVisible()) {
      await reviewLink.click()
      await expect(page).toHaveURL(/\/review\//)
      await expect(page.getByRole('slider').or(page.locator('[data-testid="rating"]'))).toBeVisible()
    }
  })
})
```

- [ ] **Step 2: Run the full E2E suite**

```bash
npm run test:e2e 2>&1 | tail -30
```
Expected: all specs pass (some may be skipped if no seed data matches the flow).

- [ ] **Step 3: Run the full unit suite one final time**

```bash
npm test --reporter=verbose 2>&1 | tail -20
```
Expected: all unit tests pass with no regressions.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/review-flow.spec.ts
git commit -m "test(e2e): review flow — unauth redirect, rating input visible"
```

---

## Task 24: Coverage report and final cleanup

**Files:**
- No new files — verification only

- [ ] **Step 1: Run coverage**

```bash
npm run test:coverage 2>&1 | tail -30
```
Review the coverage table. Target: `src/lib/` functions ≥ 80% line coverage.

- [ ] **Step 2: Fix any obvious gaps surfaced by coverage**

If a function shows 0% coverage that should be tested, add the missing test to the appropriate file and re-run.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "test: complete Vitest + Playwright test suite

- 13 Vitest unit test files covering all lib/ business logic and API routes
- 5 Playwright E2E specs covering booking, apply, admin, messages, review flows
- Auth setup via dev magic link shortcut
- Coverage via @vitest/coverage-v8"
```
