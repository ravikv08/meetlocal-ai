import Link from "next/link";
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

  const eyebrow = (
    <div
      className="inline-flex items-center gap-2 rounded-full border border-coral/50 px-3 py-1.5 font-mono text-xs text-coral shadow-[0_0_24px_rgba(255,106,61,0.18)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,106,61,0.18), rgba(255,46,120,0.10))",
      }}
    >
      <span
        className="animate-ml-pulse h-1.5 w-1.5 rounded-full bg-coral"
        style={{ boxShadow: "0 0 12px var(--color-coral)" }}
      />
      <span className="font-bold text-amber">NEW</span>
      <span className="text-coral/70">·</span>
      <span>Arrive on-demand. Meet in 5 hours, not 5 days.</span>
    </div>
  );

  const subhead = (
    <p className="max-w-[520px] text-lg leading-relaxed text-text-dim">
      Open meetlocal.ai when you land. Within hours, you&apos;re with a vetted
      local who knows the spots, the shortcuts, and the stories.
    </p>
  );

  return (
    <div className="relative overflow-x-hidden">

      <SiteHeader />

      {/* Search bar — Airbnb pattern: pulled up, left-aligned right below the
          header. StickySearch keeps it pinned to the top of the viewport on
          scroll with a soft drop-shadow once the hero is out of view. */}
      <StickySearch>
        {searchBar}
      </StickySearch>

      {/* HERO — split layout: headline left, story video right */}
      <section className="relative px-14 pb-10 pt-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <div className="flex flex-col gap-7">
            <div>{eyebrow}</div>
            <h1 className="font-display text-[80px] font-bold leading-[0.94] tracking-[-2.5px]">
              Every city
              <br />
              has <span className="grad-text">a friend</span>
              <br />
              you haven&apos;t met.
            </h1>
            {subhead}
          </div>
          {/* Video stretches to the left column's full height: top edge
              aligns with the eyebrow badge, bottom edge aligns with the
              SearchBar's "Find Locals" button. Aspect ratio is only used
              as a fallback on mobile when the grid collapses. */}
          <HeroStoryVideo
            src="/video/story-loop.mp4"
            className="aspect-[4/5] w-full lg:aspect-auto lg:h-full"
          />
        </div>
      </section>


      {/* Stories strip — only renders if there are unexpired stories */}
      <StoriesRow />

      {/* Results — only render once all three filters are set */}
      {isReady && (
        <section className="px-14 pb-14 pt-6">
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

      <SiteFooter liveCount={locals.length} />
    </div>
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
