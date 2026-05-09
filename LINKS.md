# Links — quick reference

Bookmark this. Every URL you need across personas + every external service
dashboard for the stack.

---

## App URLs (localhost)

Replace `localhost:3000` with your prod domain (`meetlocal.ai`) for live.

### Public / unauthenticated
| URL | What |
|---|---|
| `http://localhost:3000/` | Home / Discover (search bar + featured locals) |
| `http://localhost:3000/local/<id>` | Public local profile (what travelers see) |
| `http://localhost:3000/become-a-local` | Pitch landing for becoming a local |
| `http://localhost:3000/signin` | Sign in (Google + magic link) |
| `http://localhost:3000/?city=mia&when=tonight&vibes=culture` | Pre-filtered Discover (4 cities × vibes) |

### Cities (slugs for filtering)
| Slug | City |
|---|---|
| `mia` | Miami, FL |
| `tampa` | Tampa, FL |
| `bay-area` | Bay Area, CA |
| `portland-me` | Portland, ME |

### Authenticated traveler
| URL | What |
|---|---|
| `http://localhost:3000/trips` | Your bookings as a traveler |
| `http://localhost:3000/book/<localId>` | Booking form |
| `http://localhost:3000/booking/<bookingId>/confirmed` | Post-payment confirmation |
| `http://localhost:3000/messages/<bookingId>` | Chat with the local for a booking |
| `http://localhost:3000/review/<bookingId>` | Leave a review post-meet |

### Authenticated local (host)
| URL | What |
|---|---|
| `http://localhost:3000/host` | Host dashboard (incoming requests, this-week earnings) |
| `http://localhost:3000/become-a-local/apply` | Application form (KYC + bio + rate) |
| `http://localhost:3000/local/<your-id>` | Your own public profile |
| `http://localhost:3000/messages/<bookingId>` | Same chat URL as traveler — your role flips based on who you are |

### Admin (founder)
| URL | What |
|---|---|
| `http://localhost:3000/admin` | Founder dashboard (recent bookings, accept-on-behalf) |
| `http://localhost:3000/admin/locals` | All locals (filter by status: pending/active/paused/removed) |
| `http://localhost:3000/admin/locals?status=pending` | Pending applications to approve |
| `http://localhost:3000/admin/locals/<id>` | Edit individual local — toggle status, set verifications |
| `http://localhost:3000/admin/locals/new` | Create a local on behalf of a real user |

### Mobile-callable API (`/api/v1/*`)
All require auth (session cookie or, future, bearer token).

| Method | URL | What |
|---|---|---|
| `POST` | `/api/v1/bookings` | Create a booking (returns `{ booking, checkoutUrl }`) |
| `POST` | `/api/v1/bookings/<id>/accept` | Local accepts → captures Stripe auth |
| `POST` | `/api/v1/bookings/<id>/decline` | Local/admin declines → cancels Stripe auth |
| `POST` | `/api/v1/bookings/<id>/complete` | Mark `confirmed → completed` |
| `POST` | `/api/v1/applications` | Submit local application (KYC fields) |
| `PATCH` | `/api/v1/admin/locals/<id>/status` | Admin: set local status |
| `PATCH` | `/api/v1/admin/locals/<id>/verification` | Admin: toggle ID/BG flags |

### Auth + debugging
| URL | What |
|---|---|
| `http://localhost:3000/api/auth/providers` | List configured auth providers (Google, Resend) |
| `http://localhost:3000/api/auth/signin/google` | Direct Google OAuth start |
| `http://localhost:3000/api/auth/signout` | Sign out |
| `http://localhost:3000/api/auth/session` | Current session JSON |
| `http://localhost:3000/api/checkout` | Retry-payment helper |
| `http://localhost:3000/api/upload` | Server-side photo upload |
| `http://localhost:3000/api/messages` | Chat broadcast (legacy) |
| `http://localhost:3000/api/reviews` | Two-way review transaction |
| `http://localhost:3000/api/stripe/webhook` | Stripe webhook receiver (don't open manually) |

---

## External services — dashboards

### Stripe (test mode)
| Page | URL |
|---|---|
| Dashboard home | https://dashboard.stripe.com/test |
| API keys | https://dashboard.stripe.com/test/apikeys |
| Branding settings | https://dashboard.stripe.com/test/settings/branding |
| Payments (all test charges) | https://dashboard.stripe.com/test/payments |
| Webhook endpoints | https://dashboard.stripe.com/test/webhooks |
| Events log | https://dashboard.stripe.com/test/events |
| Test cards reference | https://docs.stripe.com/testing |

### Stripe (live mode)
Same URLs without `/test/`. **Don't open these casually** — they show real money:
| Page | URL |
|---|---|
| Dashboard home | https://dashboard.stripe.com/ |
| Branding settings | https://dashboard.stripe.com/settings/branding |

### Supabase
| Page | URL |
|---|---|
| Dashboard | https://supabase.com/dashboard |
| Your project | https://supabase.com/dashboard/project/<your-project-id> |
| Table editor | https://supabase.com/dashboard/project/<id>/editor |
| SQL editor | https://supabase.com/dashboard/project/<id>/sql |
| Storage (profile-photos bucket) | https://supabase.com/dashboard/project/<id>/storage/buckets/profile-photos |
| Realtime monitoring | https://supabase.com/dashboard/project/<id>/realtime |
| Auth users | https://supabase.com/dashboard/project/<id>/auth/users |

### Google Cloud / OAuth
| Page | URL |
|---|---|
| Cloud Console | https://console.cloud.google.com/ |
| OAuth consent screen | https://console.cloud.google.com/apis/credentials/consent |
| OAuth credentials | https://console.cloud.google.com/apis/credentials |
| Verification submission | https://support.google.com/cloud/answer/13463073 |

### Resend
| Page | URL |
|---|---|
| Dashboard | https://resend.com/overview |
| API keys | https://resend.com/api-keys |
| Domains (DKIM/SPF) | https://resend.com/domains |
| Emails sent log | https://resend.com/emails |

### Vercel (when you deploy)
| Page | URL |
|---|---|
| Dashboard | https://vercel.com/dashboard |
| Project settings | https://vercel.com/<team>/<project>/settings |
| Environment variables | https://vercel.com/<team>/<project>/settings/environment-variables |
| Deployment logs | https://vercel.com/<team>/<project>/deployments |

### Domain & DNS
| Page | URL |
|---|---|
| Cloudflare DNS *(or your registrar)* | https://dash.cloudflare.com/ |
| DNS propagation check | https://dnschecker.org/ |
| WHOIS | https://whois.domaintools.com/meetlocal.ai |

### Legal / IP / Operations
| Page | URL |
|---|---|
| USPTO trademark search | https://tmsearch.uspto.gov/ |
| USPTO TEAS Plus filing | https://teas.uspto.gov/ |
| Stripe Atlas (DE C-corp) | https://stripe.com/atlas |
| 409A valuation (Carta) | https://carta.com/ |
| Termly (ToS / Privacy templates) | https://termly.io/ |
| Persona (KYC vendor) | https://withpersona.com/ |
| Checkr (background checks) | https://checkr.com/ |

### Project repo + tools
| Page | URL |
|---|---|
| Local dev server | http://localhost:3000 |
| Prisma Studio (DB GUI) | run `npm run db:studio` → opens on :5555 |
| Stripe CLI listen output | (your second terminal running `stripe listen`) |

---

## Test cards (Stripe test mode only)

| Card | Behavior |
|---|---|
| `4242 4242 4242 4242` | Success — auth + capture work |
| `4000 0000 0000 0002` | Generic decline |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0027 6000 3184` | Requires 3DS authentication |
| `4000 0000 0000 0341` | Authorize, then capture FAILS (test capture errors) |

Any future expiry (e.g., `12/30`), any 3-digit CVC, any 5-digit ZIP.

---

## Project docs (this repo)

| File | What |
|---|---|
| [README.md](README.md) | Product story |
| [PLAYBOOK.md](PLAYBOOK.md) | Engineering reference (architecture, scaling, anti-patterns, IP, HR) |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | 184-checkbox pre-launch verification |
| [CLAUDE.md](CLAUDE.md) | Rules for Claude Code |
| [AGENTS.md](AGENTS.md) | Next 16 reminder |
| [LINKS.md](LINKS.md) | This file |

---

## When something is broken — first link to open

| Symptom | First place to check |
|---|---|
| Sign-in failing | http://localhost:3000/api/auth/providers |
| Booking not creating | Prisma Studio → Booking table |
| Stripe webhook silent | `stripe listen` terminal |
| Capture failed | https://dashboard.stripe.com/test/payments → click PI |
| Realtime chat dead | Supabase Dashboard → Realtime |
| Email not sending | https://resend.com/emails |
| Build failing | terminal output of `npm run build` |
| Search empty | Prisma Studio → LocalProfile.status filter |
| Admin can't see /admin | check `ADMIN_EMAILS` in `.env` |
