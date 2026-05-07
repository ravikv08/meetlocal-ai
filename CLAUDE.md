@AGENTS.md

## meetlocal.ai — context for Claude Code

A marketplace connecting solo travelers with vetted locals for 1–4 hour
real-time experiences. **Web-first MVP** for the v1 launch in Miami,
Tampa, the Bay Area, and Portland (ME). The full product story —
end-to-end loop, routes, email triggers, decisions worth knowing — is in
[README.md](README.md). Read it once at session start; this file
captures only the rules you can't derive from reading the code.

> **Important:** Next.js 16 has breaking changes from your training
> data. The `@AGENTS.md` directive at the top of this file is
> non-negotiable — read `node_modules/next/dist/docs/` for any
> Next-specific code. The `nextjs-16-docs` skill enforces this.

## Stack (don't change without a reason)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Server components, streaming, server actions |
| Language | TypeScript (strict) | Required everywhere; no `any` slipping in |
| Styling | Tailwind v4 | `@theme` in [src/app/globals.css](src/app/globals.css) |
| DB | Postgres via Supabase | Managed, branching, free tier covers MVP |
| ORM | Prisma 6 | Type-safe, great DX; `db:push` for dev, `db:migrate` for prod |
| Auth | NextAuth v5 (beta) + Prisma adapter | Google OAuth, database sessions |
| Realtime | Supabase Realtime (channel per booking) | Lowest-friction live chat |
| Storage | Supabase Storage (`profile-photos` bucket) | Server-side uploads via service role |
| Payments | Stripe Checkout, `capture_method: manual` | Authorize on book, capture on accept |
| Email | Resend | Transactional only; no marketing pipeline |
| Validation | Zod | At every server-action / API boundary |
| Forms | react-hook-form + `@hookform/resolvers` | Zod-resolver pattern across the app |
| Toasts | sonner | One `<Toaster />` in the root layout |
| Icons | lucide-react | Existing dep |

The MCP config at [.mcp.json](.mcp.json) wires the **Supabase MCP server**
in read-only mode. When the user asks DB questions, prefer that over
shelling out to `psql`.

## Golden rules (these are the non-negotiables)

1. **Read the Next.js bundled docs first.** Next 16 ≠ Next 14/15. Don't
   write a route handler, server action, `headers()/cookies()` call, or
   metadata config from memory. `grep -ril <topic> node_modules/next/dist/docs/`.
2. **Server components by default.** Mark `'use client'` only for
   interactive code (hooks, event handlers, browser APIs). Most pages
   are server components that pass props into small client components.
3. **Validate at boundaries with Zod.** Every server action, every API
   route handler, every form. Don't trust client input. Reuse schemas
   between client form validation and server validation.
4. **Money is integer cents, never floats.** Prisma `Int` (cents) over
   `Float` (dollars). Even though Stripe takes amounts in the smallest
   currency unit anyway, *our* code should never store dollars as floats.
5. **Stripe captures only on local accept.** `capture_method: manual`
   means the auth is held until the local accepts the booking. Until
   the "Accept on behalf of local" admin action lands, captures are
   manual — don't auto-capture in webhook handlers without a clear
   business reason.
6. **PII discipline.** Don't log emails, names, or photo URLs in plain
   server logs. Pass IDs and look them up if needed in dev.
7. **Two-way reviews stay hidden until both submit.** The matching
   transaction in [src/app/api/reviews/route.ts](src/app/api/reviews/route.ts)
   flips `visible=true` on both rows in one transaction. Don't break that.
8. **Supabase Realtime channel per booking.** Don't share channels
   across bookings. The chat boundary is `booking:<bookingId>`.
9. **Locals are vetted manually.** A `LocalProfile.status` enum
   (`pending → active → paused → removed`) gates visibility.
   Auto-approval is an explicit anti-feature for v1.
10. **Idempotency on Stripe webhooks.** The webhook handler must be safe
    to replay. Stripe retries; we must not double-email or double-charge.

## What "done" looks like for a feature

- Type checks (`npm run build` includes typecheck) — clean.
- Lint clean (`npm run lint`).
- The end-to-end flow runs locally with both `DATABASE_URL` and
  `STRIPE_SECRET_KEY` set; falls back gracefully without Stripe.
- Email triggers either fire or no-op (Resend is optional in dev).
- Schema changes are pushed via `npm run db:push` (dev) and a migration
  is created (`npm run db:migrate`) before merging.
- A new route is reachable via the navigation tree; orphan pages are
  bugs.

## Project layout (high-level — README has the full version)

```
prisma/
  schema.prisma        # User, LocalProfile, Booking, Message, Review, MeetingSpot, Story
  seed.ts              # idempotent v1 seed (10 locals, 4 cities, 12 spots)
src/
  auth.ts              # NextAuth v5 config (Google + Prisma adapter)
  app/
    api/               # auth, checkout, stripe/webhook, messages, reviews, upload
    admin/             # founder dashboard + locals approval
    book/              # paper-themed booking flow
    booking/           # confirmation page
    messages/          # real-time chat
    review/            # two-way reviews
    become-a-local/    # apply page + admin approval
    local/             # public local profile
    signin/            # Google OAuth landing
  components/          # SiteHeader, SiteFooter, LocalCard, Avatar, Logo, PhotoUpload
  lib/
    prisma.ts          # singleton client
    queries.ts         # Prisma read helpers
    booking-actions.ts # server actions for the booking flow
    stripe.ts          # createCheckoutSessionForBooking()
    supabase.ts        # browser client (Realtime)
    supabase-server.ts # server client (broadcast + storage)
    storage.ts         # uploadProfilePhoto()
    email.ts           # Resend wrapper + transactional templates
    cities.ts          # 4 launch cities + categories
    date-utils.ts      # local-time aware helpers
```

## Skills available

These load when relevant from `.claude/skills/`:

| Skill | When it loads |
|---|---|
| `nextjs-16-docs` | Any Next-specific code (route handlers, server actions, metadata, etc.) |
| `prisma-supabase` | Schema changes, queries, migrations, RLS, Postgres specifics |
| `stripe-checkout` | The booking → checkout → webhook flow; `capture_method: manual` |
| `supabase-realtime` | The chat in `/messages/[bookingId]` and any new realtime feature |
| `nextauth-v5` | Auth config, session handling, route guards, admin gating |

## How to start a session

1. Read this file (you already are) — don't skip the README link.
2. If the ask touches the schema → load `prisma-supabase`.
3. If the ask touches `/book`, `/booking`, or webhooks → load `stripe-checkout`.
4. If the ask touches `/messages` → load `supabase-realtime`.
5. If the ask touches auth, sessions, or admin → load `nextauth-v5`.
6. If you're writing any new Next code → keep `nextjs-16-docs` loaded
   the whole session.

## Anti-patterns

- ❌ Writing a route handler from memory without checking
  `node_modules/next/dist/docs/`. Next 16 changed enough.
- ❌ `pages/` directory, `getServerSideProps`, `next/head`, `next/router`
  — App Router only.
- ❌ Marking a whole tree `'use client'` to avoid thinking about the
  boundary. Move interactivity into a small client component.
- ❌ Floating-point money. Cents-as-integers everywhere.
- ❌ Direct database calls from a client component. Always go through a
  server action or API route.
- ❌ Auto-approving Locals or auto-publishing applications. v1 is
  founder-vetted; that's a feature, not a bottleneck.
- ❌ Sharing Realtime channels across bookings. One channel per booking.
- ❌ Logging emails, names, or any PII to stdout in production code paths.
- ❌ Adding marketing email automation to the Resend wrapper.
  Transactional only.
- ❌ Switching ORMs, auth providers, or payment processors without
  raising the cost explicitly with the user. The stack is intentional.

## Reference: when to ask vs act

- **Schema change** → discuss the migration plan first if it's
  destructive (drops, renames, NOT NULL on existing column).
- **New env var** → add to `.env.example` and call it out in the response.
- **New email template** → add to [src/lib/email.ts](src/lib/email.ts);
  show the user the templated copy before wiring the trigger.
- **New admin power** (e.g. "Accept on behalf of local") → confirm the
  failure modes (what does Stripe do if capture fails?) before building.
