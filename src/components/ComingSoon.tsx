import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  emphasis?: string;
  description: string;
  icon: LucideIcon;
  features: { title: string; body: string }[];
  primaryHref?: string;
  primaryLabel?: string;
}

// Shared placeholder for prototype features that haven't been built end-to-end
// yet (Reels, Concierge, Plus, Pulse, Host dashboard). Same dark hero look as
// /how-it-works so the brand stays consistent across nav.
export function ComingSoon({
  eyebrow,
  title,
  emphasis,
  description,
  icon: Icon,
  features,
  primaryHref = "/",
  primaryLabel = "Back to discover",
}: ComingSoonProps) {
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

      <section className="relative mx-auto max-w-5xl px-14 pb-12 pt-20">
        <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-[0.1em] text-coral">
          <span
            className="animate-ml-pulse h-1.5 w-1.5 rounded-full bg-coral"
            style={{ boxShadow: "0 0 12px var(--color-coral)" }}
          />
          {eyebrow}
        </div>
        <h1 className="mt-6 font-display text-7xl font-bold leading-[0.96] tracking-tight">
          {title}
          {emphasis && (
            <>
              <br />
              <span className="grad-text">{emphasis}</span>
            </>
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-dim">
          {description}
        </p>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-line bg-surface p-5"
            >
              <div className="grad-sunset inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
                <Icon size={18} />
              </div>
              <div className="mt-4 font-display text-base font-semibold">
                {f.title}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-text-dim">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={primaryHref}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
          >
            {primaryLabel} <ArrowRight size={15} />
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium"
          >
            How meetlocal works
          </Link>
        </div>

        <p className="mt-6 font-mono text-xs text-text-muted">
          Coming in v2 · email a feature request to founders@meetlocal.ai
        </p>
      </section>

      <SiteFooter />
    </div>
  );
}
