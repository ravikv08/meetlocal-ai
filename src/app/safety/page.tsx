import Link from "next/link";
import {
  ShieldCheck,
  Coffee,
  Wallet,
  MessageCircle,
  Star,
  IdCard,
  AlertTriangle,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Trust & Safety page. Every claim on this page must be defensibly true at
// v1 — no "AI monitoring" or "24/7 dispatcher" until it's actually built.
// The roadmap callout at the bottom names what's coming so we get the
// trust narrative without the legal exposure.

const PILLARS = [
  {
    icon: IdCard,
    t: "Every local is vetted by hand",
    d: "Each applicant submits a government-issued ID, a live selfie that must match the ID, date of birth, and at least one verifiable social profile. The founder reviews every application personally before a profile goes live. Background-check vendor (Persona / Checkr) is rolling out in v2.",
  },
  {
    icon: Coffee,
    t: "First meet at a public, vetted spot",
    d: 'We call it the Starbucks Rule. Every booking lets you pick from a curated list of cafés, parks, and museums — staffed 16+ hours/day, CCTV present, foot traffic guaranteed. No meets at private homes for first sessions, ever.',
  },
  {
    icon: Wallet,
    t: "You're never charged unless they accept",
    d: "Your card is authorized when you book — but not charged. The local has 30 minutes to accept. If they decline or don't respond, the hold is released and you pay nothing. Real charge only happens after your local accepts.",
  },
  {
    icon: Star,
    t: "Two-way reviews, hidden until both submit",
    d: "Each side writes a review independently — and neither sees the other's until both have submitted. No retaliation pressure, no rating-hostage dynamics. Reviews go public on the local's profile simultaneously.",
  },
  {
    icon: MessageCircle,
    t: "Communication stays on the platform",
    d: "All chat happens on meetlocal.ai. If we detect handoffs to off-platform messengers (phone numbers, WhatsApp handles), the booking is flagged for founder review. Reportable by either side at any time.",
  },
  {
    icon: ShieldCheck,
    t: "One-tap report, real human review",
    d: "Anything off — even a vibe — gets reported with one tap. The founder personally responds to every safety report within hours. Repeat reports remove a local from the platform; serious reports go to law enforcement.",
  },
];

const WE_CHECK = [
  "Government-issued ID authenticity",
  "Live selfie matched to ID photo",
  "Date of birth (must be 18+)",
  "At least one verifiable social profile",
  "Founder review of bio + tagline + photos",
  "Re-verification on any safety report",
];

const WE_DONT = [
  "Credit history or debt",
  "Arrests without a conviction",
  "Non-violent juvenile records",
  "Minor traffic violations",
  "Medical history",
  "Immigration status",
];

const ROADMAP = [
  {
    t: "Background check vendor integration",
    d: "Persona or Checkr — sex offender registry, violent felony, terrorism watchlists. Targeting integration before public launch.",
  },
  {
    t: "Live location share with trusted contacts",
    d: "Opt-in trip tracking visible to up to 3 emergency contacts during a meet. Auto-off when the booking marks complete.",
  },
  {
    t: "On-call safety hotline",
    d: "Dedicated safety phone number with in-region trained dispatchers. Until then, dial 911 first for any imminent danger and email us in parallel.",
  },
];

export default function SafetyPage() {
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

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-14 pb-10 pt-20">
        <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
          ● Trust &amp; safety
        </div>
        <h1 className="mt-5 font-display text-7xl font-bold leading-[0.94] tracking-tight">
          You meet a stranger.
          <br />
          We make sure
          <br />
          they&rsquo;re <span className="grad-text">not one</span>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-dim">
          Every local is hand-vetted, every first meet is at a public
          spot, and every dollar is held until they accept. Here&rsquo;s
          exactly what we do — and what&rsquo;s coming next.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="#report"
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95"
          >
            <AlertTriangle size={14} /> Report a concern
          </Link>
          <Link
            href="#roadmap"
            className="inline-flex items-center gap-2 rounded-full border border-line-2 px-5 py-2.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            What&rsquo;s coming next <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Pillars grid */}
      <section className="relative mx-auto max-w-6xl px-14 pb-16 pt-6">
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.t}
                className="rounded-2xl border border-line-2 bg-surface p-7"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-coral">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {p.t}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-text-dim">
                  {p.d}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What we check vs don't */}
      <section className="relative border-t border-line bg-bg-2 px-14 py-18">
        <div className="mx-auto max-w-5xl">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
            What our checks cover
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Transparent by design
          </h2>
          <p className="mt-3 max-w-2xl text-text-dim">
            We tell you exactly what we look at — and what we
            don&rsquo;t. We&rsquo;re an FCRA-aware platform, which means
            the off-limits list is the law, not a marketing choice.
          </p>
          <div className="mt-9 grid gap-10 md:grid-cols-2">
            <div>
              <h4 className="font-display text-xl font-semibold tracking-tight text-good">
                We check
              </h4>
              <ul className="mt-4 grid gap-3">
                {WE_CHECK.map((x) => (
                  <li key={x} className="flex items-start gap-2.5 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-good"
                      strokeWidth={2}
                    />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-display text-xl font-semibold tracking-tight text-text-dim">
                We don&rsquo;t look at
              </h4>
              <ul className="mt-4 grid gap-3">
                {WE_DONT.map((x) => (
                  <li
                    key={x}
                    className="flex items-start gap-2.5 text-sm text-text-dim"
                  >
                    <X
                      size={16}
                      className="mt-0.5 shrink-0 text-text-muted"
                      strokeWidth={2}
                    />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Report a concern */}
      <section
        id="report"
        className="relative scroll-mt-24 mx-auto max-w-5xl px-14 py-16"
      >
        <div
          className="flex flex-wrap items-center gap-7 rounded-3xl border p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,106,61,0.13), transparent)",
            borderColor: "rgba(255,106,61,0.35)",
          }}
        >
          <div className="grad-sunset flex h-16 w-16 shrink-0 items-center justify-center rounded-full">
            <AlertTriangle size={28} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
              If something feels off — even a little
            </div>
            <h3 className="mt-1.5 font-display text-3xl font-semibold tracking-tight">
              Tell us. We will respond.
            </h3>
            <p className="mt-2 text-text-dim">
              The founder personally reads every safety report. Most get a
              human reply within an hour, all within the same day. For an
              imminent danger, dial 911 first — then email us.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <a
                href="mailto:safety@meetlocal.ai"
                className="grad-sunset inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-white"
              >
                Email safety@meetlocal.ai
              </a>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2 text-text-dim transition hover:text-text"
              >
                Help center
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap — honest "what's next" so we never overpromise on the
          pillars above. Each item names what's planned and where in the
          launch cadence it lives. */}
      <section
        id="roadmap"
        className="relative scroll-mt-24 border-t border-line bg-bg-2 px-14 py-16"
      >
        <div className="mx-auto max-w-5xl">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
            Roadmap · Trust &amp; safety
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            What&rsquo;s coming next
          </h2>
          <p className="mt-3 max-w-2xl text-text-dim">
            We refuse to claim a feature we haven&rsquo;t built. Here&rsquo;s
            what&rsquo;s in flight — and what we&rsquo;re committing to
            ship before public launch.
          </p>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {ROADMAP.map((r) => (
              <div
                key={r.t}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="font-mono text-[11px] uppercase tracking-wider text-amber">
                  ● Coming
                </div>
                <h4 className="mt-2 font-display text-lg font-semibold tracking-tight text-text">
                  {r.t}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-text-dim">
                  {r.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
