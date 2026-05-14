# Growth Playbook — meetlocal.ai

> Applying Gustaf Alstromer's Airbnb growth doctrine. Alstromer led Airbnb's growth team from 3 → 120 people. The hierarchy he teaches is the canonical sequence for trust-marketplace growth.
>
> Source: [How to Get Users and Grow — Gustaf Alstromer (Airbnb)](https://medium.com/fastrecap/how-to-get-users-and-grow-by-airbnb-product-lead-gustaf-alstromer-7043600f0b83)

---

## 0. The doctrine (Alstromer's strict ordering)

> *"A startup is all about growth — but you must find product market fit first, or you can grow like crazy and then fall down."* — Alstromer

The order **cannot be skipped.** Trying to scale before the prior step is built is how trust marketplaces die.

```
0. RETENTION                ← prerequisite for everything
   ↓ (only when retention is flat)
1. FUNNEL OPTIMIZATION      ← squeeze the leaks
   ↓
2. ENGINEERED REFERRALS     ← give the word-of-mouth a system
   ↓
3. SEO AT SCALE             ← compound, organic, free
   ↓
4. PAID ACQUISITION         ← only if LTV > CAC math works
   ↓
5. BRAND MARKETING          ← last; hardest to measure
```

Maps cleanly onto our [LAUNCH_STAGES.md](LAUNCH_STAGES.md). Each growth phase unlocks at a launch-stage gate.

---

## 1. RETENTION FIRST (the prerequisite, Stage 0–1)

> *"If your retention becomes flat — meaning that you don't keep losing users as time goes on — then that's a good product market fit."*

### The core metric for meetlocal

Alstromer's examples:
- Airbnb: **bookings (annual frequency)**
- Facebook: daily active users
- Stripe: daily/hourly transactions
- Lyft: weekly/monthly transactions

**For meetlocal: completed bookings per traveler per year + repeat-booking rate.**

Target benchmarks (from successful trust marketplaces):
- **Year 1 retention:** ≥ 35% of travelers book a 2nd time within 12 months
- **Curve shape:** retention should *flatten* somewhere — Alstromer's Netflix example: 70% after 1yr, 30% after 7 years. The 7-year asymptote is the real PMF signal.

### The pre-scale test (when you have <100 users)

> *"If you're too small to effectively measure retention, go out and ask your customers: 'How would you feel if you can no longer use my product?'"*

This is the Sean Ellis "must have" survey, adapted by Alstromer. Run it at every customer discovery interview (already in [CUSTOMER_DISCOVERY_KIT.md](CUSTOMER_DISCOVERY_KIT.md)):

> *"If meetlocal disappeared tomorrow, how would you feel? (a) Very disappointed (b) Somewhat disappointed (c) Not disappointed"*

**Target:** ≥ 40% answer (a) Very disappointed. That's the Sean Ellis PMF threshold. Below that, you don't have PMF yet; growth work is premature.

### Implication for our launch stages

| LAUNCH_STAGES gate | What retention must show |
|---|---|
| 0 → 1 (30 hand-touched) | ≥ 40% of interview subjects say "very disappointed" |
| 1 → 2 (200 bookings) | ≥ 25% repeat-booking rate within 6 weeks |
| 2 → 3 (2K bookings) | ≥ 35% annual repeat rate · cohort retention curve flattening |
| 3 → 4 (20K) | ≥ 40% annual repeat, 7-yr cohort retention curve visible |

**Don't move to growth Phase 1 (funnel) until Stage 1 → 2 retention shows.**

---

## 2. FUNNEL OPTIMIZATION (Phase 1 of growth, ~Stage 2)

> *"Your product is a funnel, it has many many steps (signup, payment, etc.). You should work on every step to optimize conversions."*

### The meetlocal funnel — every step that can be optimized

```
Discover  ──►  Search  ──►  View profile  ──►  Send request  ──►  Local accepts
   ↓             ↓               ↓                  ↓                    ↓
Conversion %   Click-through   Profile-CTR       Submit rate        Accept rate
(home → search)              (card→profile)
```

For each step, instrument the conversion %. Then optimize.

### Real-world Alstromer numbers we should aim to beat

| Test | Lift |
|---|---|
| Custom iOS share sheet vs. native | **+40% shares** |
| Renaming "Sign up" → "Accept invitation" in email | **+14% sign-ups** |

These are micro-changes with macro impact. Once we have 2K+ users, every funnel step gets tested.

### Specific funnel tests to run at Stage 2

| Test | Hypothesis |
|---|---|
| `/signin` button text | "Get started" vs "See locals in [city]" — emotional vs functional |
| Local card CTA | "View profile" vs "Meet [first name]" — abstraction vs personal |
| Confirmation page | "Message [local]" CTA vs "Share with a friend" — completing vs spreading |
| Apply form | One long form vs 3-step wizard |
| Email subject line for booking | "[Local] wants to confirm" vs "Your Miami day is set" |

**Rule of thumb (Alstromer):** Don't A/B test until you have audience size to see a significant change within 2–3 weeks. For meetlocal that's roughly **>2K monthly active users**. Until then, ship based on conviction + craft + taste *(Chesky)*.

---

## 3. ENGINEERED REFERRALS (Phase 2 of growth, ~Stage 2)

This is the move that made Airbnb. **The single most important growth feature for meetlocal.**

### Alstromer's exact Airbnb mechanic

> *"$40 / $20"* — Referrer gets $40 when their referee completes a first booking. Referee gets $20 off their first booking.
>
> *"They optimized the referral's funnel for years."*

### The 5 ingredients of the Airbnb referral email (per Alstromer, verbatim)

| # | Ingredient | Example |
|---|---|---|
| 1 | **Social proof** | "Gustaf invited you…" (referrer's name in subject) |
| 2 | **Clear value** | "Gustaf sent you $40 for your first trip" |
| 3 | **Urgency** | "Sign up by May 25, 2018" |
| 4 | **Exclusivity** | Button says "Accept invitation" — never "Sign up" |
| 5 | **Endorsement signals** | Referrer's name, photo, where they live, how long a customer |

### Adapted for meetlocal — proposed mechanic

| Side | Reward | Trigger |
|---|---|---|
| **Referrer (existing traveler)** | $20 credit toward next booking | Referee completes first booking |
| **Referee (new traveler)** | $15 off first booking | Signs up via referral link |
| **Referrer (existing local)** | $50 cash bonus | Referee completes first booking as either side |
| **Referee → applied as local** | Fast-tracked review (< 24h) + welcome packet | Verified + approved |

**Why these numbers:**
- $15 off first booking lowers the friction of meeting a stranger (matches Tier 3 ~$50 minimum booking → 30% discount)
- $20 referrer credit is psychologically meaningful but doesn't break our margin
- $50 referrer cash for local-side referrals (heavier reward; supply is harder than demand)

### The referral email template (meetlocal version)

**Subject:** `[First name] sent you $15 toward a Miami local`

**Body:**
```
Hi —

[First name] (a [Native/Rooted/Seasoned] local in Miami who's hosted N travelers)
just invited you to try meetlocal.

→ $15 off your first booking. Expires [date 14 days out].
→ Hand-vetted locals only. The first meet happens at a public,
  curated spot — every time.

[ ACCEPT INVITATION ]

[Referrer photo] [Referrer first name] · [N] travelers hosted ·
  [avg ★] · [city · neighborhood]
```

Includes all 5 of Alstromer's ingredients. **Button copy: "ACCEPT INVITATION" — never "Sign up."**

### Build timing

- **Stage 1 (Vetted Beta):** Manual referrals. Founder texts "send your friend this link, they get $15, you get $20."
- **Stage 2 (Limited Public):** Engineered referrals. Coded into product.
- **Stage 3 (Multi-city):** Optimize the funnel (the part Airbnb spent years on).

**This is the highest-ROI single feature to build at Stage 1 → 2.**

---

## 4. SEO AT SCALE (Phase 3 of growth, ~Stage 2-3)

> *"SEO is not a thing of the past, it still matters."*

### Alstromer's core principles

1. **Search-frequency matches channel.** *"If you search for something very rarely, once a year or more (e.g. buying a house) then you probably use Google for it."* — Travel falls here. Most users plan trips a few times a year. **Google is the channel.**
2. **Crawler-friendly content.** *"Google doesn't see what a customer sees. Run your website on a SEO browser."* — Critical for an SPA-style site. We're already SSR via Next.js (good), but image alt text + structured data still need work.
3. **Keyword research first.** *"Figure out which keywords you want to be number one for, and pick the right page to rank for them."*
4. **Backlinks matter, weighted by authority.** *"Press? Make sure (and ask) that they actually link to you."*

### Page-level SEO strategy for meetlocal

This is exactly how Airbnb scaled SEO — the **template-page-at-scale** model:

| Template | URL pattern | Target keyword | Volume |
|---|---|---|---|
| **City landing** | `/cities/miami` | "things to do in Miami with a local" | High |
| **City + vibe** | `/cities/miami/food` | "local food guide Miami" | High |
| **Local profile** | `/local/[id]` | "[local name] · Miami food guide" | Low/Each |
| **Hidden-spot guide** *(future)* | `/guides/miami/wynwood` | "Wynwood hidden spots" | Med |
| **Founders guide** | `/founders` | "meet startup founders [city]" | Low/each |

**Stage 1 to-do:** Build static `/cities/[slug]` landing pages with:
- H1: "Meet a local in [City]"
- Subhead with city-specific copy
- 5-10 sample locals from that city
- 3-5 sample meeting spots
- Internal links to /how-it-works + /safety
- Open Graph + Twitter card metadata
- Schema.org JSON-LD for `LocalBusiness` + `Person`

**Stage 2-3 to-do:** Build `/cities/[slug]/[vibe]` template pages (Miami × Food = 1 page, Miami × Music = another).
- 4 cities × 8 vibes = 32 long-tail pages, each targeting a specific keyword cluster.
- Add `Last updated` dates (Google likes freshness)
- Add 3-5 local profile cards per page (compels indexing of local profiles too)

### Off-page SEO — what we should do now

Per Alstromer: *"Other websites linking to your website (it matters how much authoritative these other websites are)."*

| Tactic | Stage | How |
|---|---|---|
| **Press mentions** | 1 | When founder lands a podcast / article, **request a link** in show notes / article body. |
| **Curated travel blog guest posts** | 2 | Write 1 guest post per launch city for established travel blogs (Lonely Planet contributor network, The Points Guy guests, etc.) |
| **Founder-on-podcast tour** | 1-2 | 3 mid-tier podcasts in months 1-6. Each links back. |
| **Quora / Reddit organic** | 2 | Answer city-specific solo-travel questions. Don't spam. Become a known voice. |
| **HARO (help-a-reporter-out)** | 2 | Sign up. Pitch quotes for trust/safety/marketplace stories. |

### The SEO experiment discipline

> *"Change the content just for some pages but not others, and see if the amount of organic traffic increases."*

When at Stage 3+, run page-level A/B tests:
- Test `<title>` tag formats across pages
- Test H1 phrasing
- Test internal linking patterns
- Hold half the pages constant, change the other half, measure ranking + traffic over 4 weeks

---

## 5. PAID ACQUISITION (Phase 4, ~Stage 3+)

> *"Do my users have high LTV? Do I charge enough to cover the costs of paid acquisition?"*

### The meetlocal LTV / CAC math

```
Avg booking value:                      $50
Platform take (22%):                    $11
Avg bookings per traveler year 1:       1.5
Avg bookings per traveler year 2-3:     1.0 each
LTV (3-year horizon):                   ~$38

Sustainable CAC ceiling (LTV/3):        ~$12
Google CPC for "Miami tour":            ~$3-8
Conversion rate (search to booking):    ~2-5% typical for marketplaces
Implied CAC at 3% conversion:           $100-300

Conclusion: PAID WON'T WORK at current LTV.
```

### What changes the math

- **Higher conversion** (better landing pages, more proof) → Stage 2 funnel work helps
- **Higher repeat rate** (better retention) → Stage 1-2 retention work helps
- **Higher booking value** (Tier 2 call + Tier 3 meet bundled) → Stage 2 pricing changes help
- **Multi-tier ARPU** (Tier 1 + Tier 2 + Tier 3 = $70 vs $50) → Stage 2 launches Tier 1

**Until Stage 3, paid acquisition burns money.** Re-check the math at every stage gate.

### When paid does become viable

- Stage 3 retention numbers in place
- Repeat-booking rate ≥35%
- Multi-tier ARPU ≥$70
- Then start with Google search ads on high-intent keywords ("Miami solo travel guide local") — NOT broad-match.
- Facebook lookalike audiences only AFTER you have 10K+ Stage 2 users to seed.

---

## 6. BRAND MARKETING (Phase 5, ~Stage 3-4)

> *"Brand marketing is the hardest to measure type of marketing because you don't have a direct response and feedback. Not to be done initially, but only when you've reached the limits of the first 2 things."*

This is Alstromer + Chesky aligned. Last.

When it's time (Stage 3+):
- Founder podcast tour (already planned in STRATEGY_NOTES.md)
- Travel + Leisure / Conde Nast / Eater earned media
- Out-of-home in beachhead city (subway / billboard) **only after $1M ARR**
- Brand films / docuseries about real meetlocal moments

---

## 7. The growth team — and why it's just you for a while

Alstromer's framework: growth teams have **engineers, designers, data scientists, PMs, user researchers**. Airbnb grew theirs from 3 → 120.

**At meetlocal Stage 0-2:** Growth team = founder. Don't hire a "growth lead" until you have a working growth motion to scale. Hiring is the trap — you can't manage what you haven't built yourself.

**At Stage 3:** First growth hire is an SEO engineer (template page generation, schema markup, internal linking).

**At Stage 4:** Add a data scientist (retention curves, cohort analysis, attribution).

---

## 8. The Alstromer × Chesky × BUS 81 unified hierarchy

Combining all three doctrines into a single sequenced playbook:

| Phase | Source | Action |
|---|---|---|
| **Now (Stage 0)** | BUS 81 + Chesky | 15 customer discovery interviews · 30 hand-touched bookings · Founding 50 program |
| **Soon (Stage 1)** | Alstromer + Chesky | Define core retention metric · Sean Ellis "very disappointed" % · manual referrals |
| **Stage 1 → 2** | Alstromer | Funnel instrumentation (every step measured) · engineered referral product · `/cities/[slug]` SEO pages |
| **Stage 2 → 3** | Alstromer + Chesky | Funnel A/B tests · SEO at scale · founder podcast tour · referral funnel optimization |
| **Stage 3 → 4** | Alstromer | Paid acquisition if LTV/CAC math works · brand marketing investment · growth team hires |

---

## 9. What to build in the product, in order

Concrete features sequenced for growth:

### Immediate (Stage 0 → 1)

1. **Manual referral mechanic.** No code. Founder texts referrer "send your friend this link, they get $15 off, you get $20 credit."
2. **"How would you feel?"** survey — embed in post-booking flow + customer discovery interviews
3. **City landing pages** — `/cities/miami`, `/cities/tampa`, etc. SSR'd Next.js pages with local examples + safety story

### Stage 1 → 2

4. **Engineered referral product** — `/refer` page · email templates with Alstromer's 5 ingredients · credit ledger in DB
5. **Funnel analytics** — Plausible or PostHog (privacy-respecting) · event tracking on every funnel step
6. **`/cities/[slug]/[vibe]` template pages** — 4 cities × 8 vibes = 32 long-tail SEO pages

### Stage 2 → 3

7. **A/B testing infrastructure** — only when MAU > 2K
8. **Funnel optimization sprints** — Alstromer-style 14% / 40% wins
9. **Referral funnel optimization** — what Airbnb spent years on

### Stage 3+

10. **Paid acquisition infrastructure** — only if LTV math allows
11. **Brand marketing budget** — once organic is maxed

---

## 10. Three numbers we don't have but need

To run Alstromer's playbook properly, instrument these from day 1:

| Metric | Why | How to get it |
|---|---|---|
| **Funnel conversion at every step** | Funnel optimization Phase 1 requires it | Plausible / PostHog events on each page + action |
| **"How would you feel?" % "Very disappointed"** | Sean Ellis PMF score | Survey in post-booking flow + customer interviews |
| **Annual repeat-booking rate** | Retention curve | Compute from `Booking` rows over time |

The first one needs a tiny analytics integration. The second needs ~5 lines of product copy. The third is just a SQL query against existing data. **All three are buildable in Stage 0.**

---

## 11. The single sentence (Alstromer's distilled)

> *"Working on growth too early can be really bad. You must find product market fit first, or you can grow like crazy and then fall down."*

For meetlocal: **don't ship a referral program before retention is real. Don't run ads before referrals work. Don't do brand before SEO compounds.**
