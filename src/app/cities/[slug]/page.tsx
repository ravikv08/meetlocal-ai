import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Coffee,
  Wallet,
  Star,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocalCard } from "@/components/LocalCard";
import { CITIES, type CitySlug } from "@/lib/cities";
import { listActiveLocals } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

const VALID_SLUGS = new Set<string>(CITIES.map((c) => c.slug));

// Per-city SEO landing pages — the Airbnb template-at-scale pattern from
// GROWTH_PLAYBOOK § 4. Statically renderable, full Open Graph metadata,
// clear value prop + sample locals + safety story. The same template
// produces 4 pages today, scales to 50+ as we add cities.

export async function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) return { title: "City · meetlocal.ai" };
  const title = `Meet a local in ${city.name} · meetlocal.ai`;
  const description = `Vetted ${city.name} locals who show you the spots, the shortcuts, and the stories no guidebook can. 1:1 meets in 30 minutes. First meets at public, vetted spots.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  if (!VALID_SLUGS.has(slug)) notFound();
  const city = CITIES.find((c) => c.slug === slug)!;

  const [allLocals, spotCount] = await Promise.all([
    listActiveLocals({ city: slug as CitySlug }),
    prisma.meetingSpot.count({ where: { city: slug } }),
  ]);
  const sampleLocals = allLocals.slice(0, 6);

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
          ● meetlocal · {city.name}, {city.state}
        </div>
        <h1 className="mt-5 font-display text-7xl font-bold leading-[0.96] tracking-tight">
          Meet a local
          <br />
          in <span className="grad-text">{city.name}</span>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-text-dim">
          Vetted {city.name} locals who show you the spots, the shortcuts,
          and the stories no guidebook can. 1:1 meets in 30 minutes.
          First meets at public, vetted spots.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/?city=${city.slug}`}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.35)] transition hover:opacity-95"
          >
            Find a {city.name} local <ArrowRight size={15} />
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium text-text transition hover:bg-surface"
          >
            How it works
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-10 flex flex-wrap gap-6 text-sm">
          <Stat n={allLocals.length} label={`vetted ${city.name} locals`} />
          <Stat n={spotCount} label="curated meeting spots" />
          <Stat n={14} label="min response window" suffix="min" />
          <Stat n={78} label="paid to your local" suffix="%" />
        </div>
      </section>

      {/* Trust strip */}
      <section className="relative border-y border-line bg-bg-2/50 px-14 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3">
          {[
            { icon: ShieldCheck, label: `Hand-vetted ${city.name} locals` },
            { icon: Coffee, label: "Public-spot first meets" },
            { icon: Wallet, label: "Pay only when accepted" },
            { icon: Star, label: "Two-way reviews" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-coral">
                <Icon size={15} />
              </div>
              <span className="text-sm font-medium text-text">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Sample locals */}
      {sampleLocals.length > 0 && (
        <section className="relative px-14 pb-12 pt-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
                  A few of our locals
                </div>
                <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                  Hand-picked {city.name} locals
                </h2>
              </div>
              <Link
                href={`/?city=${city.slug}`}
                className="inline-flex items-center gap-1 text-sm text-text-dim transition hover:text-text"
              >
                Browse all {allLocals.length} <ArrowRight size={13} />
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {sampleLocals.map((local) => (
                <LocalCard key={local.id} local={local} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Starbucks Rule explainer */}
      <section className="relative px-14 py-16">
        <div className="mx-auto max-w-5xl">
          <div
            className="flex flex-wrap items-center gap-7 rounded-3xl border p-10"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,106,61,0.13), transparent)",
              borderColor: "rgba(255,106,61,0.35)",
            }}
          >
            <div className="grad-sunset flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_30px_rgba(255,106,61,0.30)]">
              <MapPin size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs uppercase tracking-[0.1em] text-coral">
                The {city.name} Starbucks Rule
              </div>
              <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight">
                Every first meet is at a public, vetted spot
              </h3>
              <p className="mt-2 text-text-dim">
                We&rsquo;ve curated {spotCount}+ meeting spots in {city.name} —
                cafes, parks, and museums with foot traffic, hours of operation,
                and visible safety. You pick from the list during booking.
                No first meets at private addresses, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-line bg-bg-2 px-14 py-20 text-center">
        <h2 className="font-display text-5xl font-bold tracking-tight">
          Land in <span className="grad-text">{city.name}</span>. Leave with a friend.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-dim">
          Within hours of arriving, a vetted {city.name} local opens doors
          no guidebook can.
        </p>
        <div className="mt-8 inline-flex flex-wrap justify-center gap-3">
          <Link
            href={`/?city=${city.slug}`}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
          >
            Find a local now <ArrowRight size={15} />
          </Link>
          <Link
            href="/become-a-local"
            className="rounded-full border border-line-2 px-6 py-3.5 text-sm font-medium text-text"
          >
            Become a {city.name} local
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({
  n,
  label,
  suffix = "",
}: {
  n: number;
  label: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="grad-text font-display text-4xl font-bold tracking-tight">
        {n}
        {suffix}
      </div>
      <div className="mt-0.5 text-xs uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
