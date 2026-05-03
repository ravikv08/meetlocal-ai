# meetlocal.ai

Marketplace connecting solo travelers with vetted locals for 1–4 hour real-time
experiences. Web-first MVP for the v1 launch in **Miami · Tampa · Bay Area · Portland, ME**.

UI is ported faithfully from the original [Claude Web Prototype](./design-source/Web%20Prototype.html)
(the source files live under [`design-source/`](./design-source/) — they're not built or
shipped, kept for reference and iteration).

## End-to-end loop

```
sign in (Google) → discover → local profile → /book → /book/spots → submit →
  Stripe Checkout (if configured) → confirmation → /messages (real-time chat) → /review
```

Apply to be a local: `/become-a-local` → form → admin approves at `/admin/locals` →
local is notified by email → goes live in their city.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Postgres via Supabase + Prisma 6
- NextAuth v5 (Google OAuth + Prisma adapter, database sessions)
- Supabase Realtime for in-app chat (channel per booking)
- Supabase Storage for profile photo uploads (`profile-photos` bucket)
- Stripe Checkout (`capture_method: manual` — authorize on book, capture when local accepts)
- Resend for transactional email (booking requested/accepted, application received/approved)

## First-time setup

### 1. Supabase — database + realtime + storage
1. [Create a project](https://supabase.com/dashboard) — region `us-east-1` is fine.
2. **Settings → Database → Connection string**:
   - "Connection pooling" (port 6543) → `DATABASE_URL`
   - "URI / Direct" (port 5432) → `DIRECT_URL`
3. **Settings → API**: copy `Project URL`, `anon public`, and `service_role` keys.
4. **Storage → Create bucket**: name it **`profile-photos`**, mark it **public** (read).
   Uploads happen server-side via the service role key, so write privileges
   stay on the server.
5. Realtime is on by default — no extra setup for chat.

### 2. Google OAuth (sign-in)
1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) → Create OAuth client ID
2. App type: **Web application**
3. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID + Secret → `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 3. Stripe — payments
1. [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys)
2. Copy **Secret** → `STRIPE_SECRET_KEY`, **Publishable** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. For local webhook testing, install the Stripe CLI and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`.
4. The booking flow uses `capture_method: manual` — payment is *authorized* on
   submit, *captured* when the local accepts. Until the local accepts, the
   traveler isn't charged.

> **Without Stripe configured**: the booking flow falls back to "request only"
> mode. The Booking row is created and the local is emailed, but no charge
> happens. Useful for early-stage testing with friends.

### 4. Resend — transactional email
1. [Resend → API Keys](https://resend.com/api-keys) → create one
2. `RESEND_API_KEY` → that key
3. `RESEND_FROM` → keep `meetlocal <onboarding@resend.dev>` to test without
   verifying a domain. For production, [verify your domain](https://resend.com/domains)
   and switch to e.g. `meetlocal <hello@meetlocal.ai>`.

> **Without Resend configured**: `sendEmail()` no-ops with a console warning.
> Bookings still work; the founder just won't get pinged.

### 5. Env + run
```bash
cp .env.example .env
# Fill in everything from steps 1–4. AUTH_SECRET = `openssl rand -base64 32`.
# ADMIN_EMAILS auto-promotes those addresses to isAdmin on first sign-in.

npm install
npm run db:push      # creates all tables
npm run db:seed      # 10 vetted locals + 12 meeting spots
npm run dev          # → http://localhost:3000
```

## Common commands
```bash
npm run dev          # dev server
npm run build        # production build (also typechecks)
npm run db:studio    # GUI to inspect/edit DB rows
npm run db:push      # push schema changes (no migration history)
npm run db:migrate   # create + run a migration (preferred for prod)
npm run db:seed      # re-seed locals & meeting spots (idempotent)
```

## Routes
```
PUBLIC PAGES
/                              Discover (city + category filters)
/local/[id]                    Local profile + booking sidebar
/become-a-local                Pitch page for prospective locals
/become-a-local/apply          Application form (paper theme, photo upload)
/signin                        Google OAuth

AUTHED — TRAVELER
/book/[localId]                Paper-themed checkout (Stripe-style)
/book/[localId]/spots          Meeting-spot picker (Starbucks Rule)
/booking/[bookingId]/confirmed Request-sent confirmation
/messages/[bookingId]          Real-time chat (traveler ↔ local)
/review/[bookingId]            Two-way review (hidden until both submit)

AUTHED — ADMIN
/admin                         Founder dashboard (counts + recent bookings)
/admin/locals                  Approve / pause local profiles

API
GET/POST /api/auth/...         NextAuth handlers
POST /api/checkout             Create Stripe Checkout session for a booking
POST /api/stripe/webhook       Stripe events (checkout.session.completed → notify local)
POST /api/messages             Persist message + Supabase broadcast
POST /api/reviews              Submit review; flips both visible when matched
POST /api/upload               Accept multipart file → upload to Supabase Storage
```

## Email triggers (Resend)

| Event | Recipient | Template |
|---|---|---|
| Stripe checkout completed for a booking | Local | `bookingRequestedTemplate` |
| Stripe not configured + booking submitted | Local | `bookingRequestedTemplate` (sent inline) |
| New application submitted via `/become-a-local/apply` | Each `ADMIN_EMAILS` | `applicationReceivedTemplate` |
| Admin sets a `pending` local to `active` | Local | `applicationApprovedTemplate` |

Add new templates in [`src/lib/email.ts`](src/lib/email.ts).

## Project layout
```
prisma/
  schema.prisma           Postgres schema (User, LocalProfile, Booking, Message, Review, MeetingSpot)
  seed.ts                 v1 fixture data (10 locals, 4 cities, 12 spots)
src/
  auth.ts                 NextAuth config (Google + Prisma adapter)
  app/
    page.tsx              Discover
    signin/page.tsx       Google OAuth landing
    local/[id]/page.tsx   Local profile + booking sidebar
    become-a-local/
      page.tsx            Pitch / landing
      apply/{page.tsx, ApplyForm.tsx, actions.ts}
    book/[localId]/
      page.tsx, actions.ts, spots/page.tsx
    booking/[bookingId]/confirmed/page.tsx
    messages/[bookingId]/page.tsx + ChatRoom.tsx (Supabase Realtime)
    review/[bookingId]/page.tsx + ReviewForm.tsx
    admin/page.tsx, admin/locals/{page.tsx,actions.ts}
    api/
      auth/[...nextauth]/route.ts
      checkout/route.ts            Stripe Checkout (client-side retry)
      stripe/webhook/route.ts      Stripe → DB + email
      messages/route.ts
      reviews/route.ts
      upload/route.ts              Supabase Storage upload
  components/
    SiteHeader (auth-aware), SiteFooter, LocalCard, Avatar, Logo, PhotoUpload
  lib/
    cities.ts             4 launch cities + categories + residency tiers
    queries.ts            Prisma read helpers
    prisma.ts             Singleton client
    supabase.ts           Browser client (Realtime)
    supabase-server.ts    Server client (broadcast + storage)
    storage.ts            uploadProfilePhoto() helper
    stripe.ts             Stripe client + createCheckoutSessionForBooking()
    email.ts              Resend wrapper + transactional templates
    utils.ts              cn(), avatarGradient(), formatPrice()
design-source/            Original Claude prototype — reference only, not built
```

## Testing the full loop locally

You need at least 2 user accounts to test traveler ↔ local chat. Two ways:

1. **Two Google accounts**: account A signs in (becomes a traveler), books a
   local. Account B signs in via `/become-a-local/apply`, founder approves at
   `/admin/locals`. Account A then re-books B and chat works between them.
2. **Just yourself**: book a seeded local profile against your own account —
   chat works in one window because both `senderId`s are you.

## Decisions worth knowing
- **Web-first, no native app**: ships in days vs months. React Native is Phase 3 per the playbook.
- **No 7-agent AI system in v1**: the data model is correct so it can be added later.
- **Stripe Checkout, not Stripe Connect**: for the first 10 locals, the founder
  pays them out manually (Venmo/Zelle/wire). Connect adds days of work and KYC
  surface area; defer until liquidity justifies it.
- **`capture_method: manual`**: traveler card is *authorized* on book, only
  captured after the local accepts. Auth expires in 7 days if no accept.
  *(Capture is wired into the schema but the admin "Accept on behalf of local"
  action that calls `paymentIntents.capture()` is the next thing to add.)*
- **No geofenced arrival engine**: the playbook's killer feature, but it
  requires native + meaningful supply density. v1 uses city tabs.
- **"Starbucks Rule" enforced via data, not AI**: meeting spots are pre-vetted
  and surfaced in the picker. No prompt-engineered Coordination Agent yet.
- **Founder vets every local manually**: status enum on `LocalProfile`
  (`pending → active → paused → removed`). Approve from `/admin/locals` —
  approval emails the local automatically.
- **Two-way reviews**: stored hidden until counterpart submits, then both
  visible in a single transaction. Prevents retaliation reviews.

## Next on the build list
- **Local "Accept" action** — captures the Stripe payment intent + flips
  booking to `confirmed`, emails the traveler.
- **Local dashboard** at `/local-dashboard` (incoming requests + earnings,
  faithful port of the prototype's `ArrivalScreen`)
- **Push notifications** (web push for v1, native later)
- **Real seed data** — swap the 10 placeholder locals for the founder's actual
  network in [`prisma/seed.ts`](prisma/seed.ts).
