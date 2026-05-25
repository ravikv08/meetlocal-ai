import Link from "next/link";
import {
  ShieldCheck,
  Coffee,
  Wallet,
  Star,
  Search,
  Hourglass,
  Handshake,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocalCard } from "@/components/LocalCard";
import { SearchBar } from "@/components/SearchBar";
import { StickySearch } from "@/components/StickySearch";
import { StoriesRow } from "@/components/StoriesRow";
import { HeroStoryVideo } from "@/components/HeroStoryVideo";
import { formatRelative } from "@/lib/date-utils";
import {
  CITIES,
  CATEGORIES,
  type CitySlug,
  type CategoryId,
} from "@/lib/cities";
import { listActiveLocals } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

interface HomeProps {
  searchParams: Promise<{
    city?: string;
    when?: string;
    /** Comma-separated category ids — multi-select. */
    vibes?: string;
    /** Legacy single-vibe param; still honored for older bookmarks. */
    vibe?: string;
  }>;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_CITIES = new Set<string>(CITIES.map((c) => c.slug));
const VALID_VIBES = new Set<string>(CATEGORIES.map((c) => c.id));

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;

  const cityParam =
    sp.city && VALID_CITIES.has(sp.city) ? (sp.city as CitySlug) : null;
  const whenParam = sp.when && ISO_DATE.test(sp.when) ? sp.when : null;
  // Multi-select vibes; fall back to legacy `vibe=` for old links
  const rawVibes = sp.vibes ?? sp.vibe ?? "";
  const vibeParams = rawVibes
    .split(",")
    .map((s) => s.trim())
    .filter((s) => VALID_VIBES.has(s)) as CategoryId[];

  const isReady = !!(cityParam && whenParam && vibeParams.length > 0);
  const locals = isReady
    ? await listActiveLocals({
        city: cityParam,
        vibes: vibeParams,
      })
    : [];

  // Pre-search browse experience: show 6 active locals from across all cities
  // so first-time visitors see real supply quality before committing to a
  // search. Skipped when a search is active to keep the results focused.
  const featuredLocals = isReady ? [] : (await listActiveLocals()).slice(0, 6);

  // Per-city counts for the city showcase. Real numbers, not aspirational.
  const cityCountsRaw = isReady
    ? []
    : await prisma.localProfile.groupBy({
        by: ["city"],
        where: { status: "active" },
        _count: true,
      });
  const cityCounts = new Map(cityCountsRaw.map((r) => [r.city, r._count]));
  const totalActiveLocals = Array.from(cityCounts.values()).reduce(
    (a, b) => a + b,
    0,
  );

  const activeCity = cityParam
    ? CITIES.find((c) => c.slug === cityParam)
    : null;
  const whenLabel = whenParam ? formatRelative(whenParam) : null;
  const vibeLabel = vibeParams.length
    ? vibeParams
        .map((id) => CATEGORIES.find((c) => c.id === id)?.label.toLowerCase() ?? id)
        .join(" + ")
    : null;

  const searchBar = (
    <SearchBar
      cities={CITIES.map((c) => ({ slug: c.slug, name: c.name, state: c.state }))}
      vibes={CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        blurb: c.blurb,
      }))}
      defaultCity={cityParam}
      defaultWhen={whenParam}
      defaultVibes={vibeParams}
    />
  );

  const subhead = (
    <div className="max-w-[560px] space-y-3">
      <p className="font-display text-2xl font-semibold leading-tight tracking-tight text-text">
        Land in a new city. Leave with a friend in it.
      </p>
      <p className="text-lg leading-relaxed text-text-dim">
        Within hours, a vetted local opens doors no guidebook can — the
        spots, the shortcuts, and the stories that make a city{" "}
        <em className="grad-text not-italic font-semibold">yours</em>.
      </p>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden">
      <SiteHeader />

      {/* Search bar — Airbnb pattern: pulled up, left-aligned right below the
          header. StickySearch keeps it pinned to the top of the viewport on
          scroll with a soft drop-shadow once the hero is out of view. */}
      <StickySearch>{searchBar}</StickySearch>

      {/* HERO — split layout: headline left, story video right.
          Mobile: stack with smaller padding + headline that fits on iPhone. */}
      <section className="relative px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8 lg:px-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch lg:gap-12">
          <div className="flex flex-col gap-5 sm:gap-7">
            <h1 className="font-display text-[40px] font-bold leading-[1.02] tracking-tight sm:text-6xl sm:leading-[0.98] lg:text-[80px] lg:leading-[0.94] lg:tracking-[-2.5px]">
              Every city
              <br />
              has <span className="grad-text">a friend</span>
              <br />
              you haven&apos;t met.
            </h1>
            {subhead}
          </div>
          <HeroStoryVideo
            src="/video/story-loop.mp4"
            className="aspect-video w-full lg:self-center"
          />
        </div>
      </section>

      {/* Trust strip — 4 quick promises, always visible. Answers the
          "can I trust this?" question before any other content. Each badge
          maps to a real shipped feature; nothing here is aspirational. */}
      <TrustStrip />

      {/* Stories strip — only renders if there are unexpired stories */}
      <StoriesRow />


      {/* Pre-search browse experience: featured locals + how-it-works.
          Hidden once the user has all 3 filters set so they get a clean
          results view. */}
      {!isReady && featuredLocals.length > 0 && (
        <section className="relative px-5 pb-10 pt-4 sm:px-10 sm:pb-12 lg:px-14">
          <div className="mb-5 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
                Hand-vetted · {featuredLocals.length}+ locals in the Bay Area
              </div>
              <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
                Meet a few of our locals
              </h2>
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-text-dim">
              Use the search above to filter by city, date &amp; vibe
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {featuredLocals.map((local) => (
              <LocalCard
                key={local.id}
                local={local}
                whenParam={whenParam ?? undefined}
              />
            ))}
          </div>
        </section>
      )}

      {!isReady && <HowItWorksSlim />}

      {!isReady && totalActiveLocals > 0 && (
        <StatsBand totalLocals={totalActiveLocals} />
      )}

      {/* Results — only render once all three filters are set */}
      {isReady && (
        <section className="px-5 pb-10 pt-6 sm:px-10 sm:pb-14 lg:px-14">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <h2 className="font-display text-4xl font-semibold tracking-tight">
                Locals for <em className="grad-text not-italic">{vibeLabel}</em>
                {" on "}
                <em className="grad-text not-italic">{whenLabel}</em>
                {" in "}
                <em className="grad-text not-italic">{activeCity?.name}</em>
              </h2>
              <div className="mt-1.5 font-mono text-sm text-text-dim">
                {locals.length} {locals.length === 1 ? "match" : "matches"} ·
                vetted by founder
              </div>
            </div>
          </div>

          {locals.length === 0 ? (
            <EmptyState
              cityName={activeCity?.name ?? "this city"}
              vibeLabel={vibeLabel ?? "this vibe"}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {locals.map((local) => (
                <LocalCard
                  key={local.id}
                  local={local}
                  whenParam={whenParam ?? undefined}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <SiteFooter liveCount={isReady ? locals.length : featuredLocals.length} />
    </div>
  );
}

// ── Sub-sections ───────────────────────────────────────────────────────────

function TrustStrip() {
  const items = [
    { icon: ShieldCheck, label: "Hand-vetted locals" },
    { icon: Coffee, label: "Public-spot first meets" },
    { icon: Wallet, label: "Pay only when accepted" },
    { icon: Star, label: "Two-way reviews" },
  ];
  return (
    <section className="relative border-y border-line bg-bg-2/50 px-5 py-5 sm:px-10 lg:px-14">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface text-coral">
              <Icon size={15} />
            </div>
            <span className="text-sm font-medium text-text">{label}</span>
          </div>
        ))}
        <Link
          href="/safety"
          className="ml-auto inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-text-dim transition hover:text-text"
        >
          How we keep you safe <ArrowRight size={12} />
        </Link>
      </div>
    </section>
  );
}

function HowItWorksSlim() {
  const steps = [
    {
      icon: Search,
      n: "01",
      t: "Tell us where you're landing",
      d: "City, date, and a vibe — food, music, history, hidden spots. 15 seconds.",
    },
    {
      icon: Hourglass,
      n: "02",
      t: "Send a request",
      d: "Your card is authorized but not charged. Your local has 30 minutes to accept.",
    },
    {
      icon: Handshake,
      n: "03",
      t: "Meet at a public, vetted spot",
      d: "Our Starbucks Rule. Wrap up with a two-way review when you're done.",
    },
  ];
  return (
    <section className="relative px-5 py-10 sm:px-10 sm:py-14 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
              How it works
            </div>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">
              Three steps. About sixty seconds.
            </h2>
          </div>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1 text-sm text-text-dim transition hover:text-text"
          >
            See full walkthrough <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.n}
                className="rounded-2xl border border-line bg-surface p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="grad-sunset flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_10px_24px_rgba(255,106,61,0.25)]">
                    <Icon size={18} />
                  </div>
                  <div className="font-mono text-xs tracking-wider text-text-muted">
                    {s.n}
                  </div>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                  {s.t}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  {s.d}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StatsBand({ totalLocals }: { totalLocals: number }) {
  // Defensible numbers only — every figure here is currently true.
  const stats = [
    { k: "2", v: "launch cities" },
    { k: `${totalLocals}+`, v: "vetted locals" },
    { k: "1:1", v: "every meet" },
    { k: "30 min", v: "accept window" },
  ];
  return (
    <section className="relative border-t border-line bg-bg-2 px-14 py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v}>
            <div className="grad-text font-display text-5xl font-bold tracking-tight">
              {s.k}
            </div>
            <div className="mt-1 text-sm text-text-dim">{s.v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyState({
  cityName,
  vibeLabel,
}: {
  cityName: string;
  vibeLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-2 bg-surface px-8 py-16 text-center">
      <div className="font-display text-2xl font-semibold">
        No {vibeLabel} locals in {cityName} on that date.
      </div>
      <p className="mx-auto mt-3 max-w-md text-text-dim">
        Try a different vibe, a nearby city, or apply to be the first local for
        this combo.
      </p>
      <div className="mt-6 inline-flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full border border-line-2 px-5 py-2.5 text-sm font-medium"
        >
          Reset search
        </Link>
        <Link
          href="/become-a-local"
          className="rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
        >
          Become a local
        </Link>
      </div>
    </div>
  );
}
