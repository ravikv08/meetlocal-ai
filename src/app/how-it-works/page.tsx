import Link from "next/link";
import {
  MapPin,
  User,
  MessageCircle,
  ShieldCheck,
  Star,
  Check,
  Wallet,
  ArrowRight,
  IdCard,
  Coffee,
  Hourglass,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface HowItWorksProps {
  searchParams: Promise<{ side?: string }>;
}

// Every claim on this page must be defensibly true at v1. Anything still
// in the roadmap (background-check vendor, live trip tracking, Stripe
// Connect Express, tipping) is named in the "what's coming next" callout
// at the bottom — never asserted as a current feature.

const TRAVELER_STEPS = [
  {
    n: "01",
    t: "Tell us where you're landing",
    d: "Tap your city, your date, and the vibe — food, culture, music, hidden spots, day trips. Takes about 15 seconds. We'll surface vetted locals available for a 1:1 meet.",
    icon: MapPin,
  },
  {
    n: "02",
    t: "Pick a local from the grid",
    d: "Each profile shows hourly rate, languages, neighborhood, residency badge (Native, Rooted, Seasoned, Newcomer), and the local's bio. Every profile is hand-reviewed by the founder before it goes live.",
    icon: User,
  },
  {
    n: "03",
    t: "Send a request — you're not charged yet",
    d: "Pick a start time and how many hours (1–6). Your card is authorized but not charged. Your local has 30 minutes to accept. If they decline or don't respond, the hold is released and you can request another local.",
    icon: Hourglass,
  },
  {
    n: "04",
    t: "Meet at a public, vetted spot",
    d: "Every first meet happens at a curated café, park, or museum — we call it the Starbucks Rule. Use in-platform chat to coordinate. Anything feels off, one tap to report and the founder responds personally within hours.",
    icon: Coffee,
  },
  {
    n: "05",
    t: "Two-way reviews close it out",
    d: "After your meet, both sides leave a review independently. Neither sees the other's until both submit — no retaliation, no rating-hostage. Both reviews publish to the local's profile simultaneously.",
    icon: Star,
  },
];

const LOCAL_STEPS = [
  {
    n: "01",
    t: "Apply in 10 minutes",
    d: "Tell us who you are, where you're from, your hourly rate (min $15/hr), languages, and what you'd love to show travelers. Most applications take 8–10 minutes end-to-end.",
    icon: User,
  },
  {
    n: "02",
    t: "Submit ID + a live selfie",
    d: "Government-issued ID, a live selfie that must visually match the ID, and your date of birth (must be 18+). At least one verifiable social profile. The founder reviews every application personally — typically within 24 hours.",
    icon: IdCard,
  },
  {
    n: "03",
    t: "Pick your residency",
    d: 'Self-declare your tie to the city: Native (born here), Rooted (10+ years), Seasoned (3–10 years), or Newcomer (recent move). Travelers see this badge directly. Document-based "Native" verification ships in v2.',
    icon: MapPin,
  },
  {
    n: "04",
    t: "Get founder approval",
    d: "Every application gets a personal review — bio, photos, residency, social profiles. We hand-curate slowly because the marketplace lives or dies on supply quality. Vendor-based background checks (Persona / Checkr) are rolling out before public launch.",
    icon: ShieldCheck,
  },
  {
    n: "05",
    t: "Receive bookings, set your schedule",
    d: "Once active, you appear in city searches and receive requests. You decide which to accept. You keep 78% of every booking (we take 22% platform fee). For v1, payouts are processed manually by the founder; Stripe Connect Express ships before public launch for automated weekly payouts.",
    icon: Wallet,
  },
];

// Defensible at v1 only — no speculative ratings or unmeasured durations.
const STATS = [
  { k: "4", v: "launch cities" },
  { k: "1:1", v: "every meet" },
  { k: "30 min", v: "accept window" },
  { k: "Two-way", v: "reviews" },
];

export default async function HowItWorksPage({
  searchParams,
}: HowItWorksProps) {
  const sp = await searchParams;
  const side = sp.side === "local" ? "local" : "traveler";
  const steps = side === "traveler" ? TRAVELER_STEPS : LOCAL_STEPS;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -10%, rgba(255,46,120,0.13), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(255,184,77,0.10), transparent 60%)",
        }}
      />

      <SiteHeader />

      <section className="relative mx-auto max-w-6xl px-14 pb-8 pt-20">
        <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
          ● How meetlocal.ai works
        </div>
        <h1 className="mt-5 font-display text-7xl font-bold leading-[0.96] tracking-tight">
          Land anywhere.
          <br />
          Meet <span className="grad-text">someone real</span>
          <br />
          in hours, not days.
        </h1>
        <p className="mt-7 max-w-2xl font-display text-xl leading-snug text-text-dim">
          Someone who knows the spots, the shortcuts, and the stories.
        </p>

        {/* Side toggle */}
        <div className="mt-10 inline-flex rounded-full border border-line-2 bg-surface p-1">
          {(["traveler", "local"] as const).map((k) => (
            <Link
              key={k}
              href={`/how-it-works?side=${k}`}
              className={
                k === side
                  ? "rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg"
                  : "rounded-full px-5 py-2.5 text-sm font-medium text-text-dim transition hover:text-text"
              }
            >
              {k === "traveler" ? "I'm a traveler" : "I'm a local host"}
            </Link>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="relative mx-auto max-w-6xl px-14 py-10">
        <div className="grid gap-1">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className={
                  "grid grid-cols-[80px_1fr_auto] items-start gap-8 py-8 lg:grid-cols-[120px_1fr_auto] " +
                  (i === 0 ? "" : "border-t border-line")
                }
              >
                <div className="font-mono text-sm tracking-wider text-coral">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                    {s.t}
                  </h3>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-dim lg:text-lg">
                    {s.d}
                  </p>
                </div>
                <div className="grad-sunset hidden h-20 w-20 items-center justify-center rounded-2xl text-white shadow-[0_20px_40px_rgba(255,106,61,0.20)] sm:flex">
                  <Icon size={32} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats band */}
      <section className="relative border-t border-line bg-bg-2 px-14 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.v}>
              <div className="grad-text font-display text-5xl font-bold tracking-tight">
                {s.k}
              </div>
              <div className="mt-1 text-sm text-text-dim">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What's coming next — moves any speculative claim out of the steps
          above into a clearly-aspirational section. Mirrors the Trust &
          safety page roadmap so the two pages tell one coherent story. */}
      <section className="relative px-14 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
                Roadmap
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                What&rsquo;s shipping next
              </h2>
            </div>
            <Link
              href="/safety#roadmap"
              className="text-sm text-text-dim transition hover:text-text"
            >
              Full safety roadmap <ArrowRight size={13} className="inline" />
            </Link>
          </div>
          <p className="mt-3 max-w-2xl text-text-dim">
            We won&rsquo;t claim a feature we haven&rsquo;t built. Here&rsquo;s
            what&rsquo;s in flight before public launch — so you know the
            gap between the v1 you&rsquo;re using and where we&rsquo;re
            heading.
          </p>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            <RoadmapCard
              t="Background-check integration"
              d="Persona or Checkr automated checks on every applicant — sex offender registry, violent felony, watchlists."
            />
            <RoadmapCard
              t="Stripe Connect Express"
              d="Automated weekly payouts to locals + 1099-NEC issuance. Replaces the v1 manual founder payouts."
            />
            <RoadmapCard
              t="Auto-rematch on timeout"
              d="If the requested local doesn&rsquo;t accept within 30 min, surface other available locals in the same city automatically."
            />
            <RoadmapCard
              t="Live trip tracking"
              d="Opt-in location share with up to 3 emergency contacts during a meet. Auto-off when the booking marks complete."
            />
            <RoadmapCard
              t="Document-verified residency"
              d="Utility bill / lease / birth record uploads to unlock the highest-trust Native badge."
            />
            <RoadmapCard
              t="In-app tipping"
              d="Optional 0–25% tip after the meet. 100% goes to the local. Currently locals can&rsquo;t accept tips through the platform."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-14 py-20 text-center">
        <h2 className="font-display text-5xl font-bold tracking-tight">
          Ready when you are.
        </h2>
        <div className="mt-8 inline-flex flex-wrap justify-center gap-3">
          <Link
            href="/?city=miami"
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
          >
            Find a local in Miami <ArrowRight size={15} />
          </Link>
          <Link
            href="/become-a-local"
            className="rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium text-text"
          >
            Become a local
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function RoadmapCard({ t, d }: { t: string; d: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="font-mono text-[11px] uppercase tracking-wider text-amber">
        ● Coming
      </div>
      <h4 className="mt-2 font-display text-lg font-semibold tracking-tight text-text">
        {t}
      </h4>
      <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{d}</p>
    </div>
  );
}
