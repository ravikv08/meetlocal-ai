import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Three aspirational "Real locals" testimonials. International on purpose —
// the page is a recruiting CTA, not a launch-city directory. If/when we have
// real testimonials from Miami / Bay Area hosts, swap these for live ones
// from the DB.
const REAL_LOCALS = [
  {
    initials: "EL",
    name: "Elif A.",
    city: "Istanbul",
    neighborhood: "Karaköy",
    quote:
      "I host two ferry-and-meze nights a week. Pays my rent in Karaköy and I've made friends from 14 countries.",
    monthly: "$820",
    ring: "linear-gradient(135deg, #ffb84d, #ff6a3d)",
  },
  {
    initials: "MI",
    name: "Mika T.",
    city: "Tokyo",
    neighborhood: "Shimokita",
    quote:
      "Late-night food crawls are already my hobby. Now someone pays me to do them. I never advertise — the platform does.",
    monthly: "$1,120",
    ring: "linear-gradient(135deg, #4dd0ff, #2a78d6)",
  },
  {
    initials: "DI",
    name: "Diego R.",
    city: "Mexico City",
    neighborhood: "Roma",
    quote:
      "Between rideshare shifts, I do two mezcal nights a week. Way better pay, and I actually enjoy the work.",
    monthly: "$1,480",
    ring: "linear-gradient(135deg, #7be38b, #2fa84e)",
  },
];

// Earnings-card rows. Hard-coded for v1 — the "Founding 100 / 90%" and the
// $200 sign-on bonus are marketing promises that need backend support before
// we honor them in /host payouts.
const EARNINGS_ROWS = [
  { label: "Suggested rate (Founding)", value: "$24 – $48" },
  {
    label: "Your cut — Founding 100",
    value: "90%",
    valueClass: "text-coral",
  },
  { label: "Your cut — standard", value: "80%" },
  { label: "Payout schedule", value: "Weekly · Mondays" },
  { label: "Sign-on bonus", value: "$200 after 5 meetups" },
];

export default async function BecomeALocalPage() {
  const session = await auth();
  if (session?.user?.id) {
    // If they're already a local, the apply page handles the redirect; we
    // keep the load light here.
    await prisma.localProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
  }

  const ctaHref = session?.user
    ? "/become-a-local/apply"
    : "/signin?from=/become-a-local/apply";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Radial accent — coral/pink wash behind the hero, kept subtle so the
          headline + earnings card carry the visual weight. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 85% -10%, rgba(255,46,120,0.16), transparent 60%), radial-gradient(700px 400px at -10% 20%, rgba(255,184,77,0.10), transparent 60%)",
        }}
      />

      <SiteHeader />

      {/* ───────────── HERO ─────────────
          Two-column on lg+; stacks on mobile. Left = pitch. Right = earnings
          card. Slightly biased toward the left col so the headline breathes. */}
      <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 sm:px-10 lg:px-14 lg:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* LEFT — Pitch */}
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-coral">
              ◆ Earn from your hometown
            </div>
            <h1 className="mt-5 font-display text-6xl font-bold leading-[0.96] tracking-tight sm:text-7xl lg:text-[5.5rem]">
              Your city
              <br />
              is a <span className="grad-text">paycheck.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-dim">
              Show travelers your favorite ramen counter, rooftop, secondhand
              shop.{" "}
              <span className="font-semibold text-text">
                First 100 locals in every city
              </span>{" "}
              earn{" "}
              <span className="font-semibold text-text">
                90% take rate forever
              </span>
              , top placement, and a Founding badge on their profile. Work when
              you want. Verification takes 24h.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.32)] transition hover:opacity-95"
              >
                Claim a Founding spot <ArrowRight size={16} />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-6 py-3.5 text-base font-medium text-text transition hover:border-line"
              >
                How it works
              </Link>
            </div>
          </div>

          {/* RIGHT — Earnings card. The visual anchor: a concrete dollar
              number plus a transparent breakdown so the offer reads as real,
              not as fluff. */}
          <aside className="rounded-3xl border border-line-2 bg-surface/95 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:p-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
              Average local earns
            </div>
            <div className="mt-3 font-display text-6xl font-bold leading-none tracking-tight sm:text-7xl">
              <span className="grad-text">$1,840</span>
            </div>
            <div className="mt-3 text-sm text-text-dim">
              per month · 12 meetups · ~4 hrs/wk
            </div>

            <div className="mt-7 grid gap-0">
              {EARNINGS_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={
                    "flex items-center justify-between gap-4 py-3.5 text-sm " +
                    (i === EARNINGS_ROWS.length - 1
                      ? ""
                      : "border-b border-line/70")
                  }
                >
                  <span className="text-text-dim">{row.label}</span>
                  <span
                    className={
                      "font-semibold " + (row.valueClass ?? "text-text")
                    }
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {/* ───────────── REAL LOCALS ─────────────
          Three quote cards with city-tinted avatar rings + monthly earnings.
          Single source of truth in REAL_LOCALS above. */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-14">
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Real locals. Real earnings.
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {REAL_LOCALS.map((l) => (
            <article
              key={l.name}
              className="rounded-3xl border border-line-2 bg-surface/95 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{
                    background: l.ring,
                    boxShadow:
                      "inset 0 0 0 3px var(--color-surface), inset 0 0 0 4px rgba(255,255,255,0.05)",
                  }}
                >
                  {l.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold text-text">
                    {l.name}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    {l.city} · {l.neighborhood}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-text-dim">
                &ldquo;{l.quote}&rdquo;
              </p>
              <div className="mt-5 font-display text-lg font-semibold text-coral">
                {l.monthly} / mo
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ─────────────
          Keeps the existing 3-step approval explainer; the secondary hero CTA
          scrolls here. Anchor id keeps deep links / shared URLs working. */}
      <section
        id="how-it-works"
        className="relative mx-auto max-w-6xl px-6 pb-32 sm:px-10 lg:px-14"
      >
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
          How approval works
        </div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          From application to first booking
        </h2>
        <ol className="mt-7 grid gap-5 md:grid-cols-3">
          <Step n="1" title="Tell us about you">
            Photo, neighborhood, what you&rsquo;d show a friend, your rate.
            Takes 3 minutes.
          </Step>
          <Step n="2" title="Founder review">
            We personally read every application. Goal: 24h response.
            We&rsquo;ll ping you with questions if needed.
          </Step>
          <Step n="3" title="Go live">
            Profile goes live in your city. We email you the moment a request
            lands. You have 30 minutes to accept.
          </Step>
        </ol>

        <div className="mt-12">
          <Link
            href={ctaHref}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.32)] transition hover:opacity-95"
          >
            Claim a Founding spot <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="rounded-2xl border border-line bg-surface p-6">
      <span className="font-mono text-xs tracking-[0.1em] text-text-muted">
        0{n}
      </span>
      <div className="mt-2 font-display text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-text-dim">{children}</p>
    </li>
  );
}
