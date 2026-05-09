# meetlocal.ai — Launch Checklist

End-to-end pre-launch verification, from `npm run dev` on your laptop to a
working production deploy. Modeled on the way Airbnb / Stripe / Linear ship
marketplaces, scoped to this product:

- **1:1 vetted-local experiences**, 1–4 hours
- **Stripe manual capture** (auth on book, capture on accept)
- **Two-way reviews** hidden until both submit
- **4 launch cities**: Miami · Tampa · Bay Area · Portland (ME)

How to use: pick a component, complete its row top-to-bottom (Build → Test →
Verify → Prod-ready), check the box, move on. Don't skip ahead.

---

## Phase 0 — Local development environment

The bedrock. If `npm run dev` doesn't get you a fully working app on your
laptop, nothing else matters.

### 0.1 Repo & runtime
- [ ] `node --version` is 20.x+ (Next 16 / React 19 requires it)
- [ ] `npm install` completes without warnings beyond peer-dep notes
- [ ] `npm run build` succeeds (typecheck + bundling) on a clean clone
- [ ] `npm run lint` exits 0 (today: 243 pre-existing errors — fix or document)
- [ ] `.env.local` exists from `.env.example` (see 0.2 for vars)

### 0.2 Environment variables (every required key set)
Required for local dev:
- [ ] `DATABASE_URL` — Supabase Postgres connection string (pooled)
- [ ] `DIRECT_URL` — direct (non-pooled) for Prisma migrations
- [ ] `NEXTAUTH_SECRET` — random 32-byte hex
- [ ] `AUTH_URL` — `http://localhost:3000` in dev
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth dev creds
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — server-only, NEVER exposed to client
- [ ] `ADMIN_EMAILS` — comma-separated, your founder emails
- [ ] `RESEND_API_KEY` — optional locally; emails no-op without it
- [ ] `STRIPE_SECRET_KEY` (test mode `sk_test_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` (`whsec_...`) for `stripe listen`

### 0.3 Database
- [ ] `npm run db:push` syncs schema to your dev Supabase project
- [ ] `npm run db:seed` inserts 10 locals × 4 cities × 12 spots (idempotent)
- [ ] Open Supabase studio → confirm tables present: `User`, `LocalProfile`,
      `Booking`, `Message`, `Review`, `MeetingSpot`, `Story`
- [ ] Confirm Prisma client regenerates: `npx prisma generate`

### 0.4 Services running locally
- [ ] `npm run dev` → app at `localhost:3000`, no console errors on home page
- [ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook` running in a second terminal
- [ ] You can sign in with Google (use a dev email that's in `ADMIN_EMAILS`)
- [ ] `/admin` is reachable for that user

---

## Phase 1 — User flows (functional verification)

The three personas and the loops they live in. Each row = walk through it
end-to-end on `localhost:3000`.

### 1.1 Traveler flow (the demand side)
- [ ] **Sign in:** Google OAuth → User row created with email/name/image
- [ ] **Search:** city + date + vibes pills auto-advance and submit
- [ ] **Discover:** results page shows active locals filtered by city + categories
- [ ] **Browse:** click into `/local/:id` → profile renders (photo, bio, rate, languages, residency)
- [ ] **Book:** `/book/:localId` → choose hours, time slot, optional spot + note
- [ ] **Pay:** Stripe Checkout opens → use `4242 4242 4242 4242` test card → returns to confirmation
- [ ] **Confirm page:** shows booking ID, status `requested`, total, scheduled time
- [ ] **Email:** traveler gets request-receipt email (or no-op if Resend not set)
- [ ] **Wait state:** booking visible in `/trips` with `requested` status
- [ ] **Chat:** `/messages/:bookingId` opens, can send a message before accept

### 1.2 Local (host) flow (the supply side)
- [ ] **Apply:** `/become-a-local/apply` form validates client-side (Zod schema)
- [ ] **KYC fields:** date of birth (must be 18+), gov ID upload, live selfie upload
- [ ] **Photos upload:** `/api/upload` returns Supabase Storage URL
- [ ] **Submit:** new `LocalProfile` row with `status: pending`; admin emails fire
- [ ] **Confirmation:** `/become-a-local/apply?submitted=1` shown to applicant
- [ ] **Approval:** admin approves → status becomes `active`, welcome email sent
- [ ] **Visibility:** approved local appears in city search results
- [ ] **Receive booking:** see incoming request in `/host` with `requested` status
- [ ] **Accept:** click Accept → Stripe auth captured → traveler email fires
- [ ] **Decline:** click Decline → Stripe auth canceled (hold released)
- [ ] **Chat:** `/messages/:bookingId` works for the local
- [ ] **Complete:** mark `completed` after the meet

### 1.3 Admin / founder flow
- [ ] `/admin` dashboard loads with counts: applications, active locals, recent bookings
- [ ] `/admin/locals` lists all profiles with status filter
- [ ] **Application review:** admin sees gov ID, selfie, DOB, social links inline
- [ ] **Status transitions:** `pending → active → paused → removed` all work
- [ ] **Verification toggles:** `idVerified`, `bgChecked` flags persist
- [ ] **Manual create:** `/admin/locals/new` works in both `existing` and `new user` modes
- [ ] Admin can view any booking and chat
- [ ] Admin can be the "Accept on behalf of local" once that ships (TODO)

### 1.4 Two-way review flow (post-meet)
- [ ] Both parties get a "leave a review" prompt after `completed`
- [ ] Each writes a review independently — neither sees the other's until both submit
- [ ] On second submit, both rows flip `visible=true` in one transaction
- [ ] Reviews surface on the local's public profile
- [ ] Star average + count update on `/local/:id`

---

## Phase 2 — Integration verification

Each external service: dev mode works, failure modes graceful, prod creds tested.

### 2.1 Stripe (payments)
- [ ] Test mode keys work end-to-end (book → auth → accept → capture → see in Stripe dashboard)
- [ ] **Manual capture confirmed:** PaymentIntent stays `requires_capture` until accept
- [ ] Decline path cancels the auth (verify in Stripe dashboard: `canceled` status)
- [ ] **Webhook idempotency:** replay a `checkout.session.completed` event → no double email, no double booking
- [ ] **No-Stripe fallback:** unset `STRIPE_SECRET_KEY` → flow falls back to request-only mode without crashing
- [ ] **Live keys ready:** business profile complete, account verified, payouts configured
- [ ] Stripe Tax / 1099 reporting plan documented (you have an answer for tax season)

### 2.2 Supabase (DB + Realtime + Storage)
- [ ] **DB connection:** pooled URL works in app, direct URL works for migrations
- [ ] **Realtime:** chat broadcast fires on POST `/api/messages`, other tab receives it
- [ ] **Channel scoping:** confirmed `booking:<id>` is per-booking (not shared)
- [ ] **Storage bucket** `profile-photos` exists, server-side uploads work via service role
- [ ] **RLS policies** in place for any client-readable tables (or confirm no client-direct reads)
- [ ] **Backups enabled** (PITR or daily snapshots — Supabase Pro tier)
- [ ] **Connection limits** acceptable for expected concurrent users

### 2.3 Google OAuth
- [ ] Dev OAuth client has `localhost:3000/api/auth/callback/google` in redirect URIs
- [ ] Prod OAuth client created with prod domain redirect
- [ ] Consent screen has logo, privacy policy URL, terms URL (pre-prod)
- [ ] App is `External` user-type, ready to be `In production` (not `Testing`)

### 2.4 Resend (email)
- [ ] Dev API key works locally
- [ ] **Domain verified** in Resend (DKIM, SPF, DMARC records in DNS)
- [ ] Each transactional template renders correctly:
  - [ ] `bookingRequestedTemplate` → to local
  - [ ] `bookingAcceptedTemplate` → to traveler
  - [ ] `applicationReceivedTemplate` → to admins
  - [ ] `applicationApprovedTemplate` → to local
- [ ] Failure mode: Resend down → app continues, error logged (not user-facing)

### 2.5 (Future) Background-check vendor
- [ ] Vendor selected (Checkr, Persona, etc.)
- [ ] Webhook for status updates wired into LocalProfile flags
- [ ] Manual fallback documented (founder review until automated)

---

## Phase 3 — Edge cases & failure modes

What breaks when something is unavailable? Walk these explicitly.

### 3.1 Booking lifecycle edge cases
- [ ] **Stripe auth expires** (7 days) before local responds → booking auto-cancels with notification
- [ ] **Local doesn't respond** in N hours → reminder email fires (cron or scheduled function)
- [ ] **Traveler cancels** before accept → auth canceled, no charge
- [ ] **Local is deactivated** mid-request → existing bookings honored, no new ones surface
- [ ] **Two travelers** book the same local for overlapping times → first wins, second sees error
- [ ] **Past-time booking attempt** → blocked with friendly error
- [ ] **`scheduledFor` timezone correctness** verified (booking made in PT shows correctly to local in EST)

### 3.2 Payment edge cases
- [ ] **Capture fails** at accept time (card declined, expired) → booking goes to a `payment_failed` state, traveler asked to retry
- [ ] **Refund flow:** completed booking refunded → review state handled correctly
- [ ] **Dispute / chargeback:** Stripe webhook updates booking + alerts admin
- [ ] **Tax handling:** location-based or single rate documented

### 3.3 Trust & safety
- [ ] **Report a user** flow exists (even if just emails admin)
- [ ] **Block a user** flow exists for the local
- [ ] **No-show** flow: local can mark traveler no-show; charge policy applied
- [ ] **Safety check-in:** suggestion in app for traveler to share location during meet (v2, but document plan)
- [ ] **24/7 emergency contact:** documented for v1 (your phone or shared inbox)

---

## Phase 4 — Security & compliance

Marketplace = real money + real people meeting. Don't skip.

### 4.1 Auth & authorization
- [ ] Every server action checks `session?.user?.id`
- [ ] Every API route checks auth via `requireUser` or `requireAdmin`
- [ ] Admin routes gated by `session.user.isAdmin` (and `ADMIN_EMAILS` is the source of truth)
- [ ] **Session expiry** is reasonable (30 days for trust, configurable)
- [ ] CSRF protection enabled (NextAuth handles it for OAuth; verify for API routes)

### 4.2 PII discipline
- [ ] Server logs do NOT contain emails, names, photo URLs (per CLAUDE.md rule 6)
- [ ] Stack traces in prod don't leak DB rows
- [ ] DOB and government ID images **not** in any client bundle
- [ ] Storage URLs for KYC docs are signed/time-limited where possible

### 4.3 Secrets hygiene
- [ ] `.env.local` is gitignored (verify with `git status`)
- [ ] No `process.env.*_SECRET` referenced in `'use client'` files
- [ ] Service-role Supabase key only imported by server modules
- [ ] Stripe webhook signature verified on every event
- [ ] Vercel/Amplify env vars marked **encrypted** for prod

### 4.4 Compliance documents (legally required before charging real money)
- [ ] **Terms of Service** drafted (lawyer review before launch)
- [ ] **Privacy Policy** drafted (covers GDPR/CCPA basics if any users from CA/EU)
- [ ] **Refund / cancellation policy** published
- [ ] **Local services agreement** — independent contractor, 1099-NEC at year-end
- [ ] **Background-check disclosure** if running them
- [ ] **Cookie banner** for EU/UK traffic (or geofence)

### 4.5 Money & payouts
- [ ] **Stripe Connect** strategy decided: Express (recommended) vs. Standard vs. founder-pays-out manually
- [ ] If founder pays out manually for v1, **manual payout SOP** written
- [ ] Platform fee (22%) verified end-to-end on a real test booking
- [ ] Tax form collection plan (W-9 → 1099-NEC) before any local earns >$600

---

## Phase 5 — Performance

Don't optimize prematurely, but don't ship slow either.

- [ ] Home page Lighthouse mobile score ≥ 80
- [ ] Largest Contentful Paint < 2.5s on 4G
- [ ] No N+1 queries in the local list (eager-load via Prisma `include`)
- [ ] Photos served via Supabase + Next.js `<Image>` with `sizes` prop
- [ ] Booking list paginated or capped (100 max per page)
- [ ] Search query has a DB index on `(city, status)` for `LocalProfile`
- [ ] Static pages (home, marketing) actually static (RSC default, not forced dynamic)

---

## Phase 6 — Observability

You can't fix what you can't see.

- [ ] **Error tracking:** Sentry (or alternative) wired in client + server
- [ ] **Stripe webhook errors** alert you (Slack/email/Sentry)
- [ ] **Email send failures** logged + alerting on rate spike
- [ ] **Auth failures** logged (Google OAuth callback errors)
- [ ] **Uptime monitor** on `/` and `/api/v1/bookings` (Better Stack / Pingdom / etc.)
- [ ] **Logs** viewable for at least 7 days (Vercel/Amplify default usually fine)
- [ ] **Prod console** for inspecting bookings (Supabase studio + admin pages)

---

## Phase 7 — Production deployment

Platform decision matters: pick one and commit. Per the architecture session,
recommended path is **Vercel for v1**, migrate to Amplify/AWS only when
revenue justifies it.

### 7.1 Domain & DNS
- [ ] Domain registered (`meetlocal.ai`) and pointed at host
- [ ] SSL active (auto via Vercel/Amplify)
- [ ] `www` → apex redirect set
- [ ] Email DNS records (Resend DKIM/SPF/DMARC) verified
- [ ] Google Search Console verified

### 7.2 Hosting
- [ ] **Vercel project** created and linked to GitHub repo
- [ ] All env vars from Phase 0.2 added in Vercel (encrypted)
- [ ] Production branch is `main`; PR previews enabled
- [ ] Build logs reviewed — no warnings
- [ ] First successful prod deploy from `main`

### 7.3 Supabase prod project
- [ ] Separate Supabase project for prod (NOT same as dev)
- [ ] Pro tier enabled (PITR backups, higher connection limit)
- [ ] `npm run db:migrate` against prod (NOT `db:push`)
- [ ] Storage bucket `profile-photos` created with correct RLS
- [ ] `ADMIN_EMAILS` includes the right founder emails

### 7.4 Stripe prod
- [ ] Live mode API keys swapped in
- [ ] Live webhook endpoint at `https://meetlocal.ai/api/stripe/webhook` registered
- [ ] Webhook signing secret updated in env vars
- [ ] **Account fully verified** (business details, banking, ID)
- [ ] Tax settings configured

### 7.5 OAuth prod
- [ ] Google OAuth client switched to "In production"
- [ ] Prod redirect URI added: `https://meetlocal.ai/api/auth/callback/google`
- [ ] Privacy policy + ToS URLs filled in on consent screen
- [ ] App verification submitted to Google (can take days for sensitive scopes)

### 7.6 Smoke test on prod
After each deploy, verify on the **live site**:
- [ ] Home page loads, no console errors
- [ ] Sign in with Google works
- [ ] Apply-to-be-a-local form submits
- [ ] (As founder) approve a test local
- [ ] Book that local with a real card on the smallest possible amount
- [ ] Accept on behalf of the local
- [ ] Capture works in Stripe dashboard
- [ ] Refund the test booking

---

## Phase 8 — Launch playbook

The week before, the day of, the week after.

### 8.1 Pre-launch (T-7 days)
- [ ] All checkboxes above are green
- [ ] **10 vetted locals live** in each launch city (40 total)
- [ ] **Friends-and-family soft launch** — 20 test users do real bookings (refund after)
- [ ] Status page set up (`status.meetlocal.ai` or simple)
- [ ] Support email monitored (`hello@` or `support@`)
- [ ] Social accounts ready (handle reservation, basic posts)

### 8.2 Day-of
- [ ] Founder on standby in Slack/email for 12 hours post-launch
- [ ] Watching: signups, booking attempts, error rate, Stripe dashboard
- [ ] Pre-drafted social posts scheduled
- [ ] First-100-users incentive ready (free first booking, comp the platform fee, etc.)

### 8.3 Post-launch (week 1)
- [ ] Daily metric review: signups, bookings, completion rate, NPS-ish feedback
- [ ] First retro: what broke, what surprised, what to fix Monday
- [ ] Iterate: ship at least 2 fixes/improvements based on real user behavior

---

## Component-by-component status (current snapshot)

Quick state of the world based on what's in the repo right now. Update as you go.

| Component | Status | Notes |
|---|---|---|
| Auth (NextAuth + Google) | ✅ Working | Verify prod OAuth client + consent screen |
| Search bar (City/Date/Vibe) | ✅ Working | Recent fix: popover always opens down |
| Locals discovery / profile | ✅ Working | Confirm DB indexes for filter queries |
| Apply-to-be-a-local | ✅ Working | Now uses Zod schemas; KYC fields enforced |
| Admin locals approval | ✅ Working | `setLocalStatus`, verification flags work |
| Booking creation | ✅ Working | Refactored to pure lib; Stripe + request-only |
| Booking accept/decline/complete | ✅ Working | Pure lib in `src/lib/bookings.ts` |
| Stripe webhook | ⚠️ Verify | Confirm idempotency; replay test event |
| Realtime chat | ⚠️ Verify | Channel scoping confirmed in code; load-test |
| Two-way reviews | ⚠️ Verify | Transaction logic in `/api/reviews` — write a test |
| Email (Resend) | ⚠️ Verify | Domain verification before launch |
| Storage uploads | ⚠️ Verify | Bucket RLS + signed URLs for KYC docs |
| `/api/v1/*` mobile-callable API | ✅ Built | Bookings + applications + admin endpoints |
| Background checks | ❌ Not built | Manual founder review for v1 |
| Sentry / error tracking | ❌ Not built | Add before prod traffic |
| Cron / scheduled tasks | ❌ Not built | Stripe-auth-expiry reminder, weekly digests |
| ToS / Privacy / Refund | ❌ Not drafted | Lawyer before live payments |
| Stripe Connect (local payouts) | ❌ Not built | Manual payouts viable for v1 |

Legend: ✅ working · ⚠️ exists, needs verification · ❌ not built yet

---

## How to use this document with Claude Code

When you want to work through a component:

> "Let's verify component 1.1 traveler flow end-to-end on local — walk me through it and find what breaks"

> "Build component 8.1 background-check integration with Persona, and run it through Phase 1–4 of this checklist"

> "Audit Phase 4.1 (auth & authorization) against the current codebase and tell me where there are gaps"

I'll use this file as the source of truth and check off items as we
complete them. Don't try to do all of this in one session — pick the
component closest to your launch blocker and finish it.
