# Launch Stages — meetlocal.ai

> Companion to STRATEGY_NOTES.md. Where STRATEGY_NOTES is *frameworks*, this
> doc is the *staging discipline*: when each feature unlocks, gated by
> traveler counts and trust/safety metrics — never by calendar dates.

**Founding principle:** *Build for stage N+1, never stage N+3. The
5K-user features built at 50 users die.*

---

## 0. The strategic frame

Three rules govern every decision in this doc:

| Rule | Why |
|---|---|
| **Safety + trust first, monetization second** | Trust marketplaces die on incidents, not slow growth. One bad story sets you back 6 months. |
| **Manual before algorithmic** | Founder-hand-curated for first 100. Algorithms encode what *we know*; we don't know yet. |
| **Stages gated by signal, not dates** | "By Q2" is a wish. "After 50 completed bookings with 4.5★ avg" is a gate. |

If a feature you're about to build serves a stage you haven't reached
yet, **don't build it.** Write it down in this doc and revisit at the gate.

---

## 1. The five stages

```
STAGE 0 — Pre-launch (where we are now)
   ├─ 0 → 30 hand-touched bookings
   ├─ Founder runs everything manually
   └─ Goal: kill demand risk + supply quality risk

STAGE 1 — Vetted Beta (next)
   ├─ 30 → 200 bookings (invite-only)
   ├─ Miami only, vetted users only
   └─ Goal: prove 4.5★+ at 200 bookings, zero safety incidents

STAGE 2 — Limited Public
   ├─ 200 → 2,000 bookings
   ├─ Miami public, plus Tampa beta
   ├─ Basic AI matching, trust scoring v1, text-chat tier unlocks
   └─ Goal: NPS > 50, founder still in every safety report

STAGE 3 — Multi-City
   ├─ 2K → 20K bookings
   ├─ All 4 launch cities + 2 new
   ├─ Voice/video call tier, trust scoring v2, AI moderation
   └─ Goal: <1% safety-incident rate, organic CAC payback < 90 days

STAGE 4 — Scale
   ├─ 20K+ bookings
   ├─ 10+ cities, premium experiences, full AI suite, API for partners
   └─ Founder mode still in place — Chesky reads every safety email
```

Each gate is a **decision moment**: keep going, hold here, or pivot.
Skipping a gate is how trust marketplaces die.

---

## 2. The tiered pricing strategy (text · call · meet)

Your insight: separate stages of interaction unlock at different price points.
This isn't just monetization — **it's a built-in trust ladder.**

### The three product tiers

| Tier | What | Price (suggested) | Unlocks when |
|---|---|---|---|
| **🔵 Tier 1 — Text Chat** | Async DM with a local. "Help me plan my Miami day." 24-hr response window. | **$5 flat** for a 3-day chat window | Both users have signed up. Lowest barrier. |
| **🟠 Tier 2 — Voice / Video Call** | Live 20-min call before commitment. Pre-trip orientation. | **$15** for 20 min | Both users have completed ID + selfie verification |
| **🔴 Tier 3 — In-Person Meet** | Today's v1: 1–4 hrs, vetted public spot | Hourly rate (current model: 78% local / 22% platform) | Local has been hand-vetted by founder. Optional: traveler has completed Tier 1 or 2 first. |

### Why the tiered model works (4 reasons)

1. **Lowers acquisition friction.** Travelers who'd never pay $50/hr to meet a stranger will pay $5 to *chat* with one. Foot-in-the-door.

2. **Builds trust gradually.** Tier 1 → Tier 2 → Tier 3 is a natural courtship. Both parties self-select up.

3. **Creates a price ladder.** Locals earn from low-effort text chats *and* high-margin in-person meets. Better unit economics across supply.

4. **Safety-aware progression.** ID is required *before* voice/video. Hand-vetting required *before* in-person. The system enforces the trust ladder.

### Unit economics by tier

```
Tier 1 — Text:        $5    × 78% local payout = $3.90 to local
                                   22% platform = $1.10 to us
Tier 2 — Call (20m):  $15   × 78% = $11.70 local
                                  22% =  $3.30 platform
Tier 3 — Meet (1hr):  $50+  × 78% = $39+    local
                                  22% = $11+    platform
```

A heavy traveler might do all three: $70 ARPU instead of $50 today.
A casual traveler might only ever buy text: $5 in revenue you wouldn't have captured.

### Pricing safety locks

- Tier 1 → Tier 2 upgrade requires Tier 1 to have *completed* with no flags
- Tier 2 → Tier 3 requires either prior Tier 1 *or* Trust Score above threshold
- All tiers auto-decline if AI moderation flags off-platform handoff attempts

**Implication for build order:** none of this exists yet. Today only Tier 3
is built. Tier 1 (text chat) needs a paywall + 3-day expiry mechanism.
Tier 2 (call) needs Twilio/Daily integration. These are Stage 2 features,
not Stage 0.

---

## 3. AI feature roadmap — what becomes algorithmic, and when

Your ideas — matching, trust scoring, moderation, dynamic pricing — are
*all* the right ideas. They just unlock at different stages.

### Matching algorithm

| Stage | Method | Inputs |
|---|---|---|
| 0 | **Founder picks** | Vibe instinct |
| 1 | **Founder picks + hand-tagged compatibility notes** | Founder annotations on each local |
| 2 | **Rule-based + cosine similarity** | Tags overlap + language overlap + age bracket + city |
| 3 | **ML embedding model** | Above + completion rate + review patterns + personality quiz |
| 4 | **ML + reinforcement learning** | All above + RL on past successful matches |

#### The matching attributes — all of yours, framed responsibly

| Attribute | When usable | How |
|---|---|---|
| Interests / vibes | Stage 1+ | Tags (already in schema) |
| City / neighborhood | Stage 0+ | Built |
| Language | Stage 1+ | `languages[]` array (already in schema) |
| Age bracket | Stage 2+ | Brackets (25–35, 35–45) — NEVER exact age comparison |
| Personality | Stage 3+ | Optional 5-question quiz; Big-5-lite |
| Vibe / energy compatibility | Stage 2+ | Profile bio NLP match + tag overlap |
| **Gender preference** | Stage 1+ (opt-in) | Traveler can request "women-only locals" or "men-only" for safety. Locals can opt in to women-only roster (some women-host networks do this). |
| **Religion** | Stage 3+ (opt-in, soft) | NEVER as a hard filter — discrimination risk. Frame as a "common ground" boost, not a gate. Default off. |

**Responsibility constraints:**

- **Religion, gender, age** can ONLY ever be used as *user-set preferences*, never platform-imposed filters
- Always disclose in profile what attributes the algorithm uses
- Never publish a list saying "these locals matched because they share X"
- Comply with **FCRA + Title VII analogs** — if you don't, a single class action can end the company

### Trust scoring (composite 0–100)

| Input | Weight | When measurable |
|---|---|---|
| ID + selfie verified | 25 | Stage 1+ |
| Background check passed (optional) | 15 | Stage 2+ |
| Bookings completed | up to 20 | Stage 1+ |
| Avg review rating | up to 20 | Stage 1+ |
| Response time (chat / accept) | up to 10 | Stage 2+ |
| Cancellation / no-show rate (inverse) | up to 10 | Stage 2+ |

**Stage 1 launches with simple composite:** verification flags + completed
count. Stages 2+ add the behavioral signals.

**Trust score visibility:**
- Traveler always sees local's trust score
- Local sees their own + a delta vs last week
- Score 80+ = "Top Local" badge (Founding 50 path)
- Score < 50 = surface-suppressed, founder review triggered

### AI moderation

| Stage | What it catches |
|---|---|
| 1 | Off-platform handoff attempts (phone numbers, WhatsApp handles) → flagged for founder |
| 2 | Spam / scam patterns → auto-hide + founder review |
| 3 | Harassment / grooming patterns → instant suspend + safety team notify |
| 4 | Multi-language abuse detection, content of voice transcripts |

Build order: rule-based regex first (Stage 1), then OpenAI moderation API
or open-source model (Stage 2+).

### Dynamic pricing

Defer to Stage 3+. Reason: at <500 bookings, you don't have enough data
to make pricing recommendations that beat the local's own taste.

When ready:
- AI **suggests** rate based on demand + time + day + local's tier
- Local **always** overrides — never auto-priced
- "Surge" only at city-event level (Art Basel week, Super Bowl), never per-user

---

## 4. Safety-first principles (never change across stages)

These are *non-negotiable* at every stage. The features that enforce them
change; the principles don't.

| Principle | Stage 0 enforcement | Stage 4 enforcement |
|---|---|---|
| **Vetted locals only** | Founder hand-reviews each | Persona/Checkr + founder spot-check |
| **First meet at public spot** | Starbucks Rule in booking UI | Same + AI flags any "let's meet at my place" message |
| **Pay only when accepted** | Stripe manual capture | Same |
| **Two-way reviews** | Built | Built |
| **Off-platform handoff flagged** | Manual founder review | AI moderation auto-flag |
| **Founder reads every safety email** | Yes | Still yes (Chesky rule) |
| **Trust score visible to both sides** | Manual notes | Composite algorithm |

If a new feature ever weakens one of these principles, it doesn't ship.

---

## 5. The five stages in detail

### Stage 0 — Pre-launch (where we are today)

**Population:** 0 paying travelers, ~10 seeded locals
**Goal:** Kill demand risk + supply quality risk. Founder learns what
"a great match" actually feels like.

**What's true:**
- ✅ Product built (v1.5)
- ✅ Brand + safety + legal + ops scaffolding done
- ✅ Stripe + idempotency + reviews work
- ❌ No real strangers have completed a booking
- ❌ No customer discovery interviews done

**Operating mode:**
- Founder-led, manual, no algorithm
- **15 customer discovery interviews** (this week, per BUS 81 + Chesky's "talk to users")
- **Collison installation** for every interested DM (per PG)
- **Founding 50 locals program** kick-off in Miami
- Pricing: in-person meet only, current model

**Gate to Stage 1:** *30 hand-touched bookings completed at 4.5★+ avg
across both sides. At least 10 of those from cold-outreach strangers,
not friends.*

---

### Stage 1 — Vetted Beta

**Population:** 30 → 200 bookings, invite-only
**Cities:** Miami only
**Goal:** Prove safety holds at small scale. Build the operations muscle.

**What unlocks:**
- 🔵 **Tier 1: Text-chat product** ($5 flat, 3-day window)
- Trust score v1 (verification + completed count)
- **Report-a-user button** in chat
- "Founding 50" public page surfaces the founding locals
- Email-only acquisition (no paid ads)

**What stays manual:**
- Local approval (founder still hand-vets each)
- All safety incident review (founder)
- Matching (founder recommends + traveler chooses)

**Gate to Stage 2:**
- 200 completed bookings (across all tiers)
- 4.5★+ avg on both sides
- **Zero safety incidents** (any incident = stay in Stage 1, dig in)
- Founder has personally onboarded 100 travelers via Collison installation

---

### Stage 2 — Limited Public

**Population:** 200 → 2,000 bookings
**Cities:** Miami public, Tampa invite-only beta
**Goal:** Prove the loop works without founder in every match. Liquidity in 1 city.

**What unlocks:**
- 🟠 **Tier 2: Voice/video call** ($15 / 20 min) — Twilio or Daily integration
- **Background check vendor** (Persona / Checkr) — "Verified+" badge
- **AI matching v1** — rule-based + cosine similarity on vibes/languages
- **AI moderation v1** — chat scanning for off-platform handoffs
- **Optional location share** during in-person meets (Stage 1 promise, now buildable)
- Stripe Connect Express (auto-payouts, replaces founder manual)
- Public signup (no invite required, but ID verification still mandatory)

**What stays manual:**
- All Local approvals (founder + vendor)
- Founder reads every safety email
- New city expansion (Tampa, by hand)

**Gate to Stage 3:**
- 2,000 completed bookings
- NPS > 50 across travelers + locals
- <0.5% safety-incident rate
- Sustainable organic CAC (founder podcasts + brand + Instagram + community channel)
- Founding 50 program graduated to "ambassador" tier — they recruit Stage 2's next 50 locals

---

### Stage 3 — Multi-City

**Population:** 2K → 20K bookings
**Cities:** All 4 launch cities + 2 new (likely Austin or NYC)
**Goal:** Validate the model in geographies the founder didn't curate.

**What unlocks:**
- 🔴 Tier 3 (in-person) becomes the *minority* of revenue (text + call grow)
- **Dynamic pricing suggestions** (AI suggests, local sets)
- **ML matching** — embedding model trained on Stage 1+2 successful matches
- **AI moderation v2** — harassment / grooming pattern detection
- **Trust score v2** — full composite with behavioral signals
- **Premium tiers**: "Top Local" with reduced commission (15% vs 22%)
- Multi-day packages (1-on-1 weekends with a local — high-margin, low-volume)
- **Trip-tracker** — opt-in real-time location share with 3 emergency contacts
- Press tour: founder on 5+ podcasts, 2 magazine features

**What stays manual:**
- Safety incident response (founder still personally in every one)
- New-city launches (founder visits each city for first 2 weeks)

**Gate to Stage 4:**
- 20K bookings
- <0.1% safety-incident rate (one in 1,000)
- 2nd / 3rd city show same retention as Miami
- First non-founder employee (maybe ops/support lead)

---

### Stage 4 — Scale

**Population:** 20K+ bookings
**Cities:** 10+
**Goal:** Brand becomes the moat. Founder mode persists.

**What unlocks:**
- All AI features mature
- **API for partners** (hotels, airlines, travel apps) — pre-trip "match me to a local on arrival"
- **Premium experiences** — curated multi-day adventures, group meets, cultural deep-dives
- **Locals-as-creators**: short-form video from active locals featured in app + Instagram
- **SOS button + 24/7 safety dispatcher** (vendor-backed, formerly aspirational)
- International expansion (1–2 cities outside the US)

**What never changes:**
- Founder reads every safety email
- Locals are hand-spot-checked even with vendor BG checks
- Brand voice / craft / taste reviewed by founder

---

## 6. The decision gates between stages

| Gate | Pass criteria | If you fail |
|---|---|---|
| **0 → 1** | 30 hand-touched bookings at 4.5★+ | Stay at Stage 0. Re-run customer discovery. The pain might not be what you thought. |
| **1 → 2** | 200 bookings, zero safety incidents | Stay invite-only. Tighten supply. |
| **2 → 3** | 2K bookings, NPS > 50, <0.5% safety incidents | Don't expand cities. Fix retention in Miami. |
| **3 → 4** | 20K bookings, 2 cities replicate Miami's metrics | Slow growth. Re-verify supply quality. |

These are **hard gates.** Sneaking past one means a future incident no
amount of growth can outrun.

---

## 7. The "verified user only" launch model — concretely

Per your idea, here's the implementation across stages:

### Stage 0 — Friends + family pilot
- Acquisition: Founder DMs
- Vetting: Founder vouches for both sides
- Pricing: Free (founder comps first bookings)

### Stage 1 — Invite-only verified beta
- Acquisition: Waitlist + invite codes
- Vetting: ID + selfie (mandatory both sides) + founder review for locals
- Pricing: Tier 3 only ($X/hr, current 78/22 split)

### Stage 2 — Verified-by-default public
- Acquisition: Public signup; ID verification REQUIRED before any booking
- Vetting: Locals still hand-vetted by founder; travelers auto-verified via Persona
- Pricing: Tier 1 + Tier 3 unlocked
- New badge: "Verified+" (background check passed)

### Stage 3 — Tiered visibility
- **Unverified users** can browse but not book
- **Verified users** can book Tier 1 + Tier 2
- **Verified+ users** can book Tier 3 (in-person)
- Trust score determines local surfacing in search

This staging gives the user a *progression* through verification levels
— each step rewards with more access. Strong retention mechanic.

---

## 8. Founder questions to answer at each gate

**Before 0 → 1:**
- What's my pain-density memo telling me from the interviews?
- Are the 5 hand-recruited Miami locals the right people?
- Did 30 strangers actually complete bookings?

**Before 1 → 2:**
- Did 90%+ of bookings hit 4.5★+?
- Did any safety incident occur? (If yes, hold.)
- Has the founder personally onboarded 100 travelers?

**Before 2 → 3:**
- Is the AI matching better than founder-curation? (If no, stay manual.)
- Is the trust score actually predicting good matches?
- Has the founder physically visited each launch city in the last quarter?

**Before 3 → 4:**
- Have we successfully expanded to a 2nd city?
- Is the safety incident rate <0.1%?
- Is the founder still personally responding to every safety email?

---

## 9. What goes into LAUNCH_CHECKLIST as a result

This file pairs with the existing [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).
Each stage's "what unlocks" becomes a phase in that checklist.

**Phase 1.5 — Customer validation (add now)**
- [ ] 15 customer discovery interviews completed
- [ ] Pain-density memo drafted
- [ ] Painkiller persona narrowed to one wedge
- [ ] 30 hand-touched bookings completed in Miami
- [ ] Founding 50 program launched (5 locals onboarded)
- [ ] Gate to Stage 1 ✓

**Phase 8 — Stage 1 features (build at Stage 0→1 gate)**
- [ ] Tier 1: text-chat product ($5 flat, 3-day window)
- [ ] Trust score v1 (verification + completed count)
- [ ] Report-a-user button in chat
- [ ] /founding-50 public page

**Phase 9 — Stage 2 features (build at Stage 1→2 gate)**
- [ ] Tier 2: voice/video call ($15 / 20 min)
- [ ] Background check vendor integration (Persona / Checkr)
- [ ] AI matching v1 (rule-based)
- [ ] AI moderation v1 (chat scanning)
- [ ] Stripe Connect Express (auto-payouts)

**Phase 10 — Stage 3 features (build at Stage 2→3 gate)**
- [ ] Dynamic pricing suggestions
- [ ] ML matching (embedding model)
- [ ] AI moderation v2 (pattern detection)
- [ ] Premium tier (Top Local, reduced commission)
- [ ] Trip-tracker (opt-in location share)

**Phase 11 — Stage 4 (build at Stage 3→4 gate)**
- [ ] Partner API
- [ ] Premium experiences (multi-day, group)
- [ ] SOS button + 24/7 dispatcher

This is intentionally a **build-the-right-thing-at-the-right-time roadmap**, not a one-shot v1 plan.

---

## 10. Single sentence to internalize

> *"Build for stage N+1, never N+3. The Stage 4 features built at Stage 0 die — and so do the companies that build them."*
