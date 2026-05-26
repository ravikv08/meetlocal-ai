# Test Strategy Design — meetlocal.ai

**Date:** 2026-05-26  
**Status:** Approved  
**Scope:** Backend unit tests (Vitest) + Frontend E2E tests (Playwright)

---

## 1. Context

As of this writing the codebase has **zero test infrastructure** — no test files, no test dependencies, no test scripts. The goal is to establish a full, maintainable test suite covering:

- Financially critical business logic (fee math, booking lifecycle, Stripe idempotency)
- Access-control and authorization guards
- Zod schema validation rules
- Email template correctness
- Full user journeys in a real browser (E2E)

---

## 2. Approach: Layered Mocked Unit + Playwright E2E

Two clearly separated tiers, each with one job:

| Tier | Tool | What it covers | Speed |
|------|------|----------------|-------|
| Unit | Vitest | `src/lib/` functions, API routes — Prisma + Stripe mocked | ~seconds |
| E2E | Playwright | Full browser flows against a running dev/test server | ~minutes |

**Prisma and Stripe are mocked via `vi.mock()`** — no database or Stripe account needed to run unit tests. This is the right trade-off for now: it makes the suite fast and zero-dependency while covering the highest-risk pure logic. Integration tests against a real DB are deferred until the mocked suite is mature.

---

## 3. File Layout

```
meetlocal-ai/
├── src/
│   ├── lib/
│   │   └── __tests__/
│   │       ├── setup.ts                  # Shared: mockPrisma, mockStripe factories
│   │       ├── bookings.test.ts
│   │       ├── bookings-cron.test.ts
│   │       ├── locals.test.ts
│   │       ├── date-utils.test.ts
│   │       ├── utils.test.ts
│   │       ├── feedback.test.ts
│   │       ├── email.test.ts
│   │       ├── stripe.test.ts
│   │       └── storage.test.ts
│   │   └── schemas/
│   │       └── __tests__/
│   │           └── local.schema.test.ts
│   └── app/
│       └── api/
│           └── __tests__/
│               ├── webhook.test.ts
│               ├── reviews.test.ts
│               ├── messages.test.ts
│               └── upload.test.ts
├── tests/
│   └── e2e/
│       ├── booking-flow.spec.ts
│       ├── booking-panel.spec.ts
│       ├── apply-local.spec.ts
│       ├── admin-approval.spec.ts
│       ├── admin-create-local.spec.ts
│       ├── messages.spec.ts
│       └── review-flow.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## 4. Tooling & Configuration

### 4.1 Vitest

**Dependencies to add:**
```json
{
  "devDependencies": {
    "vitest": "^2.x",
    "@vitest/coverage-v8": "^2.x"
  }
}
```

**`vitest.config.ts`:**
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
      exclude: ['src/lib/__tests__/**', 'src/app/api/__tests__/**'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

**npm scripts to add:**
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### 4.2 Playwright

**Dependencies to add:**
```json
{
  "devDependencies": {
    "@playwright/test": "^1.x"
  }
}
```

**`playwright.config.ts`:**
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**npm scripts to add:**
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui"
}
```

### 4.3 Shared Mock Setup (`src/lib/__tests__/setup.ts`)

Exports `mockPrisma` (a `vi.fn()` stub for every Prisma model method used in the codebase) and `mockStripe` (stubs for `checkout.sessions.create`, `paymentIntents.capture`). Each test file imports these and calls `vi.clearAllMocks()` in `beforeEach`.

---

## 5. Backend Unit Test Coverage Plan

### 5.1 `bookings.ts`

| Test | What it verifies |
|------|-----------------|
| Fee math: `subtotal × 0.08 = serviceFee`, `subtotal × 0.03 = taxes`, total is integer | Golden rule #4 — cents only, never floats |
| `platformFee` is 22% of subtotal | Take-rate correctness |
| `createBookingForTraveler` throws when local status is `paused` | Status gate |
| `createBookingForTraveler` throws when local status is `removed` | Status gate |
| `createBookingForTraveler` creates booking with `scheduledFor` matching `resolveScheduledFor` output | Date wire-up |
| `createBookingForTraveler` returns `checkoutUrl: null` when Stripe not configured | Graceful degradation |
| `createBookingForTraveler` returns a Stripe checkout URL when Stripe is configured | Happy path |
| `loadActionableBooking` throws when booking belongs to a different user | Auth guard — prevents cross-user actions |
| `acceptBookingByUser` transitions status `requested → confirmed` | Accept happy path |
| `acceptBookingByUser` throws when booking is not in `requested` status | Idempotency guard |
| `declineBookingByUser` transitions status `requested → declined` | Decline path |
| `markBookingCompletedByUser` transitions status `confirmed → completed` | Completion path |

### 5.2 `bookings-cron.ts`

The stale window is **14 minutes** (`WINDOW_MS = 14 * 60 * 1000`) — must match the UI promise.

| Test | What it verifies |
|------|-----------------|
| Booking created 15 min ago in `requested` status → cancelled | Past the 14-min boundary |
| Booking created 13 min ago in `requested` status → **not** cancelled | Inside the 14-min boundary |
| Does **not** touch bookings in `confirmed`, `completed`, `declined`, or `cancelled` status | Status filter precision |
| When `stripePaymentIntentId` is set, calls `stripe.paymentIntents.cancel()` | Stripe hold released |
| When Stripe cancel fails, booking is still marked `cancelled` and error is collected | Resilience — continues on Stripe error |
| Returns `{ cancelled, ids, errors }` with correct counts | Return shape correctness |

### 5.3 `locals.ts`

| Test | What it verifies |
|------|-----------------|
| `submitLocalApplication` strips `@` prefix from Instagram handle | Handle normalization |
| `submitLocalApplication` accepts handle without `@` prefix | Handle normalization — no double-strip |
| `submitLocalApplication` normalizes valid HTTPS URL | URL normalization |
| `submitLocalApplication` rejects invalid URL (no protocol) | URL guard |
| `createLocalProfileAsAdmin` creates profile with `active` status | Admin fast-path |
| `setLocalProfileStatus` transitions `pending → active` and fires approval email | Status + email side effect |
| `setLocalProfileStatus` transitions `active → paused` with no email | Correct email gate |
| `setLocalVerificationFlag` sets `idVerified` independently of `backgroundChecked` | Granular verification flags |

### 5.4 `date-utils.ts`

| Test | What it verifies |
|------|-----------------|
| `resolveScheduledFor("tonight", "19:00")` returns correct Date for today | Tonight resolution |
| `resolveScheduledFor("tomorrow", "09:00")` returns next-day Date | Tomorrow resolution |
| `resolveScheduledFor("weekend", "10:00")` returns upcoming Saturday | Weekend resolution |
| `resolveScheduledFor("2025-07-04", "14:00")` returns specific ISO date | ISO date input |
| `toCalendarDate` / `fromCalendarDate` round-trip with no date drift | Conversion correctness |
| `formatISODate` / `parseISODate` round-trip: `"2025-07-04"` → Date → `"2025-07-04"` | Serialization correctness |
| `formatRelative` — "just now" for < 1 min, "2h ago", "yesterday", "3 days ago" | Relative time display |
| `startOfDay` returns midnight (00:00:00.000) | Boundary correctness |

### 5.5 `utils.ts`

| Test | What it verifies |
|------|-----------------|
| `formatPrice(1000)` → `"$10.00"` | Cents-to-dollars display |
| `formatPrice(999)` → `"$9.99"` | Non-round cents |
| `formatPrice(0)` → `"$0.00"` | Zero edge case |
| `initialsFrom("John Doe")` → `"JD"` | Two-word name |
| `initialsFrom("Cher")` → `"C"` | Single-name case |
| `avatarGradient` returns the same value for the same input | Deterministic avatar color |

### 5.6 `feedback.ts`

| Test | What it verifies |
|------|-----------------|
| `isPmfAnswer` accepts valid enum values | Input validation |
| `isPmfAnswer` rejects unknown strings | Rejection guard |
| `recordPmfSurvey` calls Prisma with correct `userId` and `answer` | Happy path |
| `hasUserAnsweredPmf` returns `true` when a record exists | De-duplication check |
| `hasUserAnsweredPmf` returns `false` when no record exists | First-time path |
| `recordReportUser` creates a report record with the correct `type` | Safety feature coverage |

### 5.7 `email.ts`

| Test | What it verifies |
|------|-----------------|
| `bookingRequestedTemplate` — subject and body contain traveler name and booking time | Template shape |
| `bookingAcceptedTemplate` — body contains local name and meeting spot | Template shape |
| `applicationReceivedTemplate` — body contains applicant name | Template shape |
| `applicationApprovedTemplate` — body contains a login/dashboard link | Onboarding link present |
| `magicLinkTemplate` — body contains the magic link URL | Dev login template |
| `sendEmail` is a no-op when `RESEND_API_KEY` is not set | Graceful degradation |
| `isEmailConfigured` returns `false` without `RESEND_API_KEY` | Config flag |

### 5.8 `stripe.ts`

| Test | What it verifies |
|------|-----------------|
| `createCheckoutSessionForBooking` passes correct `bookingId` in metadata | Metadata round-trip |
| `createCheckoutSessionForBooking` uses `capture_method: manual` | Golden rule #5 — no auto-capture |
| `isStripeConfigured` returns `false` without `STRIPE_SECRET_KEY` | Config flag |

### 5.9 `storage.ts`

| Test | What it verifies |
|------|-----------------|
| `uploadProfilePhoto` calls Supabase with `profile-photos` bucket | Bucket routing |
| Path is constructed correctly from `userId` | Path format |

### 5.10 `schemas/local.ts`

| Test | What it verifies |
|------|-----------------|
| Valid full application passes `LocalApplicationSchema.parse()` | Happy path |
| Missing required field (e.g. `bio`) throws `ZodError` | Required field enforcement |
| Handle with `@` prefix is accepted (normalized upstream) | Schema permissiveness |
| URL field with no protocol fails | URL format guard |

### 5.11 API Routes

#### `POST /api/stripe/webhook`
| Test | What it verifies |
|------|-----------------|
| Missing `stripe-signature` header → 400 | Auth guard |
| Invalid signature → 400 | Signature verification |
| Duplicate `event.id` (P2002) → `{received: true, replay: true}` | **Idempotency — load-bearing** |
| `checkout.session.completed` updates booking with `stripePaymentIntentId` | Happy path |
| `checkout.session.expired` cancels the booking | Expiry handling |

#### `POST /api/reviews`
| Test | What it verifies |
|------|-----------------|
| First review created — both reviews remain `visible: false` | Blind review — neither visible until both submit |
| Second review created — both reviews flipped to `visible: true` in one transaction | **Golden rule #7 — atomic visibility flip** |
| Unauthenticated request → 401 | Auth guard |

#### `POST /api/messages`
| Test | What it verifies |
|------|-----------------|
| Non-participant sends message → 403 | Auth/ownership guard |
| Message sent on `completed` booking → 400 | Post-completion lockout |
| Authenticated participant → 200 + message persisted | Happy path |

#### `POST /api/upload`
| Test | What it verifies |
|------|-----------------|
| Non-image MIME type (`application/pdf`) → 400 | File type guard |
| File over size limit → 400 | Size guard |
| Valid image upload → 200 + URL returned | Happy path |

---

## 6. Playwright E2E Coverage Plan

All specs run against `http://localhost:3000` with a real browser (Chromium). Auth state is seeded via Playwright's `storageState` — a pre-authenticated session JSON is generated once in `tests/e2e/auth.setup.ts` and reused across specs.

| Spec | User journey covered |
|------|---------------------|
| `booking-flow.spec.ts` | Traveler searches → picks local → chooses hours → confirms booking → sees confirmation page |
| `booking-panel.spec.ts` | Traveler opens local profile → uses BookingPanel date/time picker → submits booking request |
| `apply-local.spec.ts` | User fills ApplyForm (all fields including photo upload) → submits → sees confirmation |
| `admin-approval.spec.ts` | Admin navigates to pending local → reviews application → clicks Approve → status changes to Active |
| `admin-create-local.spec.ts` | Admin uses NewLocalForm to directly create a local profile → profile appears in locals list |
| `messages.spec.ts` | Traveler and local exchange messages in ChatRoom → messages persist on reload |
| `review-flow.spec.ts` | Both traveler and local submit reviews → reviews become visible after second submission |

---

## 7. What Is Explicitly Out of Scope

- **Integration tests against a real database** — deferred until mocked suite is mature
- **GitHub Actions CI** — deferred; tests run locally via npm scripts for now
- **React Testing Library component tests** — the E2E Playwright suite covers the UI layer; RTL would be additive not replacing
- **Visual regression testing** — out of scope for v1

---

## 8. Definition of Done

- `npm test` runs all Vitest unit tests, exits 0, no skipped tests
- `npm run test:e2e` runs all Playwright specs, exits 0
- `npm run test:coverage` produces a coverage report; lib/ functions have ≥ 80% line coverage
- No `any` types introduced in test files (TypeScript strict)
- All mocks are cleared between tests (`vi.clearAllMocks()` in `beforeEach`)
