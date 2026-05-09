# Legal — starter kit & playbook

> ⚠️ **NOT LEGAL ADVICE.** These are educational *first drafts* tailored to
> meetlocal.ai's marketplace structure (vetted locals as independent
> contractors, manual Stripe capture, two-way reviews, 4 US launch cities).
> They are designed to **shorten lawyer review**, not replace it. Do NOT
> publish these without a real attorney's sign-off. The cost of a privacy
> violation under GDPR is €20M or 4% of global revenue, whichever is higher
> — pay the $2-5K for a real review.

---

## What's in here

| File | Purpose | Status |
|---|---|---|
| [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) | Master agreement with all users (travelers + locals) | First draft |
| [PRIVACY_POLICY.md](PRIVACY_POLICY.md) | Data collection, use, sharing, user rights (GDPR/CCPA) | First draft |
| [REFUND_AND_CANCELLATION.md](REFUND_AND_CANCELLATION.md) | When and how refunds happen | First draft |
| [INDEPENDENT_CONTRACTOR_AGREEMENT.md](INDEPENDENT_CONTRACTOR_AGREEMENT.md) | Protects worker-classification status of locals | First draft |
| [ACCEPTABLE_USE_POLICY.md](ACCEPTABLE_USE_POLICY.md) | What's banned on the platform | First draft |
| [COOKIE_POLICY.md](COOKIE_POLICY.md) | EU/UK cookie compliance | First draft |

Search across all files for `[BRACKETED PLACEHOLDERS]` — those are the
fields you need to fill in (legal entity name, state, registered agent,
contact email, etc.).

---

## The launch-blocker shortlist (do these in this order)

### Week 1 — entity formation + trademark
1. **Form Delaware C-Corp** via Stripe Atlas ($500) → `https://stripe.com/atlas`
   - Get EIN
   - Open business bank account (Mercury/Brex)
   - Stripe Atlas issues you formation docs (certificate of incorporation, bylaws, board consent, founder stock purchase agreement w/ vesting)
2. **Foreign qualification** in your operating state (CA, FL — wherever you're physically located) — $100-500
3. **Trademark filing** — file `meetlocal.ai` in 3 USPTO classes (39, 41, 42) at `https://teas.uspto.gov` — $750 total
4. **Domain protection** — buy `.com`, `.co`, `.io`, common typos
5. **EIN filing** automatic via Atlas

### Week 2 — find a startup lawyer
Pre-screen 3 firms. Look for **flat-fee packages** for early-stage startups:

| Firm | Notes | Cost range |
|---|---|---|
| **Atrium** *(now Carta)* | Bundle for tech startups | $1.5-3K/mo |
| **Stripe Atlas legal partners** | Pre-vetted by Stripe Atlas | $1-3K project |
| **Cooley GO** | Free templates from a top startup firm | Templates free |
| **Wilson Sonsini, Latham, Cooley** | Top-tier startup firms (overkill for $50K MRR but worth knowing) | $400-700/hr |
| **Local solo practitioners** | Often best value for early-stage | $250-400/hr |
| **Termly / Iubenda** | DIY legal docs (NOT a substitute for lawyer review) | $10-40/mo |

**Questions to ask each firm before engaging:**
- "Do you offer a flat-fee package for pre-seed marketplaces?"
- "Have you advised on worker classification for IC marketplaces?"
- "Do you have specific GDPR + CCPA experience?"
- "What's your turnaround on document review (3 days vs 3 weeks)?"
- "Do you charge for emails/calls under 15 min?"

### Week 3 — required policies live
With lawyer support, finalize and publish:
1. **Terms of Service** — based on `TERMS_OF_SERVICE.md`
2. **Privacy Policy** — based on `PRIVACY_POLICY.md` (with vendor list filled in)
3. **Refund Policy** — based on `REFUND_AND_CANCELLATION.md`
4. **Cookie Policy + banner** — based on `COOKIE_POLICY.md`
5. **IC Agreement** — locals click-accept this on apply (we'll wire it into the apply form)

Add accept-checkbox at signup + apply: *"I have read and agree to [Terms](/terms), [Privacy](/privacy), and [IC Agreement](/ic-agreement)."*

### Week 4 — insurance + safety vendors
1. **General liability + E&O insurance**: Embroker, Vouch ($500-2K/yr)
2. **Cyber insurance**: same vendors ($1-3K/yr) — required if you store payment data even via Stripe
3. **Background check vendor**: Persona or Checkr ($25-60/check)
4. **Identity verification**: Persona (also handles ID + selfie matching)
5. **D&O insurance**: defer until raising

### Month 2 — pre-launch hardening
- Lawyer reviews all consumer-facing copy + signup flow
- Tax counsel review (sales tax in launch states + 1099-NEC plan)
- 1099-NEC issuance plan via Stripe Connect Express (or bookkeeper)

---

## What requires a REAL lawyer (don't skip)

| Task | Why a lawyer must do it |
|---|---|
| Final ToS, Privacy, Refund, IC Agreement | State-specific clauses (CA/FL/NY/EU) you can't draft from a template |
| Founder agreement / vesting | One-time spend, prevents 80% of co-founder disputes |
| Worker classification opinion letter | Critical defense if state regulator audits |
| Privacy practices audit | GDPR Art. 30 record of processing + DPIA |
| 409A valuation (for option grants) | IRS-required; must be from a qualified appraiser (Carta does this) |
| Trademark registration | Can DIY but lawyer-filed has higher allowance rate (~75% vs ~50%) |
| Investor docs (SAFE, term sheets) | Cooley GO has free templates but lawyer review is non-negotiable |

## What you can DIY (with the templates here)

- Mutual NDA for vendor/contractor calls
- IC agreement (use the template here, lawyer reviews once)
- Cookie banner (Termly, CookieYes — $0-20/mo)
- Internal policies (employee handbook, code of conduct)

---

## Compliance triggers (alphabetical — know what you triggered)

| Trigger | Compliance owed |
|---|---|
| **Any user from California** | CCPA/CPRA — privacy notice, deletion rights, data sale opt-out |
| **Any user from EU/UK** | GDPR — privacy notice, lawful basis, data subject rights, DPO if applicable |
| **Stripe payments processed** | PCI DSS Level 4 (Stripe handles most; you handle webhook + storage) |
| **Local earns >$600/year** | 1099-NEC issuance (Jan 31 next year) |
| **Stripe Connect Express** | They handle KYC + 1099-K; you reduce direct exposure |
| **Background checks** | FCRA — disclosure + adverse action notice required |
| **Any video/voice during meets** | Wiretap law — single-party vs all-party consent varies by state (CA = all-party) |
| **Storing IDs/selfies (KYC)** | Encryption at rest; signed URLs; data retention limit |
| **EU users + analytics cookies** | Cookie consent banner BEFORE setting non-essential cookies |
| **Marketing emails** | CAN-SPAM (US) — unsubscribe link, accurate "from", physical address |

---

## Cost estimate — total year-1 legal/compliance spend

| Item | Cost |
|---|---|
| Stripe Atlas (DE C-corp + EIN + bank) | $500 |
| Foreign qualification | $100-500 |
| Trademark filing (3 classes) | $750 |
| Lawyer fees (founder agreement + ToS/Privacy/Refund/IC review) | $3-5K |
| Insurance (gen liability + E&O + cyber) | $1.5-3K |
| Termly / cookie banner SaaS | $120-480 |
| Tax counsel (1099-NEC plan, sales tax) | $500-1.5K |
| **Total year 1** | **$6,500-12,000** |

That's the cost of doing this right. Skipping it costs you the company the
first time something goes sideways.

---

## Quick links (the ones you'll actually use)

| Resource | URL |
|---|---|
| Stripe Atlas | https://stripe.com/atlas |
| Cooley GO (free templates) | https://www.cooleygo.com |
| USPTO trademark search | https://tmsearch.uspto.gov/ |
| USPTO TEAS Plus filing | https://teas.uspto.gov/ |
| Termly (template + cookie banner) | https://termly.io/ |
| Persona (KYC + identity) | https://withpersona.com/ |
| Checkr (background checks) | https://checkr.com/ |
| Carta (cap table + 409A) | https://carta.com/ |
| Mercury (business banking) | https://mercury.com/ |
| Embroker (startup insurance) | https://www.embroker.com/ |
