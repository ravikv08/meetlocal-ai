import Link from "next/link";
import { MapPin, User, MessageCircle, ShieldCheck, Star, Check, Wallet, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface HowItWorksProps {
  searchParams: Promise<{ side?: string }>;
}

const TRAVELER_STEPS = [
  {
    n: "01",
    t: "Tell us where you're landing",
    d: "Tap the city, dates, and what you're into — food, music, photos, nothing in particular. Takes 15 seconds.",
    icon: MapPin,
  },
  {
    n: "02",
    t: "Pick a local from the grid",
    d: "Every profile shows a Born-&-raised / Rooted / Seasoned badge, verified ID, background-check date, and reviews from past travelers.",
    icon: User,
  },
  {
    n: "03",
    t: "Chat first, or instant-book",
    d: "Message to feel out the vibe, or book directly — they have 14 minutes to accept before we auto-match you with the next-best local.",
    icon: MessageCircle,
  },
  {
    n: "04",
    t: "Meet up — we track the trip",
    d: "Live map shows their ETA. Trip tracking shares with one trusted contact. SOS is one tap.",
    icon: ShieldCheck,
  },
  {
    n: "05",
    t: "Review, tip, remember",
    d: "100% of tips go to your local. Reviews publish only after both sides submit — no retaliation possible.",
    icon: Star,
  },
];

const LOCAL_STEPS = [
  {
    n: "01",
    t: "Apply in 10 minutes",
    d: "Tell us who you are, where you're from, what you'd love to show people. Set your own rate.",
    icon: User,
  },
  {
    n: "02",
    t: "Verify your identity",
    d: "Government ID + liveness selfie via Persona. Most applicants clear in 90 seconds.",
    icon: ShieldCheck,
  },
  {
    n: "03",
    t: "Prove your roots",
    d: 'Utility bill, lease, or birth record unlocks your residency badge. 10+ years → "Rooted". Born here → "Native" (highest trust signal, highest rate).',
    icon: MapPin,
  },
  {
    n: "04",
    t: "Clear a background check",
    d: "Criminal + watchlist check via Checkr (US) or Sterling (intl). Same standard as Uber & Airbnb. 24h turnaround.",
    icon: Check,
  },
  {
    n: "05",
    t: "Connect Stripe, go live",
    d: "Bank account via Stripe Connect. Weekly payouts on Monday. You keep 80% of every booking.",
    icon: Wallet,
  },
];

const STATS = [
  { k: "4", v: "launch cities" },
  { k: "10+", v: "vetted locals" },
  { k: "4.9★", v: "target rating" },
  { k: "<5h", v: "match-to-meet" },
];

export default async function HowItWorksPage({ searchParams }: HowItWorksProps) {
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
                <div className="font-mono text-sm tracking-wider text-coral">{s.n}</div>
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
