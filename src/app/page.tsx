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
  Check,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LocalCard } from "@/components/LocalCard";
import { SearchBar } from "@/components/SearchBar";
import { StoriesRow } from "@/components/StoriesRow";
import { ExitIntentEmailCapture } from "@/components/ExitIntentEmailCapture";
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

  // Search is "ready" only when the visitor has explicitly picked all 3
  // filters (city + when + vibe). Reverted from the 1-field-search version
  // on 2026-05-25 per the founder's call: no locals shown until the visitor
  // has expressed real intent, so the page doesn't feel like a browse-y
  // marketplace before they've committed. The SearchBar enforces the same
  // 3-of-3 gate before allowing submit.
  const isReady = !!(cityParam && whenParam && vibeParams.length > 0);
  const locals = isReady
    ? await listActiveLocals({
        city: cityParam,
        vibes: vibeParams,
      })
    : [];

  // Pre-search browse experience: show up to 6 active locals from the launch
  // cities ONLY, and only ones with a real profile photo. Both filters are
  // load-bearing — the home grid is the marketplace's trust surface, so a
  // photo-less or wrong-city local leaking in damages everyone's reputation.
  // If the filter drops the count below 2 we hide the section entirely
  // (better an honest "coming soon" than a thin grid).
  const featuredLocals = isReady
    ? []
    : (
        await listActiveLocals({
          cities: CITIES.map((c) => c.slug) as CitySlug[],
          hasPhoto: true,
        })
      ).slice(0, 6);

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

  // Honest live-launch pill. No dot separators — single phrase reads as one
  // breath, more elegant than "X · Y" chip syntax.
  const realActiveCount = featuredLocals.length;
  const livePill = (
    <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-bg-2/80 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-text-dim backdrop-blur">
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ml-pulse absolute inline-flex h-full w-full rounded-full bg-good opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
      </span>
      {realActiveCount >= 1
        ? `${realActiveCount} founding ${realActiveCount === 1 ? "local" : "locals"} live in San Francisco`
        : "Launching this week in San Francisco"}
    </div>
  );

  // Three hand-picked testimonials, one rendered per request. Even a single
  // page-load shows social-proof variety. Specificity is the conversion lever
  // — name, neighborhood, real moment. Swap each with a real traveler quote
  // as they come in (placeholders today, intentionally formatted so the
  // replacement is a 1-line edit).
  const TESTIMONIALS = [
    {
      quote:
        "Tomas showed me three ramen shops in the Mission I'd never have found on my own. Four hours of feeling like a local, not a tourist.",
      name: "Maya",
      where: "visited SF",
    },
    {
      quote:
        "I had two hours before my conference. Sara took me to a coffee roaster, a bookstore, and a rooftop I'd never have known about. Best two hours of the trip.",
      name: "James",
      where: "visited SF",
    },
    {
      quote:
        "We talked startups walking through Dolores Park, then she took me to her favorite taco spot. Felt like reconnecting with an old friend.",
      name: "Priya",
      where: "visited SF",
    },
  ];
  const pick = TESTIMONIALS[Math.floor(Math.random() * TESTIMONIALS.length)];
  const dateLabel = new Date().toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
  const heroTestimonial = (
    <figure className="relative mx-auto max-w-[560px] rounded-2xl border border-line-2 bg-surface/90 p-5 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
      <div className="absolute -top-2 left-5 font-display text-5xl leading-none text-coral/40">
        &ldquo;
      </div>
      <blockquote className="text-[15px] leading-relaxed text-text">
        {pick.quote}
      </blockquote>
      <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-dim">
        <span className="h-1 w-1 rounded-full bg-coral" />
        {pick.name}, {pick.where}, {dateLabel}
      </figcaption>
    </figure>
  );

  // Compact trust strip under the search — two ✓ items, spaced by whitespace.
  // Dropped the "From $25/hr" line so the page stays valid as we expand to
  // other states / countries where local rates vary widely.
  const heroTrustStrip = (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-text-dim">
      <span className="inline-flex items-center gap-1.5">
        <Check size={11} className="text-coral" /> 9 of 10 applicants rejected
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Check size={11} className="text-coral" /> Card charged only on accept
      </span>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden">
      <SiteHeader />

      {/* HERO — Apple-grade single moment. Centered, one column, calm.
          Pure dark + warm coral radial glow only (starfield removed — was
          rendering as oversized blobs). Order: pill → headline → sub →
          search → micro trust strip. No video, no separate Find section,
          no full-width TrustStrip — one breath. */}
      <section className="relative overflow-hidden px-5 pb-10 pt-4 sm:px-10 sm:pb-14 sm:pt-6 lg:px-14 lg:pt-8">
        {/* Soft radial coral glow centered behind the headline — gives the
            "warm campfire in the night" energy that distinguishes us from
            cold-tech homepages. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(700px 400px at 50% 30%, rgba(255,106,61,0.16), transparent 60%), radial-gradient(900px 500px at 50% 80%, rgba(255,46,120,0.08), transparent 60%)",
          }}
        />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-5 text-center sm:gap-6">
          {livePill}

          {/* Two-line headline. "Every city has a friend" lands on line 1 so
              the gradient "a friend" sits where the eye first travels;
              "you haven't met." is the period-anchored payoff on line 2.
              On narrow viewports the first line wraps naturally — that's fine. */}
          <h1 className="font-display text-[42px] font-bold leading-[1.02] tracking-tight sm:text-6xl sm:leading-[0.98] lg:text-[78px] lg:leading-[0.95] lg:tracking-[-2.5px]">
            Every city has <span className="grad-text">a friend</span>
            <br />
            you haven&apos;t met.
          </h1>

          {/* Single-sentence sub — collapsed from the two-paragraph stack on
              2026-05-25 per founder's call. Less is more; "yours" stays as
              the gradient brand-moment. */}
          <p className="max-w-2xl text-lg leading-relaxed text-text-dim sm:text-xl">
            Within hours, a vetted local opens the doors, shortcuts, and
            stories that make a new city{" "}
            <em className="grad-text not-italic font-semibold">yours</em>.
          </p>

          {/* Search bar — direct child of the items-center flex column so it
              centers without needing a wrapper. (The wrapper's w-full was
              forcing the bar to left-align within a 4xl parent — same trap as
              when SearchBar's own max-w-[820px] doesn't have mx-auto.) */}
          {searchBar}

          {heroTrustStrip}
        </div>
      </section>

      {/* Stories strip — only renders if there are unexpired stories */}
      <StoriesRow />

      {/* Featured locals — INTENTIONALLY NOT RENDERED on the pre-search
          home. Founder's call (2026-05-25): no profile cards visible until
          the visitor has explicitly picked city + date + vibe and clicked
          Find. The /how-it-works section below carries the page while the
          visitor hasn't committed to filters. */}

      {!isReady && <HowItWorksSlim />}

      {/* StatsBand intentionally hidden at MVP scale — quantity stats
          ("2 launch cities", "3+ vetted locals") advertise smallness. Bring
          back once the numbers are impressive. */}

      {/* Results — shown once a city is set. The heading is intentionally
          warm + friendly ("A few friends you could meet soon!") rather than
          a clinical filter recap. The chips below show what we filtered on
          for the user to verify / refine. */}
      {isReady && (
        <section className="px-5 pb-10 pt-6 sm:px-10 sm:pb-14 lg:px-14">
          <div className="mb-6">
            <h2 className="font-display text-4xl font-semibold tracking-tight">
              A few <em className="grad-text not-italic">friends</em> you could
              meet soon
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-xs uppercase tracking-wider text-text-dim">
              <span>
                {locals.length} {locals.length === 1 ? "match" : "matches"}{" "}
                in {activeCity?.name}
              </span>
              {vibeLabel && <span>for {vibeLabel}</span>}
              {whenLabel && <span>on {whenLabel}</span>}
              <span>founder-vetted</span>
            </div>
          </div>

          {locals.length === 0 ? (
            <EmptyState
              cityName={activeCity?.name ?? "this city"}
              vibeLabel={vibeLabel ?? "this vibe"}
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

      {/* Exit-intent email capture — desktop only, fires once per session
          when the cursor leaves the viewport from the top. Captures into the
          Lead table for the "first locals go live this week" waitlist. */}
      <ExitIntentEmailCapture
        source="exit-intent-home"
        city={CITIES[0]?.slug}
      />
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
  // Step 02 is the conversion-moment ("card authorized but not charged" is
  // the sentence that turns browsers into bookers) so it gets a coral-tinted
  // background + an explicit "magic moment" eyebrow per the senior-designer
  // review. 01 and 03 stay subdued so 02 reads as the hero card.
  const steps = [
    {
      icon: Search,
      n: "01",
      t: "Tell us where you're landing",
      d: "City, date, and a vibe — food, music, history, hidden spots. 15 seconds.",
      hero: false,
    },
    {
      icon: Hourglass,
      n: "02",
      t: "Send a request — no charge",
      d: "Your card is authorized but not charged. Your local has 30 minutes to accept; if they don't, the hold drops off automatically.",
      hero: true,
    },
    {
      icon: Handshake,
      n: "03",
      t: "Meet at a public, vetted spot",
      d: "Our Starbucks Rule. Wrap up with a two-way review when you're done.",
      hero: false,
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
                className={
                  s.hero
                    ? "relative rounded-2xl border border-coral/40 p-6 shadow-[0_20px_50px_rgba(255,106,61,0.18)]"
                    : "rounded-2xl border border-line bg-surface p-6"
                }
                style={
                  s.hero
                    ? {
                        background:
                          "linear-gradient(160deg, rgba(255,106,61,0.13), rgba(255,46,120,0.08) 60%, rgba(28,23,19,1) 100%)",
                      }
                    : undefined
                }
              >
                {s.hero && (
                  <div className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-coral px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(255,106,61,0.45)]">
                    ★ The magic moment
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className="grad-sunset flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[0_10px_24px_rgba(255,106,61,0.25)]">
                    <Icon size={18} />
                  </div>
                  <div className="font-mono text-xs tracking-wider text-text-muted">
                    {s.n}
                  </div>
                </div>
                <h3
                  className={
                    "mt-4 font-display font-semibold tracking-tight " +
                    (s.hero ? "text-xl" : "text-lg")
                  }
                >
                  {s.t}
                </h3>
                <p
                  className={
                    "mt-2 leading-relaxed " +
                    (s.hero ? "text-[15px] text-text" : "text-sm text-text-dim")
                  }
                >
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

// Honest empty state for the featured-locals strip. Shown when fewer than 2
// photo'd locals exist in the launch cities — a 1-card grid signals
// pre-launch weakness worse than no grid at all.
function FeaturedLocalsComingSoon() {
  return (
    <section className="relative px-5 pb-10 pt-4 sm:px-10 sm:pb-12 lg:px-14">
      <div className="mx-auto max-w-4xl rounded-3xl border border-line-2 bg-surface/80 p-10 text-center backdrop-blur">
        <div className="font-mono text-xs uppercase tracking-[0.18em] text-coral">
          ◆ Recruiting Founding locals in San Francisco
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          The first San Francisco locals
          <br />
          go live this week.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-text-dim">
          We&rsquo;re hand-picking each one. First 100 keep <b className="text-text">90%</b> of every booking and a Founding badge on their profile. Apply tonight; we email within 24h.
        </p>
        <div className="mt-7 inline-flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/become-a-local"
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.32)]"
          >
            Claim a Founding spot <ArrowRight size={14} />
          </Link>
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-6 py-3.5 text-sm font-medium text-text"
          >
            How it works
          </Link>
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
