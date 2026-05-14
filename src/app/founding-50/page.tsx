import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Users,
  Wallet,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "The Founding 50 · meetlocal.ai",
  description:
    "The first 50 locals on meetlocal.ai will help shape the platform — lifetime reduced fee, founder access, lifetime credit toward your own trips.",
};

const PERKS = [
  {
    icon: Wallet,
    t: "Lifetime 15% platform fee",
    d: "You keep 85% of every booking, forever. Other locals pay 22%. The Founding 50 rate never changes, even as we grow.",
  },
  {
    icon: MessageCircle,
    t: "Direct line to the founder",
    d: "Quarterly group dinners. WhatsApp group with all 50 + me. Your feedback shapes what we build next.",
  },
  {
    icon: Sparkles,
    t: "Co-creation rights",
    d: "Name a meeting spot. Contribute to the 'Hidden Miami' guide we publish. Get featured on the Founding 50 page — forever.",
  },
  {
    icon: Heart,
    t: "5 travel credits",
    d: "Be a traveler too. 5 free hours with another Founding 50 local in a different city, on us.",
  },
];

const REQUIREMENTS = [
  "Born, raised, or rooted (10+ years) in Miami, Tampa, Bay Area, or Portland (ME)",
  "Pass identity verification (government ID + live selfie)",
  "Pass a founder review of your bio, photos, and social profiles",
  "Be 18+ and able to legally work as an independent contractor in the US",
  "Genuinely love your city — and want to show it to people",
];

export default function FoundingFiftyPage() {
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
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-coral">
          ● Limited · 50 spots total
        </div>
        <h1 className="mt-5 font-display text-7xl font-bold leading-[0.96] tracking-tight">
          The <span className="grad-text">Founding 50</span>.
          <br />
          Help us define what
          <br />
          a real local feels like.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-dim">
          We&rsquo;re hand-picking the first 50 locals who&rsquo;ll launch
          meetlocal.ai. Lifetime reduced fee. Founder access. Co-creation
          rights. We&rsquo;ll only do this once.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/become-a-local/apply"
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.35)] transition hover:opacity-95"
          >
            <Heart size={15} /> Apply to be one of the 50
          </Link>
          <Link
            href="#perks"
            className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            What you get <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Perks grid */}
      <section
        id="perks"
        className="relative mx-auto max-w-6xl scroll-mt-16 px-14 pb-16 pt-6"
      >
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
          The Founding 50 perks
        </div>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          What you get — forever
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {PERKS.map((p) => {
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

      {/* Requirements */}
      <section className="relative border-t border-line bg-bg-2 px-14 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="font-mono text-xs uppercase tracking-[0.1em] text-text-dim">
            We&rsquo;re looking for
          </div>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
            Five things
          </h2>
          <ul className="mt-7 grid gap-3.5">
            {REQUIREMENTS.map((r) => (
              <li key={r} className="flex items-start gap-3 text-sm leading-relaxed">
                <Check size={16} className="mt-0.5 shrink-0 text-good" strokeWidth={2} />
                <span className="text-text-dim">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The pitch */}
      <section className="relative mx-auto max-w-5xl px-14 py-16">
        <div
          className="rounded-3xl border p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,106,61,0.13), transparent)",
            borderColor: "rgba(255,106,61,0.35)",
          }}
        >
          <div className="grad-sunset inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(255,106,61,0.45)]">
            <Users size={22} />
          </div>
          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight">
            Why only 50?
          </h3>
          <p className="mt-3 max-w-2xl leading-relaxed text-text-dim">
            Marketplaces live or die by supply quality at the start. The
            first 50 locals will set the tone — for traveler trust, for the
            stories we tell, for the people who join after. We&rsquo;d rather
            launch with 50 people we&rsquo;ve broken bread with than 500 we
            haven&rsquo;t.
          </p>
          <p className="mt-3 max-w-2xl leading-relaxed text-text-dim">
            Once the 50 are in, the program closes. Founding members keep
            their perks for life. Future locals join under the standard
            22% platform fee, no exceptions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/become-a-local/apply"
              className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.35)] transition hover:opacity-95"
            >
              Apply now <ArrowRight size={15} />
            </Link>
            <a
              href="mailto:founders@meetlocal.ai?subject=Founding 50"
              className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium text-text transition hover:bg-surface"
            >
              Ask the founder
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
