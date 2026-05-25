# Lawyer review brief — meetlocal.ai

> Email this whole document (or a PDF of it) to the attorney you engage,
> alongside the four draft documents listed in §3. The goal is to make
> the lawyer's review **specific and time-boxed** so the engagement
> stays under ~$1,000 instead of the typical $3–5k full-platform legal
> intake.

---

## 1. The ask in one paragraph

We are launching a two-sided marketplace (meetlocal.ai) in the San
Francisco Bay Area that connects solo travelers with vetted local
residents for paid 1–4 hour in-person meetups. Travelers pay through
our platform (Stripe Checkout); locals receive 78%–90% of each booking.
Our drafts of Terms of Service, an Independent Contractor Agreement,
and an Acceptable Use Policy are linked below. **We need a marketplace
/ employment specialist to review them and flag (a) anything that
exposes us to worker-misclassification or tour-guide-licensing claims,
and (b) anything that doesn't meet enforceability standards for
electronic acceptance in California.**

---

## 2. Who we are

- **Legal entity:** Forming a Delaware C-Corporation in the next 30
  days (likely via Stripe Atlas). Currently operating as a sole
  proprietorship under the founder.
- **Primary state of operations:** California (San Francisco Bay Area
  launch). Expanding to Miami, then NYC over 6–12 months.
- **Headcount:** 1 founder (no employees, no other contractors yet).
- **Funding stage:** Pre-seed; one angel committed at $50k.
- **Insurance:** None yet — we want your recommendation.

---

## 3. Documents in scope (linked in this repo)

| Document | File | Status |
|---|---|---|
| Terms of Service | `legal/TERMS_OF_SERVICE.md` | Draft, ~280 lines |
| Independent Contractor Agreement | `legal/INDEPENDENT_CONTRACTOR_AGREEMENT.md` | Draft, ~249 lines |
| Acceptable Use Policy | `legal/ACCEPTABLE_USE_POLICY.md` | Draft, ~102 lines |
| Privacy Policy | `legal/PRIVACY_POLICY.md` | Draft, ~185 lines (lower priority for this engagement) |
| Refund & Cancellation Policy | `legal/REFUND_AND_CANCELLATION.md` | Draft, ~143 lines |

All five docs use `[BRACKET]` placeholders for values that must be
filled (entity name, addresses, contact emails, governing-law state).
Please flag any other brackets you'd recommend adding.

---

## 4. The four risks we most need you to address

### 4.1 California AB5 / *Dynamex* worker-classification exposure

**Why it matters:** California's *Dynamex* ruling and AB5 codify the
"ABC test" for distinguishing employees from independent contractors.
Marketplace platforms (Uber, Lyft, Instacart) have been sued repeatedly
under it. We classify locals as ICs in §1.1 of the IC Agreement but
have not had a CA employment lawyer pressure-test the language.

**What we'd like you to do:**
1. Read §1.1, §1.2, §1.3, §2.3, §3.1, §3.4 of the IC Agreement.
2. Flag every clause that could be evidence under prongs A, B, or C
   of the ABC test (right to control / outside usual course / customary
   independent business).
3. Rewrite or recommend rewrites that strengthen our position under
   each prong without losing operational clarity. Be specific about
   what language to add (e.g., "Contractor warrants that Contractor
   operates an independently established business under a separate
   business name and/or EIN…").
4. Tell us if you think Prop 22-style structuring (treating us as a
   marketplace facilitator rather than a service-provider platform) is
   the right framing or overkill at our stage.

### 4.2 Tour-guide / commercial-guide licensing exposure

**Why it matters:** Several U.S. cities (New Orleans, Charleston SC,
Savannah GA, Washington D.C., New York City, certain National Park
Service sites) license commercial tour guides. We don't believe our
locals qualify as commercial tour guides — they're closer to "friends
showing you around" — but we want this thoroughly disclaimed and
operationally distinct from a regulated tour-guide service.

**What we'd like you to do:**
1. Read §14.1 of the Terms of Service (the disclaimer we drafted).
2. Confirm whether the language is sufficient under the laws of our
   launch cities (San Francisco / Bay Area initially) and our planned
   next cities (Miami, then NYC).
3. Flag any restricted activities/zones (e.g., National Park Service
   guided tours) that our Acceptable Use Policy should also explicitly
   prohibit.
4. Recommend any specific copy edits to make the "we are not a tour
   service" position more defensible.

### 4.3 Marketplace platform-liability carve-outs

**Why it matters:** We operate the platform but are not a party to the
meeting itself. Our limitation-of-liability and disclaimer clauses (TOS
§14, §15) cap damages at $100. We want to know whether that's defensible
and whether we should add specific safe-harbors (e.g., §230 CDA framing
for user-generated content, Communications Decency Act protections for
reviews, etc.).

**What we'd like you to do:**
1. Read TOS §14 (Disclaimers, including the new §14.1 and §14.2),
   §15 (Limitation of Liability), §16 (Indemnification).
2. Confirm whether the AAA arbitration + class action waiver in §18 are
   enforceable in California (recent CA case law has limited arbitration
   waivers for consumer claims).
3. Flag the $100 cap. Is that too low to enforce? Should it be a
   tiered cap (e.g., $100 or 12 months of fees, whichever is greater)?
4. Recommend explicit §230 CDA framing for user-generated reviews.

### 4.4 Electronic acceptance / "clickwrap" enforceability

**Why it matters:** Users accept our TOS by clicking "Continue" at
sign-up. Locals accept the IC Agreement by checking a box during the
apply flow. We want to know whether these meet CA "browsewrap" /
"clickwrap" enforceability standards under *Nguyen v. Barnes & Noble*
and related CA case law.

**What we'd like you to do:**
1. Recommend the specific text of the acceptance prompt.
2. Confirm whether our current flow (clicking a button that's adjacent
   to a hyperlinked "I agree to the Terms") is sufficient or needs an
   explicit checkbox.
3. Flag any logging/recordkeeping requirements (e.g., we currently
   log `agreedIC=1` on application submission; is that enough?).

---

## 5. Operational questions we'd like answered

(One-line answers fine for these — they help us know what to build, not
what to write.)

- **Liability insurance:** What carrier do you recommend for a
  marketplace platform at our stage? Coverage limit? Cost ballpark.
- **Sales tax:** Does CA consider our 22% platform fee taxable as a
  marketplace facilitator? Should we register?
- **Trademark:** Should we file "meetlocal" or "meetlocal.ai" or both?
  Word mark vs. design mark.
- **CCPA:** What specific changes does our footer/Privacy Policy need
  for CCPA compliance with our launch in California?
- **ADA:** Do we need WCAG 2.1 AA compliance now, or once we hit a
  user/revenue threshold? What's the practical floor?

---

## 6. Out of scope (do not bill for these — we'll handle separately)

- General incorporation work (we're using Stripe Atlas / Clerky)
- IP filings (we'll engage a separate IP firm if needed)
- Investment documents (SAFE/equity rounds with our $50k angel)
- Day-to-day employment matters (we have no employees)
- Tax filings or accounting (handled by a separate CPA)

---

## 7. Suggested engagement

- **Total time:** ~6–8 hours, fixed-fee preferred (~$1,200–$1,800
  total). If you only bill hourly, please cap at 8 hours and tell us
  before going over.
- **Format:** Mark up the markdown files directly (we work in plain
  text and version-control everything), or send a memo summarizing
  required changes section-by-section.
- **Turnaround:** 7–10 business days from receipt of this brief.

---

## 8. About this brief

This brief was prepared by the founder in collaboration with a
software-engineering AI assistant (Claude) to scope the legal review
narrowly. It is not legal advice; it's a request for legal advice. We
attached the AI's analysis to give you context, not to substitute for
your judgment.

**Contact:** [FOUNDER NAME] · [EMAIL] · [PHONE]

---

## Appendix: where we are right now (technical)

For your context, here's what we've shipped:

- Production site: **https://meetlocal-ai.vercel.app**
- Stack: Next.js 16 (App Router), Supabase Postgres (Prisma ORM),
  NextAuth v5 (Google OAuth), Stripe Checkout (manual capture), Resend
  for transactional email, Supabase Realtime for in-app chat
- Active locals on production: ~3 friends-of-founder seed accounts.
  Real applicants in pipeline.
- First 3 traveler users have completed bookings and given positive
  feedback.
- Founder is based in San Francisco; first paid meetups will happen in
  the Bay Area within the next 4 weeks.

This isn't a hypothetical platform; this is live, with paying users,
operating under unreviewed legal language. The sooner the review lands,
the better.
