# meetlocal.ai — Engineering Playbook

How this codebase is wired, why it's wired that way, how to extend it
without breaking the marketplace, and where the cliffs are when you scale.

This is the doc to read **before** you write your first non-trivial feature.
Read [README.md](README.md) for the product story; read
[CLAUDE.md](CLAUDE.md) for the rules; read this for the *why*.

> Audience: solo-to-small-team founders who want this app to feel like Linear,
> price like Stripe, and trust like Airbnb — without a team of 50.

---

## 0. The product, in one paragraph

A solo traveler lands in a new city, pulls up meetlocal.ai, picks city + date
+ vibes, and gets matched with a vetted local for a 1–4 hour, 1:1, real-time
experience. The local pre-authorizes the traveler's card on Stripe (manual
capture). The local has 14 minutes to accept; on accept, capture happens and
both sides chat in a real-time room. After the meet, both leave a review
that stays hidden until both submit. Founder-vetted supply. 22% platform
take. Web-first, mobile-second.

The technical consequences of that paragraph drive every decision below.

---

## 1. The constraints that shape every choice

These aren't preferences — they're load-bearing decisions. Don't reverse them
without re-reading why.

| Constraint | Why | Code consequence |
|---|---|---|
| **Vetted locals only** | Trust = the moat. Auto-approval is the death of marketplace quality. | `LocalProfile.status` enum (`pending → active → paused → removed`). Admin gate before public surface. |
| **Manual Stripe capture** | Local has to *choose* to accept; only then do you charge. Holds release if they decline. | `capture_method: 'manual'` on `PaymentIntent`. Capture in `acceptBookingByUser`, cancel in `declineBookingByUser`. |
| **Money is integer cents** | Floats lose pennies. Stripe accepts cents. Be consistent. | Prisma `Int` for `ratePerHour`, `totalAmount`, `platformFee`. Convert dollars → cents at the **boundary** (Zod schema), never inside the lib. |
| **Two-way reviews hidden until both submit** | Eliminates retaliation/anchoring. | `Review.visible` flag flipped in a single transaction in `/api/reviews/route.ts`. |
| **Channel per booking** | Real-time chat must not cross-leak. | `channelForBooking(bookingId)` in `lib/supabase.ts`. One channel per booking ID, no broader topic. |
| **Idempotent Stripe webhooks** | Stripe retries. We must not double-capture or double-email. | Webhook handler is event-id scoped; status transitions are idempotent. |
| **PII discipline** | Marketplace = names, emails, photos, IDs, DOB. Logging them is a leak. | No `console.log(user.email)` in any code path. Pass IDs and look up. |
| **Server components by default** | Less JS shipped to the browser, faster TTI, simpler data flow. | `'use client'` only on interactive islands. |
| **Zod at every boundary** | Web form, server action, API route, mobile API all share schemas. Truth is one file. | `src/lib/schemas/*.ts` is the single source of validation truth. |

---

## 2. System map (ASCII)

```
                            ┌─────────────────────────┐
                            │       Browser           │
                            │ ┌─────────┬─────────┐   │
                            │ │  RSC    │ Client  │   │  Static + interactive
                            │ │ pages   │ islands │   │  islands (forms,
                            │ └────┬────┴────┬────┘   │  search bar, chat).
                            └──────┼─────────┼────────┘
                                   │ HTML    │ JSON / FormData
              Server Actions       │         │
              (FormData) ──────────┼─────────┘
                                   ▼
              ┌────────────────────────────────────────────┐
              │   Next.js 16 App Router (Vercel today)     │
              │                                            │
              │   src/app/                                 │
              │   ├── (RSC pages)        ── data → render  │
              │   ├── api/v1/*           ── mobile JSON    │
              │   ├── api/* (legacy)     ── checkout, etc. │
              │   └── api/stripe/webhook ── Stripe events  │
              └─────┬─────────────┬──────────────┬─────────┘
                    │             │              │
        Pure libs   │             │ Schemas      │  External services
        (testable)  │             │ (Zod)        │
                    ▼             ▼              ▼
              ┌──────────────────────┐    ┌────────────────────┐
              │  src/lib/            │    │  Supabase Postgres │
              │  ├── bookings.ts     │◄───┤  (Prisma client)   │
              │  ├── locals.ts       │    └────────────────────┘
              │  ├── stripe.ts       │    ┌────────────────────┐
              │  ├── email.ts        │───►│  Stripe (capture)  │
              │  ├── supabase-server │    └────────────────────┘
              │  ├── api/respond.ts  │    ┌────────────────────┐
              │  └── schemas/*       │───►│  Resend (email)    │
              └──────────────────────┘    └────────────────────┘
                                          ┌────────────────────┐
                                          │ Supabase Realtime  │
                                          │  (chat broadcasts) │
                                          └────────────────────┘

Future:                           ┌─────────────────────────┐
                                  │  React Native / iOS     │
                                  │  Calls /api/v1/*        │
                                  └─────────────────────────┘
```

The key architectural property: **nothing in `src/lib/` knows it's running
inside Next.js.** That's how mobile and a future BFF reuse it.

---

## 3. Data model — the marketplace primitives

Read `prisma/schema.prisma` for the truth; this is the conceptual map.

```
User ────────┐  Has zero or one LocalProfile.
   │         │  Has many Bookings as traveler.
   │         │
   ├─► LocalProfile ───┐  Owned 1:1 by User.
   │                   │  status: pending → active → paused → removed
   │                   │  Holds: bio, rate, KYC, social links, verifications.
   │                   │
   ├─► Booking ◄───────┘  travelerId + localId both User refs.
   │      │                status: requested → confirmed → in_progress →
   │      │                        completed → reviewed
   │      │                (or: requested → cancelled, completed → disputed)
   │      ├─► Message       per-booking chat
   │      ├─► Review (×2)   one per side, visible flag flipped together
   │      └─► MeetingSpot   optional — pinned coffee shop / park
   │
   └─► Story             pre-launch supply showcase, not transactional
```

### State-machine cheat sheet (`Booking.status`)

```
   ┌──────────┐  accept    ┌──────────┐  start   ┌─────────────┐  complete   ┌───────────┐
   │ requested├───────────►│confirmed ├─────────►│in_progress  ├────────────►│ completed │
   └────┬─────┘            └────┬─────┘          └─────────────┘             └─────┬─────┘
        │                       │                                                   │
        │ decline / expire       │ cancel                                            │ dispute
        ▼                       ▼                                                   ▼
   ┌──────────┐            ┌──────────┐                                       ┌──────────┐
   │ cancelled│            │ cancelled│                                       │ disputed │
   └──────────┘            └──────────┘                                       └──────────┘
                                                                              ↓ resolved
                                                                              completed
```

Every status change is a server-action or API route call into
`src/lib/bookings.ts`. **No UI flips status directly.**

---

## 4. The transactional core (read this twice)

Three intertwined lifecycles. Get these right, the rest is plumbing.

### 4.1 Booking lifecycle

```
T+0     traveler submits /book/:localId form
        ├─ Zod-validate input
        ├─ create Booking row (status=requested)
        ├─ if Stripe configured: create Checkout Session, redirect
        │  └─ on Checkout success: PaymentIntent in 'requires_capture' state
        └─ else: send "request received" email, redirect to /confirmed

T+0..14 local sees the request in /host or /messages
        ├─ Accept: capture PaymentIntent → status=confirmed
        ├─ Decline: cancel PaymentIntent → status=cancelled
        └─ Timeout 14 min: re-route or cancel (TODO — cron)

T+meet  either side: "Mark complete" → status=completed
T+meet  both sides: leave review → reviews flip visible together
```

The 14-minute window is **product-critical**: it's the difference between
"trip booked" and "I have to wait days for a host to respond." Don't relax
it without thinking.

### 4.2 Payment lifecycle (Stripe manual capture)

The non-obvious move. Most marketplaces auto-capture; we don't.

```
1. Booking created → Checkout Session w/ payment_intent_data.capture_method='manual'
2. Traveler pays → PaymentIntent status: 'requires_capture' (auth held, no charge)
3. Webhook 'checkout.session.completed' → store stripePaymentIntentId on Booking
4. Local Accept → paymentIntents.capture(pi) → 'succeeded' (charged for real)
5. Local Decline → paymentIntents.cancel(pi)  → 'canceled' (auth released)
6. Auth expires after 7 days → if no accept, the hold drops automatically
```

Why this matters:
- Travelers don't get charged for declined or unaccepted bookings.
- Locals can decline without guilt about refunds.
- We don't need refund flows for the 90% case.
- We DO need a cron to either re-route or cancel after 14 min (TODO).

### 4.3 Review lifecycle (anti-retaliation)

```
1. Booking completes
2. Each side independently submits Review (Review.visible=false)
3. When the SECOND review lands, in one Prisma $transaction:
     UPDATE Review SET visible=true WHERE bookingId=X
4. Both reviews surface on the local's public profile.
```

If side A submits and B never does, A's stays hidden. We may surface "X has
written a review, write yours to see it" UX as a nudge — but never reveal
prematurely.

---

## 5. Frontend architecture

### 5.1 The RSC / Client component split

| Render where | Use cases | Rules |
|---|---|---|
| **Server (RSC)** | Pages, layouts, data-heavy lists, auth-gated routes | Default. Fetch via Prisma. No `useState`, no event handlers. Can pass props to client islands. |
| **Client (`'use client'`)** | Forms with state, modals, search bar pills, Realtime chat, anything with `useState`/`useEffect` | The smallest leaf. Drag interactivity *down*, not up. |

**Anti-pattern:** marking a whole tree `'use client'` to avoid thinking about
the boundary. If a page has one button, only the button is a client
component. Look at `src/app/booking/[bookingId]/confirmed/page.tsx` — fully
RSC. Look at `src/components/SearchBar.tsx` — `'use client'` because the
pills have local state.

### 5.2 The design system

Token-driven, defined in `src/app/globals.css` under Tailwind v4's `@theme`.

```
Dark theme (Discover, /host, /admin, confirmation):
   bg, bg-2          backgrounds
   surface, surface-2 cards / popovers
   line, line-2      borders (alpha cream)
   text, text-dim, text-muted
   coral             accent (CTA gradient via grad-sunset)
   amber             warning / pending tone
   good, magenta     status pills

Paper theme (apply form, admin/locals):
   paper, paper-bg   light backgrounds
   ink, ink-dim, ink-muted
   hair, hair-2      borders
```

The booking confirmation page used paper, we flipped it to dark for
consistency. The admin pages still use paper — flip them in a focused PR
when you have visual capacity.

**Use tokens, not hex.** If you find yourself writing `bg-[#1c1713]`, you're
fighting the system; add a token instead.

### 5.3 Forms

Pattern: client component owns interactivity, server action handles submit,
Zod validates on both sides.

```tsx
// Client component
const [error, setError] = useState<string | null>(null);
const onSubmit = (e) => {
  e.preventDefault();
  // optional: client-side optimism
  startTransition(async () => {
    const res = await myServerAction(new FormData(e.currentTarget));
    if (res?.error) setError(res.error);
  });
};
```

For new forms, adopt **react-hook-form + zodResolver** with the schema from
`src/lib/schemas/`. You get field-level errors for free, and the same schema
runs on the server. The booking + apply forms haven't migrated yet —
deferred to its own session.

### 5.4 What lives where (top-level routes)

| Route | Audience | Notes |
|---|---|---|
| `/` | everyone | discover; renders SearchBar + featured locals |
| `/local/[id]` | everyone | public local profile |
| `/book/[localId]` | signed in | booking form (paper-themed) |
| `/booking/[id]/confirmed` | traveler | post-submit confirmation (now dark) |
| `/messages/[bookingId]` | both parties + admin | chat + BookingActionBar |
| `/host` | active locals | local dashboard, incoming requests |
| `/trips` | travelers | their bookings as a traveler |
| `/become-a-local` | everyone | landing for the apply flow |
| `/become-a-local/apply` | signed-in non-locals | application form |
| `/admin` | admins | founder dashboard, recent bookings, accept-on-behalf |
| `/admin/locals` | admins | list + status changes |
| `/admin/locals/new` | admins | create-on-behalf |
| `/signin` | unauth | OAuth + magic link landing |

Keep this map in your head. New routes need a clear audience and either a
gate or a public surface.

---

## 6. Backend architecture

### 6.1 The lib pattern (the one that matters most)

```
Server Action (Next-only)        OR        API Route (mobile-callable)
  │                                              │
  ├── parse FormData                             ├── parse JSON via Zod
  ├── auth via auth()                            ├── auth via requireUser/Admin
  ├── call lib function                          ├── call lib function
  └── redirect / revalidatePath                  └── ok(data) / handleError(err)
                  │                                              │
                  └─────────────►   src/lib/{bookings,locals}.ts ◄┘
                                    Pure functions:
                                    - take typed inputs
                                    - return data or throw
                                    - touch Prisma / Stripe / Resend
                                    - no Next imports
```

**This pattern is non-negotiable.** Every new write operation gets a lib
function first. Wrappers come second. Mobile API comes third (free, given
the lib).

### 6.2 The schema layer

`src/lib/schemas/` is your source of truth for "what valid input looks
like." Zod schemas are isomorphic — they run in the browser (for
react-hook-form) and on the server (for server actions and API routes).

Naming convention:
- `LocalApplicationSchema` — for the apply flow
- `AdminCreateLocalSchema` — for admin-create
- `CreateBookingSchema` — for the booking API
- Discriminated unions where you have `mode` (existing/new), etc.

The schema also defines the **TypeScript type** via `z.infer<typeof X>` —
don't write a separate interface, infer it.

### 6.3 The API surface

```
/api/auth/[...nextauth]              NextAuth handlers (don't touch)
/api/stripe/webhook                  Stripe events (idempotent)
/api/upload                          Server-side photo uploads to Supabase Storage
/api/checkout                        Retry-payment helper for client side
/api/messages                        Chat broadcast (legacy shape)
/api/reviews                         Two-way review transaction
/api/stories                         Pre-launch supply story tile

# v1 (mobile-callable, typed-error responses)
/api/v1/bookings                                POST  createBooking
/api/v1/bookings/[id]/accept                    POST  acceptBookingByUser
/api/v1/bookings/[id]/decline                   POST  declineBookingByUser
/api/v1/bookings/[id]/complete                  POST  markBookingCompletedByUser
/api/v1/applications                            POST  submitLocalApplication
/api/v1/admin/locals/[id]/status                PATCH setLocalProfileStatus
/api/v1/admin/locals/[id]/verification          PATCH setLocalVerificationFlag
```

`/api/v1/*` uses `src/lib/api/respond.ts` — uniform `{ error: { message,
code, issues? } }` errors with proper HTTP statuses. Add new endpoints
sparingly; mobile only needs writes here.

### 6.4 Auth model

NextAuth v5 + Prisma adapter, session strategy = `database`.

- Two providers: Google OAuth (primary), Resend magic-link (fallback)
- `ADMIN_EMAILS` env var auto-promotes founder accounts on first sign-in
  (set `User.isAdmin = true`)
- `session.user.isAdmin` flows from DB, not env, so it's stable across
  requests
- Every server action: `if (!session?.user?.id) throw/return error`
- Every API route: `await requireUser()` or `await requireAdmin()`

Cookies are HTTP-only, secure in prod. If you add a new write operation,
check auth FIRST, before anything else.

### 6.5 Database

- **Prisma 6** — `db:push` for dev, `db:migrate` for prod
- **Pooled connection** for app (`DATABASE_URL`), direct for migrations
  (`DIRECT_URL`). Both required. Don't try to use one for both.
- **Indexes:** ensure `(city, status)` on `LocalProfile` for the discover
  query, `(localId, status)` on `Booking` for `/host`, `(bookingId)` on
  `Message` and `Review`. Add these in `schema.prisma` `@@index` directives.
- **Schema changes:** in dev, edit + `db:push`. In prod-bound work, ALWAYS
  create a migration (`db:migrate`). Don't `db:push` to prod, ever.

---

## 7. Real-time, payments, email — the integration layer

### 7.1 Real-time chat (Supabase)

```
Browser tab (traveler)                Browser tab (local)
    │                                       │
    │ subscribe to 'booking:<id>'           │ subscribe to 'booking:<id>'
    └────────────┬──────────────────────────┘
                 │
                 ▼
           Supabase Realtime
                 ▲
                 │ broadcast {type:'message', payload:{...}}
                 │
       ┌─────────┴────────────┐
       │   /api/messages POST │
       │   1. auth + verify   │
       │   2. INSERT Message  │
       │   3. broadcast       │
       └──────────────────────┘
```

Per CLAUDE.md rule 8: **one channel per booking.** Don't share. The channel
name is built by `channelForBooking(bookingId)`.

Failure mode: if the broadcast fails (Supabase Realtime down), the message
is still persisted and shows on next page load. Don't fail the POST when
broadcast errors.

### 7.2 Payments (Stripe)

`src/lib/stripe.ts` is the only file that imports the Stripe SDK. Two
exports matter:
- `isStripeConfigured()` — gate for fallback mode (request-only)
- `createCheckoutSessionForBooking({ bookingId, travelerEmail })`

The webhook (`/api/stripe/webhook`) does:
- Verify signature with `STRIPE_WEBHOOK_SECRET`
- Switch on event type
- Update Booking row idempotently (each event-id processed once)

Test paths:
1. Happy path: book → checkout → webhook → accept → capture
2. Decline: book → checkout → webhook → decline → cancel auth
3. Replay: re-send the same `checkout.session.completed` event → no double email/booking

### 7.3 Email (Resend)

`src/lib/email.ts` exports `sendEmail()` (no-op when `RESEND_API_KEY` blank)
and templated builders:
- `bookingRequestedTemplate` → to local
- `bookingAcceptedTemplate` → to traveler
- `applicationReceivedTemplate` → to admins
- `applicationApprovedTemplate` → to local
- `magicLinkTemplate` → to traveler/local for sign-in

Failure mode: Resend down → log + continue. Email is a "nice to have," not a
blocker for the lifecycle.

**Anti-pattern:** marketing email automation. Don't put it in
`lib/email.ts`. Transactional only. Marketing goes through a separate
service later.

### 7.4 Storage (Supabase)

`profile-photos` bucket holds:
- Local hero photos
- Government ID images (KYC)
- Selfie images (KYC)

Server-side uploads via `lib/storage.ts` using the service role key. Never
expose the service role to the client. Public read URLs for public photos;
**signed URLs for KYC docs** (TODO — currently public, must fix before
prod).

---

## 8. Trust & safety architecture

The thing that distinguishes this from "Craigslist for tour guides."

### 8.1 Vetting funnel

```
Apply  ──►  KYC + bio review (founder)  ──►  Background check (vendor)  ──►  Active
              │                                  │
              │                                  └── (TODO: Persona/Checkr integration)
              │
              └── ID upload, selfie, DOB, social links
```

Currently a manual founder review. The schema has `idVerified` and
`bgChecked` flags ready for vendor webhooks to flip when v2 lands.

### 8.2 Safety rails (build before scaling)

| Rail | Status | Owner action |
|---|---|---|
| Report-a-user | TODO | Even a simple `mailto:safety@` works for v1 |
| Block flow | TODO | Local can hide from search to a specific user |
| No-show flag | TODO | Traveler/local can mark; admin reviews dispute |
| Emergency contact for travelers | TODO | "Share trip" with a friend's email |
| 24/7 incident response | TODO (founder phone) | Document SOP |

### 8.3 PII handling

- DOB, gov ID URL, selfie URL are server-only fields — never ship to client
- Logs strip emails. Use IDs.
- KYC images get **signed URLs with expiry** (max 60s) when displayed in
  admin (TODO)

---

## 9. Scaling cliffs (what breaks at what scale)

| Bottleneck | Hits at | Fix |
|---|---|---|
| Supabase pooled connections | ~100 concurrent | Bump pool size; consider PgBouncer transaction mode |
| Search query (no full-text) | ~10K locals | Add `tsvector` + GIN index; or move search to a service (Typesense/Meilisearch) |
| Realtime channel count | ~500 simultaneous chats | Move to dedicated Realtime tier; one channel per booking is fine, just more of them |
| Stripe webhook retries | 5 retries, exponential | Make sure your handler is fast (< 5s) and idempotent |
| Email send rate (Resend free tier) | 100/day | Upgrade to Pro ($20/mo gets 50k); consider SES if scale demands |
| Vercel cold starts on long routes | Per-region | Move heavy DB calls to edge regions; consider Amplify/EC2 once costs justify |
| Image optimization (Next /_next/image) | High traffic | CloudFront/CDN cached `/_next/image` paths |
| Photo storage costs | Per-GB Supabase | Shift to S3 once user count > ~10K, costs visible |

**Don't pre-optimize.** Each of these has a clear trigger; build for the
trigger, not for theoretical scale.

---

## 10. How to build a new feature (the canonical workflow)

This is the discipline that makes a one-person team ship like a five-person
team.

### Step 1 — Sketch the data shape
- What new tables/columns? Edit `prisma/schema.prisma`. Add `@@index`
  directives for any new query path.
- `npm run db:push` in dev.

### Step 2 — Write the Zod schema
- Add to `src/lib/schemas/<domain>.ts`. Mirror the data shape, but use
  *boundary types* (e.g., `ratePerHourDollars: z.number()`, not the
  cents-int).
- Export the inferred TypeScript type via `z.infer`.

### Step 3 — Write the lib function
- Add to `src/lib/<domain>.ts`. Pure function, takes typed input, throws on
  failure, returns data on success.
- No Next imports. Test it later by importing into a script if needed.

### Step 4 — Wrap for the web (server action)
- New file like `src/app/<route>/actions.ts` with `'use server'`.
- Parse FormData → run Zod → call lib → redirect/revalidate.
- Error handling: surface `{ error: string }` for forms.

### Step 5 — Build the UI
- RSC page first (data fetching, layout).
- Drop in the smallest possible client component for interactivity.
- Use design tokens, not hex.

### Step 6 — Wrap for mobile (API route)
- Add to `src/app/api/v1/<resource>/route.ts`.
- Use helpers from `src/lib/api/respond.ts`.
- 15-line file: auth, parse JSON, call lib, return ok/error.

### Step 7 — Email + side effects
- If a side effect should fire, add to `lib/email.ts` or wherever.
- Idempotent: re-running shouldn't double-send.

### Step 8 — Test the full loop
- Dev server, walk it as the relevant persona.
- Replay the integration if Stripe/webhook is involved.
- Check the LAUNCH_CHECKLIST.md component.

### Step 9 — Document
- Add a row to the LAUNCH_CHECKLIST status table.
- If it changes the schema or core lifecycle, update PLAYBOOK.md (this file).

### Step 10 — Don't deploy yet
- Run `npm run build` clean.
- `npm run lint` shows no NEW errors (legacy ones aren't your problem).
- Smoke-test on prod URL after deploy.

---

## 11. Anti-patterns (real examples)

These have all bitten real startups. Don't repeat.

### 11.1 "Just stick the logic in the page component"
**Why it's bad:** can't test, can't reuse, can't expose to mobile.
**Fix:** lib pattern from §6.1. Always.

### 11.2 "Skip Zod, the form is internal"
**Why it's bad:** forms drift from server expectations; mobile API
re-implements validation; bug surface multiplies.
**Fix:** schema first, both sides import it.

### 11.3 "Use `any` because the type is annoying"
**Why it's bad:** `any` is contagious; once you have one, the whole call
chain loses type safety.
**Fix:** infer types from Zod schemas; use `z.infer<typeof X>`.

### 11.4 "Mark the whole page `'use client'` to avoid thinking about boundary"
**Why it's bad:** ships hundreds of KB of JS for what should be HTML;
breaks streaming; loses caching.
**Fix:** push `'use client'` to the leaf component.

### 11.5 "Auto-capture on book"
**Why it's bad:** travelers get charged for declined bookings; refund flows
become the most-touched code; trust falls.
**Fix:** manual capture, capture-on-accept (we already do this — don't
revert).

### 11.6 "Auto-approve locals to grow supply"
**Why it's bad:** quality collapse, safety incidents, brand damage. Marketplaces lose to trust failures, not supply gaps.
**Fix:** founder-vetted forever. Hire reviewers before automating.

### 11.7 "Log the user object on errors"
**Why it's bad:** PII in logs = compliance + privacy headache. Stack traces
end up in third-party tools you didn't audit.
**Fix:** log user IDs, look up only when investigating.

### 11.8 "Schema migration in `db:push` against prod"
**Why it's bad:** no audit trail, no rollback, schema diffs silently between
dev/prod.
**Fix:** `db:migrate` for prod. Always.

### 11.9 "Delete user data without backup"
**Why it's bad:** irreversible, customer trust collapse if wrong.
**Fix:** soft-delete with `deletedAt`, or move to a `_archived` table. The
operator memory says: never delete, always move to a review folder.

### 11.10 "Wait until launch to set up Sentry"
**Why it's bad:** the first 100 users will hit bugs you can't see; you'll
debug from screenshots.
**Fix:** wire Sentry on day 1 of paying users.

---

## 12. Roadmap & capability ladder

A truthful "what's next" — staged so each step pays for the next.

### Now → 100 users (manual founder ops)
- ✅ Web app shipped to prod
- ✅ Stripe live, payouts manual
- ✅ Locals manually vetted, hand-onboarded
- TODO: ToS, Privacy, Refund, IC agreement
- TODO: Sentry + uptime monitoring
- TODO: 14-min auto-cancel cron

### 100 → 1K users (automate vetting + payouts)
- Background check vendor wired (Persona/Checkr)
- Stripe Connect Express for local payouts
- 1099-NEC year-end automation
- Resend domain verified + DKIM
- Search → Typesense or Postgres `tsvector`

### 1K → 10K users (mobile + scale)
- React Native app (Expo) using the existing `/api/v1/*` endpoints
- Read-side API endpoints (`GET /api/v1/locals`, `/api/v1/bookings`)
- API rate limiting (Upstash / Vercel KV)
- Image CDN (CloudFront)
- Move heavy reads to Aurora Postgres or read replicas

### 10K+ users (platform & geography)
- Multi-region deploy (us-east + us-west minimum)
- Localized cities outside US launch quartet
- Public API + OpenAPI spec
- Partner referrals (hotels, airlines, travel apps)
- Trust & safety team (≥ 2 humans on rotation)

The discipline: **don't build the next stage's features in the current
stage.** Each one has a trigger metric. Hit it, then build.

---

## 13. Operational guardrails (from real incidents)

These are codified rules, not preferences.

1. **Never delete user data.** Move to a review/archive folder; let the user
   confirm before permanent deletion. (Documented preference.)
2. **Never `--no-verify` a commit hook.** If the hook is wrong, fix the
   hook, not the bypass.
3. **Never `git push --force` to main.** Even if you think you should.
4. **Never log secrets, emails, photo URLs.** Use IDs.
5. **Never trust the client.** Validate on the server. Always.
6. **Never deploy on Friday afternoon.** Save it for Monday.
7. **Never modify a published Stripe price.** Create a new one and migrate.
8. **Never auto-capture without a way to refund.** We chose manual capture
   to avoid this entirely.
9. **Never expose service-role keys to the browser.** They're called service
   role for a reason.
10. **Never trust an OAuth provider's name field to be set.** Default to
    email or "there".

---

## 14. Where to look when something breaks

| Symptom | First file to read |
|---|---|
| Sign-in failing | `src/auth.ts`, `/api/auth/providers` response |
| Booking not creating | `src/lib/bookings.ts`, dev console |
| Stripe webhook silent | `stripe listen` terminal, `/api/stripe/webhook` |
| Realtime chat dead | Supabase project → Realtime tab; check rate limits |
| Email not sending | Resend dashboard logs |
| Build failing | `npm run build` output; usually a typecheck miss |
| Lint screaming | Often pre-existing — check if YOUR file is in the output |
| Search empty | `LocalProfile.status`; missing index on `(city, status)` |
| Admin can't see X | `session.user.isAdmin`; `ADMIN_EMAILS` env var |

---

## 15. Pricing model & unit economics

> The take rate is the single most important business decision in a
> marketplace. Set it too high → supply leaves. Too low → unsustainable.
> Easy to *lower* later (everyone celebrates), nearly impossible to *raise*
> (locals revolt). Get this right at launch.

### 15.1 What the code does today

From `src/lib/bookings.ts`:

```ts
const subtotal     = local.ratePerHour * hours;            // local sets
const serviceFee   = Math.round(subtotal * 0.08);          //  +8% to traveler
const taxes        = Math.round(subtotal * 0.03);          //  +3% to traveler
const totalAmount  = subtotal + serviceFee + taxes;        // what traveler pays
const platformFee  = Math.round(subtotal * 0.22);          // 22% take from local
```

Worked example for a 1-hour meet at $50/hr:

```
Local's rate (subtotal):      $50.00
Traveler service fee (+8%):    $4.00
Tax (+3%):                     $1.50
─────────────────────────────────────
Traveler pays total:          $55.50

Platform fee (22% of subtotal): $11.00
Local's payout:                $39.00  (= subtotal − platformFee)
─────────────────────────────────────
Platform GROSS revenue:        $11.00 (platform fee)
                              + $4.00 (service fee)  ← if kept by platform
                              + $1.50 (tax)          ← passes to gov
                              ──────
                              $15.00 visible to operator (excl. tax)

Effective platform take vs. what traveler paid:
  $15 of $55.50  =  27% blended  (27.0%)
Effective payout to local:
  $39 of $55.50  =  70.3%
```

After Stripe processing (~2.9% + $0.30) on $55.50 = $1.91, the platform
nets ~$13.09 per $55.50 booking → **~23.6% net take**.

### 15.2 Industry benchmarks

| Marketplace | Take rate | Notes |
|---|---|---|
| **Airbnb** | ~14–17% blended | 3% host + 14% guest fee. Lower for Plus hosts. |
| **Uber / Lyft** | 25–30% | Driver bears insurance, fuel, vehicle. |
| **DoorDash / UberEats** | 25–30% restaurant + delivery fee | Heavy logistics. |
| **TaskRabbit (IKEA)** | 15% to platform | Low-friction tasks. |
| **Toptal / Upwork** | 10–20% | Higher value per gig. |
| **Withlocals** *(closest comp)* | ~25–30% | 1:1 local experiences in cities. |
| **GetYourGuide / Viator** | 20–30% | Curated tours, more vetting. |
| **TourRadar** | 20–25% | Multi-day. |
| **You (today)** | ~24% net / ~27% blended | In the right range for vetted 1:1. |

### 15.3 Recommendation

**Keep ~22% platform take + 8% traveler service fee for launch.** Reasons:
- It's industry-standard for vetted 1:1 experiences.
- It leaves $39 net per $50 hour to the local — meaningful.
- It funds the platform (insurance, vetting, support, payment risk).
- Lowering later is good PR; raising is suicide.

**Where to evolve:**

1. **Tiered take rate.** After a local hits 20+ completed meets at 4.8★+,
   drop their take to **18%** as a "Top Local" perk. Costs you ~4% on the
   top 20% of supply, buys you retention and referrals. Mirror Airbnb
   Superhost.
2. **Regional dynamic pricing.** Lower-cost cities (Tampa, Portland-ME)
   may need a lower take to support reasonable rates. Test 18–20% in
   secondary cities; keep 22% in Miami/Bay.
3. **Surge / minimum.** Set a $30 minimum hourly net to local — you won't
   list anyone whose 78% drops below that. Forces locals to price higher
   in a way that protects them and your brand.
4. **Don't unbundle the service fee.** It's a price-display lever — show
   total, hide structure unless asked. Fighting fees in the UI is a 2024
   trap (look at how Airbnb walked back full pricing display reluctantly).

### 15.4 Pricing display & psychology

| Pattern | Why |
|---|---|
| Show **total** to traveler upfront ($55.50) — not subtotal | Anchor on what they'll actually pay. |
| Show "$39 / hr · you keep 78%" to local on apply form | Honesty builds trust on the supply side. |
| Round subtotal to whole dollars in the form | $50 ($55.50 total) feels cleaner than $48.34. |
| Avoid **"+ taxes & fees"** at checkout | Build trust by showing them in the booking form, not as a checkout surprise. |
| Don't display platform fee as a line item to traveler | It's the cost of the service — Uber doesn't tell you their take. |

### 15.5 The economics check

Per booking, your platform clears about $13 net. To run a real business:

| Expense | Monthly | Per booking @ 1000/mo |
|---|---|---|
| Vercel + Supabase Pro | $50 | $0.05 |
| Resend Pro | $20 | $0.02 |
| Sentry | $26 | $0.03 |
| Stripe processing (already in 15.1) | – | – |
| Background checks ($25/check, 5/mo) | $125 | $0.13 |
| Founder support time (1 hr / 50 bookings) | – | $1.50 |
| **Marginal cost per booking** | | **~$1.75** |
| **Net margin per booking** | | **~$11.25** |

That's ~$11K profit at 1K bookings/mo, before founder salary. Locals
making 10 bookings each at $50/hr = ~$390/mo each. Solid side income;
not "quit your job" money. That's the right shape for v1 — promotes
quality over quantity.

---

## 16. Legal protection (IP, trademark, formation)

> **This is not legal advice.** It's a founder's-cheat-sheet. Hire a real
> lawyer before signing anything; the $500–$2K spend on a good startup
> attorney pays for itself the first time someone tries to copy you or your
> co-founder leaves.

### 16.1 What's actually protectable in a marketplace

| Asset | Protection | Cost | Strength | Recommendation |
|---|---|---|---|---|
| **Brand name** ("meetlocal.ai") | Trademark | $250–$350/class via USPTO TEAS Plus | High | **DO NOW** |
| **Logo + visual mark** | Trademark | Same as above (separate filing) | High | DO NOW with name |
| **Code** | Copyright | Free (automatic on creation) | Medium | Just preserve git history |
| **Business model** | Patent? | $5K–$20K + lawyer | **Very low** post-Alice (2014) | **Skip** |
| **Specific tech** (matching algo, novel mechanic) | Provisional patent | $250–$500 DIY, $2K via lawyer | Low–Medium | Maybe later |
| **Customer lists, vendor pricing** | Trade secret + NDA | Lawyer for NDA template (~$500) | Medium | DO when first hire / vendor |
| **Founder IP / equity / what-if-leave** | Founder agreement | Lawyer (~$1.5K) | Critical | **DO BEFORE CO-FOUNDER** |

### 16.2 Trademark — do this in week 1

1. Search USPTO TESS at https://tmsearch.uspto.gov to make sure
   "meetlocal" / "meet local" isn't already taken in your classes.
2. File via TEAS Plus ($250 per class) at https://teas.uspto.gov
3. File in **Class 39 (travel arrangement)** + **Class 41 (entertainment
   services)** + **Class 42 (computer services)**. Three classes = $750.
4. Optionally also file the logo as a separate "design" mark.
5. International: file Madrid Protocol later (~$1K) if expanding to EU/UK
   becomes real.

Why not Stripe Atlas's bundled trademark? It's $500 and covers one class —
not bad, but you can do 3 classes yourself for $250 each more efficiently.

### 16.3 Patent — generally don't bother

After *Alice Corp. v. CLS Bank* (2014 SCOTUS), software patents on
"abstract ideas implemented on a computer" are routinely invalidated.
Marketplace mechanics ("connecting travelers and locals") fall squarely in
that bucket.

**The exceptions where a patent might matter:**
- Genuinely novel matching algorithm (e.g., a new ranking function with
  measurable lift)
- A unique technical mechanism that solves a real engineering problem
- Hardware integrations (sensors, AR/VR — irrelevant for now)

**If you do file:** start with a **provisional patent application** (~$300
DIY, $2K via lawyer) to lock in priority date. You have 12 months to
decide whether to convert to a non-provisional ($10K+ over its life). 90%
of provisionals lapse and that's fine — they served their "patent
pending" purpose.

For meetlocal.ai specifically: **don't file patents pre-launch.** Spend
the money on user acquisition.

### 16.4 Copyright — automatic but reinforce

- All your code is automatically copyrighted on creation.
- Don't paste GPL or AGPL code into your repo. Use MIT/Apache-2 for
  dependencies.
- Keep `LICENSE` file at repo root; today the repo doesn't have one — your
  code is "all rights reserved" by default, which is fine for a closed
  product.
- If you OPEN-SOURCE anything later (e.g., a small SDK), pick a permissive
  license (MIT/Apache-2).

### 16.5 Trade secrets & NDAs

- Standard mutual NDA template — get one from your lawyer or a
  reputable source (Bonsai, LegalZoom). Use before disclosing anything
  sensitive to vendors, contractors, candidates.
- Don't NDA *investors* before pitching; that's a red flag and most won't
  sign. Save NDA for vendor / contractor / employee.
- Internal: keep `prisma/schema.prisma`, vendor pricing, financials, and
  customer lists in private repos / 1Password. Don't email-attach them.

### 16.6 Founder agreement — most under-rated doc

If you have **any** co-founder, do this **before** the relationship gets
hard:

| Clause | Why |
|---|---|
| **4-year vesting with 1-year cliff** | Standard. If a founder bails in month 11, they get nothing. |
| **IP assignment** | Anything they wrote pre-incorporation is assigned to the company. |
| **Decision rights** | Who gets the casting vote? CEO usually, but spell it out. |
| **What happens if X leaves** | Buyout? Forfeit? Reverse vesting kicks in? |
| **Dispute resolution** | Arbitration, jurisdiction (Delaware), governing law. |
| **Definition of "good leaver" vs. "bad leaver"** | Termination for cause loses unvested + sometimes vested. |

Cost: $1.5K–$3K from a startup-focused lawyer. **Cheaper than a divorce.**

### 16.7 Incorporation

| Path | When | Cost |
|---|---|---|
| **Sole prop / no entity** | Pre-revenue side project | $0. Don't take payments yet. |
| **LLC in your home state** | Lifestyle business | $50–$300 + annual fees |
| **Delaware C-corp** | Plan to raise venture / take outside money | $500 via Stripe Atlas (best for Stripe integration) |
| **Stripe Atlas full bundle** | First-time founder | $500 incl. C-corp + EIN + bank + agent + 1 year DE registered agent |

**For meetlocal.ai → Delaware C-corp via Stripe Atlas** is the right move
the moment you take real money or seek investment. It's the standard
investors expect.

After incorporation:
- Get an **EIN** (free from IRS)
- Open a business bank account (Mercury, Brex, or traditional)
- File foreign qualification in your operating state ($100–$500)
- Get **D&O insurance** before raising ($500–$2K/yr)

### 16.8 Practical week-by-week plan

```
Week 1   Search USPTO; file trademark for "meetlocal.ai" + 3 classes  ($750)
Week 2   Set up Stripe Atlas C-corp + EIN + bank                       ($500)
Week 3   Register foreign qualification in your operating state        ($300)
Week 4   Hire startup lawyer for founder agreement (if applicable)     ($1.5–3K)
Month 2  Mutual NDA template ready for vendor + contractor convos      ($200)
Month 3  Privacy Policy + ToS + Refund Policy + IC Agreement drafted   ($2–5K)
Month 6  Maybe — provisional patent on a novel mechanism if you have one ($300)
```

Total year-1 legal spend for a properly-protected marketplace: **$5K–$10K**.
That's the price of admission. Don't skip it; the cost of not having a
founder agreement when things go sideways is 100× higher.

---

## 17. HR & people (contractors, employees, equity)

> Marketplaces have **two** people-categories at once: locals (your
> "supply") and your team (employees + contractors). Different rules apply.
> Get the locals classification right or it costs you the company.

### 17.1 Locals: independent contractors (1099-NEC)

This is the right model. **Don't drift toward employee-like control.**

What independent contractor means legally:
- Local sets their own rate (not you)
- Local sets their own availability (not you)
- Local controls how they conduct the meet (you don't dictate methods)
- Local is free to work for competitors (you don't enforce exclusivity)
- Local provides their own equipment, transport, tools

What you can do without breaking IC status:
- Require a baseline quality standard (vetting bar)
- Require certain conduct (safety, no harassment) via terms of service
- Set platform-wide policies (refund, cancellation)
- Suspend/remove locals who violate ToS

**Don't:**
- Set fixed rates (you can recommend; they must control)
- Require minimum availability (you can incentivize, not mandate)
- Require uniforms / scripts / specific routes
- Tell them how to conduct the experience step-by-step

### 17.2 Tax compliance for locals (US)

| Trigger | Requirement | When |
|---|---|---|
| Local signs up | Collect **W-9** (or W-8BEN for non-US) | At onboarding |
| Local earns > **$600** in calendar year | Issue **1099-NEC** | By Jan 31 next year |
| Local is non-US person | Withhold per W-8BEN (typically 30% absent treaty) | Each payout |
| Stripe payout > $20K + 200 transactions | **1099-K** automatic | Stripe handles |

**Stripe Connect Express** automates 1099-NEC issuance. Use it. The cost
is ~$2/local/month + 0.25% per payout, but you get tax forms, ID
verification, and SOC 2 compliance for free.

**Do NOT** pay locals through your personal Venmo, ACH, or "founder pays
out manually." That works for 5 locals; at 50 you're a money transmitter
without a license.

### 17.3 Worker classification risk

The biggest legal risk to a marketplace. If a state regulator (or class
action suit) reclassifies your locals as employees:

- **Back wages** (minimum wage + overtime, 2–3 years lookback)
- **Back payroll taxes** (employer FICA + SUTA + workers comp)
- **Penalties** (often 25–50% of back amounts)
- **Healthcare back-pay** if you're > 50 employees-equivalent

States to watch: **California (AB5)**, **Massachusetts**, **New Jersey**,
**Washington**. Lower risk in your launch states (FL, OR, plus Bay Area
which is California — be careful there).

Mitigations:
- Stripe Connect Express (puts the worker classification on Stripe, not you)
- Independent Contractor Agreement signed at apply time (template costs ~$500)
- Don't use language like "employee," "team," "staff" for locals — call
  them **"locals,"** **"hosts,"** or **"independent guides."**
- Document non-control: locals reject bookings, choose schedule, etc.

### 17.4 Founder equity — split & vesting

| Mistake | Fix |
|---|---|
| 50/50 with no vesting | 50/50 *with* 4-year vesting + 1-year cliff |
| Equity-for-introductions | Cash or revenue-share, not equity |
| Verbal agreement | Written, signed, dated |
| "We'll figure equity later" | Figure it before incorporation |

Standard early-stage cap table for 1 founder + future hires:
- Founder: 80–100%
- Option pool: **10–15%** (set aside before first investor)
- Future co-founder: 20–40% (negotiate based on contribution)
- Advisors: 0.25–1% each (max ~3–5 advisors)

**Vesting always.** Even for yourself. Even if you're solo. Reverse vesting
protects you if a co-founder joins later and wants standard terms.

### 17.5 Hiring your first employee

Don't until you absolutely must. Until then:
- **Contractors** for design, marketing, content (Bonsai for IC agreements)
- **Fractional executives** if you need senior help (~$200–$500/hr)
- **Yourself** for everything else

When you DO hire:
- **PEO (Professional Employer Organization)** — outsource HR/payroll/
  benefits/compliance. Best options: **Justworks** ($59/employee/mo),
  **Gusto** (~$40/employee/mo), **Rippling** (~$8/employee/mo + add-ons).
- **State employer registration** in each state where employees live
- **Workers comp insurance** (required in most states, ~$500–$2K/yr)
- **Unemployment insurance** registration
- **Form W-4** + I-9 verification within 3 days of hire
- **Employee handbook** (template from PEO)
- **Offer letter** with at-will employment (consult lawyer for state
  variations — California is different)

### 17.6 Equity for early hires

Stock options (ISOs for employees, NSOs for contractors). Standard terms:

| Role | Equity | Vesting |
|---|---|---|
| Founding engineer (1st hire) | 1–3% | 4yr / 1yr cliff |
| First sales / marketing lead | 0.5–1.5% | Same |
| Senior engineer (post-funding) | 0.25–0.75% | Same |
| Junior engineer | 0.05–0.25% | Same |
| Advisor | 0.25–1% | 2yr / no cliff (often) |

Rules:
- Get a **409A valuation** before granting options (~$1K–$3K from
  Carta/Eqvista; required by IRS to set strike price).
- Use a stock plan administrator (**Carta**, **Pulley**, **Cake Equity**).
- Grant in writing with board approval, not informally.
- 90-day post-termination exercise window is standard; many founders are
  moving to **10-year exercise windows** as a recruiting differentiator.

### 17.7 Compliance basics (don't ignore)

| Thing | When | Cost |
|---|---|---|
| **Privacy policy** (GDPR/CCPA) | Day 1 of taking data | $500–$2K via lawyer or Termly $10/mo |
| **Terms of Service** | Day 1 | $500–$2K |
| **Cookie banner** for EU/UK users | Day 1 | Free (CookieYes) or $20/mo (OneTrust) |
| **Background check vendor** (Persona/Checkr) | Before approving locals | $25–$60 per check |
| **Insurance** (general liability, E&O) | Before first paying user | $500–$2K/yr (Embroker, Vouch) |
| **Cyber insurance** | Once revenue is meaningful | $1–3K/yr |
| **D&O insurance** | Before raising | $500–$2K/yr |

Don't try to draft the legal docs yourself. Use **Termly** or
**Iubenda** for templates ($10–$40/mo), or hire a lawyer for the real
versions ($2K–$5K once). The cost of a privacy violation under GDPR
(€20M or 4% revenue) dwarfs the lawyer cost.

### 17.8 Practical hiring playbook

| Stage | Who | Why |
|---|---|---|
| 0–10 paying users | Just you + maybe a part-time designer | Validate product |
| 10–100 users | + IC for marketing, customer support sub-tier | Find PMF signals |
| 100–1K users | First full-time hire (engineer or ops, not exec) | Scale supply ops |
| 1K–10K users | + 2nd engineer + first ops/CS person | Operate at quality |
| 10K+ | + Trust & Safety lead, marketing lead | Real org |

Don't hire a CEO/COO/CTO/Head-of-X early. They expect process you don't
have, can't ship code, and add overhead. Hire **doers**.

---

## 18. The single most important habit

**Walk every flow as a real user before you ship it.** Open the dev server,
go through the journey end-to-end, screenshot the broken parts. The
LAUNCH_CHECKLIST.md is built for exactly this.

Code that compiles, types that check, tests that pass — none of it tells
you if a user can actually book a meeting and pay for it. Only walking the
flow does.

That's also why this codebase is structured the way it is: pure libs (so
you can write a unit test for an edge case the moment one bites you), Zod
schemas (so client and server agree on what valid means), and a single
source of truth for every transition (so "what's the current status" has
one answer).

Build slow, ship boring, trust the discipline.
