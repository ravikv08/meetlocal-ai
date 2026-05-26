# Frontend Test Strategy Design — meetlocal.ai

**Date:** 2026-05-26  
**Status:** Approved  
**Scope:** React Testing Library component tests (Vitest + jsdom) + Playwright E2E hardening

---

## 1. Context

The backend unit test suite (116 tests, Vitest node environment) is complete and passing. This spec extends coverage to the frontend: 14 component test files using React Testing Library in a jsdom environment, plus improvements to the 5 existing Playwright E2E specs and 2 new ones.

---

## 2. Approach: Vitest + jsdom + RTL (Approach A)

Two clearly separated tiers — the existing node tier is untouched:

| Tier | Config | What it covers | Speed |
|------|--------|----------------|-------|
| Unit (existing) | `vitest.config.ts` | `src/lib/`, `src/app/api/` — Prisma + Stripe mocked | ~seconds |
| Component (new) | `vitest.component.config.ts` | React components — server actions + fetch + Supabase mocked | ~seconds |
| E2E (existing + improved) | `playwright.config.ts` | Full browser flows against running dev server | ~minutes |

**Why jsdom over Vitest Browser Mode:** The goal is testing *behavior* — form validation fires, state transitions render correctly, server actions are called with the right arguments. jsdom is fast, well-understood, and exactly right for interaction logic. Pixel accuracy and CSS layout are not goals.

---

## 3. File Layout

```
meetlocal-ai/
├── vitest.component.config.ts          # NEW — jsdom config for component tests
├── src/
│   ├── test-utils/
│   │   └── setup-rtl.ts                # NEW — jest-dom + next/* mocks
│   ├── components/
│   │   └── __tests__/
│   │       ├── LocalCard.test.tsx
│   │       ├── SearchBar.test.tsx
│   │       ├── Avatar.test.tsx
│   │       ├── PhotoUpload.test.tsx
│   │       ├── DatePicker.test.tsx
│   │       ├── PmfSurveyCard.test.tsx
│   │       └── BookingActionBar.test.tsx
│   └── app/
│       ├── local/[id]/
│       │   └── __tests__/
│       │       └── BookingPanel.test.tsx
│       ├── become-a-local/apply/
│       │   └── __tests__/
│       │       └── ApplyForm.test.tsx
│       ├── messages/[bookingId]/
│       │   └── __tests__/
│       │       └── ChatRoom.test.tsx
│       ├── review/[bookingId]/
│       │   └── __tests__/
│       │       └── ReviewForm.test.tsx
│       ├── book/[localId]/
│       │   └── __tests__/
│       │       └── BookingDateField.test.tsx
│       └── admin/locals/new/
│           └── __tests__/
│               └── NewLocalForm.test.tsx
└── tests/
    └── e2e/
        ├── booking-panel.spec.ts         # NEW
        └── trips.spec.ts                 # NEW
        (+ 5 existing specs hardened)
```

---

## 4. Tooling & Configuration

### 4.1 New dependencies

```json
{
  "devDependencies": {
    "@vitejs/plugin-react": "^4.x",
    "@testing-library/react": "^16.x",
    "@testing-library/user-event": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^26.x"
  }
}
```

### 4.2 `vitest.component.config.ts`

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-utils/setup-rtl.ts'],
    include: ['src/**/__tests__/**/*.test.tsx'],
    exclude: ['node_modules', 'tests/e2e/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

### 4.3 New npm scripts

```json
{
  "test:components": "vitest run --config vitest.component.config.ts",
  "test:components:watch": "vitest --config vitest.component.config.ts"
}
```

### 4.4 `src/test-utils/setup-rtl.ts`

```ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Next.js navigation — overridable per test via vi.mocked(useRouter).mockReturnValue(...)
vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: vi.fn().mockReturnValue('/'),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}))

// next/link — render as plain <a> (no Next.js router context needed)
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('a', { href, ...rest }, children),
}))

// next/image — render as plain <img>
vi.mock('next/image', () => ({
  default: ({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) =>
    React.createElement('img', { src, alt, ...rest }),
}))
```

---

## 5. Mocking Strategy

### 5.1 Server actions (BookingPanel, ApplyForm, NewLocalForm)

Mocked per test file as `vi.fn()`:

```ts
vi.mock('@/app/book/[localId]/actions', () => ({
  createBooking: vi.fn().mockResolvedValue({ checkoutUrl: null }),
}))
```

### 5.2 `fetch` calls (ChatRoom → `/api/messages`, ReviewForm → `/api/reviews`)

Patched on `globalThis` per test:

```ts
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({
    id: 'msg-1',
    body: 'Hello!',
    senderName: 'Sam',
    createdAt: '2025-01-01T00:00:00Z',
  }),
})
```

### 5.3 Supabase browser client (ChatRoom)

```ts
vi.mock('@/lib/supabase', () => ({
  getSupabaseBrowser: vi.fn().mockReturnValue({
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    }),
    removeChannel: vi.fn(),
  }),
  channelForBooking: vi.fn().mockReturnValue('booking:test-id'),
}))
```

### 5.4 Not mocked

- `@/lib/utils`, `@/lib/date-utils` — pure functions, use real implementations
- `lucide-react` — renders as SVG in jsdom, no issues

---

## 6. Component Test Coverage Plan

### 6.1 Forms (highest risk)

#### `BookingPanel.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Renders with defaults | 3 hours selected, today's date, price summary visible |
| Hours button updates price | Clicking "4 hours" recalculates and renders updated total |
| Submit calls `createBooking` | `FormData` contains `localId`, `hours`, `slot`, `date` |
| Pending state disables submit | Button disabled / shows loading indicator while action runs |
| Server action error shows message | Error text appears when `createBooking` rejects |

#### `ApplyForm.test.tsx`

| Test | What it verifies |
|------|-----------------|
| IC agreement required | Submitting without checking shows an error |
| Tag toggle adds/removes | Clicking a tag chip toggles it in/out of selection |
| Submit calls server action | Server action invoked once on valid submit |

#### `ReviewForm.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Already-submitted state | When `submittedAlready=true`, form not rendered |
| Submit disabled without rating | Button disabled when `rating === 0` |
| Star click enables submit | Clicking 4th star sets rating, enables button |
| Submit calls fetch | `POST /api/reviews` called with `rating`, `bookingId`, `subjectId` |

#### `NewLocalForm.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Mode toggle | "existing user" shows email field; "new user" shows name + email |
| Activate checked by default | Activate checkbox is checked on first render |
| Submit calls server action | Server action invoked on submit |

### 6.2 Real-time

#### `ChatRoom.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Renders initial messages | Messages passed as props appear in the list |
| Supabase channel lifecycle | `subscribe()` called on mount; `removeChannel()` called on unmount |
| Typing updates draft | Textarea value reflects input |
| Submit sends message | `fetch('/api/messages', ...)` called; input cleared after send |
| Optimistic update | Message appears in list before server responds |
| Enter key submits | Pressing Enter (no Shift) calls fetch |

### 6.3 Display components

#### `LocalCard.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Renders name and city | `local.user.name` and city name visible |
| Correct price | `formatPrice(ratePerHour)` rendered |
| Link target | `<a href="/local/{id}">` present |
| ID verified badge | "ID verified" badge visible when `idVerified=true`, hidden when false |

#### `SearchBar.test.tsx`

| Test | What it verifies |
|------|-----------------|
| City options render | All 4 launch cities in the selector |
| City selection triggers callback | Selecting a city calls onChange / updates URL |

#### `Avatar.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Renders image when src provided | `<img src=...>` present |
| Initials fallback | When no src, initials computed from name are shown |
| Size variants | `sm`, `md`, `lg` props produce different dimensions |

#### `PhotoUpload.test.tsx`

| Test | What it verifies |
|------|-----------------|
| File input present | `<input type="file">` exists |
| Selection triggers callback | Selecting a file calls `onUpload` |
| Image preview shown | Preview `<img>` appears after file selected |

#### `DatePicker.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Closed by default | Calendar not visible initially |
| Opens on trigger click | Calendar visible after clicking trigger |
| Date selection calls onChange | Picking a date calls `onChange` and closes picker |

#### `PmfSurveyCard.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Three answer options render | "very", "somewhat", "not" options present |
| Click calls server action | Selecting an option calls the server action |
| Thank-you state | After submission, thank-you message renders |

#### `BookingActionBar.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Accept and Decline buttons | Both render on a `requested` booking for the local |
| Accept calls action | Clicking Accept calls `acceptBooking` |
| Decline calls action | Clicking Decline calls `declineBooking` |

#### `BookingDateField.test.tsx`

| Test | What it verifies |
|------|-----------------|
| Date display renders | Current date value shown |
| Click opens picker | DatePicker overlay appears on click |

---

## 7. Playwright E2E Improvements

### 7.1 Prerequisite: `.env.test`

Create `.env.test` (gitignored) read by the dev server during E2E runs:

```
DATABASE_URL=<same as dev>
NEXTAUTH_SECRET=<same as dev>
AUTH_URL=http://localhost:3000
ADMIN_EMAILS=e2e-test@example.com
# Intentionally no RESEND_API_KEY → enables dev magic-link mode
```

Run once before E2E: `npm run db:seed`

### 7.2 Hardened existing specs

| Spec | Change |
|------|--------|
| `booking-flow.spec.ts` | Assert ≥1 local card visible (seed guaranteed); assert BookingPanel renders on profile page |
| `apply-local.spec.ts` | Assert form heading + ≥3 inputs present; assert empty submit shows validation errors |
| `admin-approval.spec.ts` | Assert pending filter link present; assert Approve button present if a pending local exists |
| `messages.spec.ts` | Assert unauthenticated `/messages/any-id` redirects to `/signin` |
| `review-flow.spec.ts` | Assert unauthenticated `/review/any-id` redirects to `/signin` |

### 7.3 New specs

**`booking-panel.spec.ts`** — authenticated user on a local profile:
- BookingPanel is visible on `/local/{id}`
- Clicking "4 hours" updates the price summary text
- Clicking Book without required fields shows a validation prompt

**`trips.spec.ts`** — authenticated user:
- `/trips` loads without server error
- Shows bookings list or empty-state ("no trips yet") — not a 500

---

## 8. Definition of Done

- `npm run test:components` runs all 14 component test files, exits 0
- `npm test` (existing unit suite) still passes — 116 tests, no regressions
- `npm run test:e2e` runs all 7 Playwright specs against a seeded dev server, exits 0
- No `any` types in test files (TypeScript strict)
- All mocks cleared between tests (`beforeEach(() => vi.clearAllMocks())`)
