import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck, Search, MapPin } from "lucide-react";
import { auth } from "@/auth";
import { Logo } from "@/components/Logo";
import { getLocalById, listMeetingSpots } from "@/lib/queries";
import { CITIES, type CitySlug } from "@/lib/cities";

interface SpotsPageProps {
  params: Promise<{ localId: string }>;
  searchParams: Promise<{
    cat?: string;
    q?: string;
    hours?: string;
    when?: string;
    slot?: string;
  }>;
}

const CATS = [
  { id: "all", label: "All spots" },
  { id: "coffee", label: "Coffee" },
  { id: "hotel", label: "Hotel lobbies" },
  { id: "plaza", label: "Public squares" },
  { id: "museum", label: "Museum cafés" },
  { id: "restaurant", label: "Restaurants" },
] as const;

const CAT_COLOR: Record<string, string> = {
  coffee: "#0E7C42",
  hotel: "#8B6F47",
  plaza: "#7B6CD9",
  museum: "#C44545",
  book: "#2A4A8A",
  station: "#5B5B5B",
  restaurant: "#8B6F47",
};
const CAT_GLYPH: Record<string, string> = {
  coffee: "★",
  hotel: "◆",
  plaza: "●",
  museum: "◇",
  book: "▤",
  station: "⚏",
  restaurant: "◈",
};

// Faithful port of the prototype's MeetingSpotPicker — paper-style page used
// inside the booking flow. State (hours/when/slot) is preserved via URL so the
// user can round-trip back to /book/[localId] without losing form input.
export default async function SpotsPage({ params, searchParams }: SpotsPageProps) {
  const { localId } = await params;
  const sp = await searchParams;
  const cat = sp.cat ?? "all";
  const q = (sp.q ?? "").trim().toLowerCase();

  const session = await auth();
  if (!session?.user) {
    redirect(`/signin?from=${encodeURIComponent(`/book/${localId}/spots`)}`);
  }

  const local = await getLocalById(localId);
  if (!local) notFound();

  const cityName = CITIES.find((c) => c.slug === local.city)?.name ?? local.city;
  const localFirstName = (local.user.name ?? "Local").split(" ")[0];

  const allSpots = await listMeetingSpots(local.city as CitySlug);
  const filtered = allSpots.filter((s) => {
    if (cat !== "all" && s.kind !== cat) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.kind.toLowerCase().includes(q)
    );
  });

  // Build the round-trip URL back to /book/[localId] keeping booking form state
  const backToBook = (spotId?: string) => {
    const qs = new URLSearchParams();
    if (sp.hours) qs.set("hours", sp.hours);
    if (sp.when) qs.set("when", sp.when);
    if (sp.slot) qs.set("slot", sp.slot);
    if (spotId) qs.set("spot", spotId);
    return `/book/${localId}${qs.toString() ? `?${qs}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-paper-bg pb-32 text-ink">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-hair bg-paper-bg px-10 py-4 backdrop-blur">
        <Link
          href={backToBook()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hair-2 transition hover:bg-paper"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3 text-sm text-ink-dim">
          <Logo />
          <span className="h-3.5 w-px bg-hair-2" />
          <span className="font-mono text-xs">Pick a meeting spot</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 font-mono text-xs text-ink-dim">
          <ShieldCheck size={13} /> All spots are public, well-lit & vetted
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-10 py-12">
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-ink-muted">
          ● Step 1 of checkout
        </div>
        <h1 className="mt-2 font-display text-5xl font-semibold leading-tight tracking-tight">
          Where will you meet {localFirstName}?
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-dim">
          Pick a public, well-lit place for your first meetup.{" "}
          <b className="text-ink">The Starbucks Rule:</b> always meet in public for the
          first session — switch to private only after you both feel safe.
        </p>

        {/* Search bar */}
        <form className="mt-6 flex max-w-xl items-center gap-1 rounded-full border border-hair-2 bg-paper p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
          <input type="hidden" name="cat" value={cat} />
          {sp.hours && <input type="hidden" name="hours" value={sp.hours} />}
          {sp.when && <input type="hidden" name="when" value={sp.when} />}
          {sp.slot && <input type="hidden" name="slot" value={sp.slot} />}
          <div className="border-r border-hair px-5 py-2 text-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              City
            </div>
            <div className="mt-0.5 font-medium">
              {cityName}
              {local.neighborhood ? ` · ${local.neighborhood}` : ""}
            </div>
          </div>
          <div className="flex-1 px-5 py-2">
            <div className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Search
            </div>
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Spot name, neighborhood…"
              className="mt-0.5 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-semibold text-paper"
          >
            <Search size={14} /> Search
          </button>
        </form>

        {/* Category chips */}
        <div className="mt-7 flex flex-wrap gap-2">
          {CATS.map((c) => {
            const active = c.id === cat;
            const url = new URLSearchParams();
            url.set("cat", c.id);
            if (sp.q) url.set("q", sp.q);
            if (sp.hours) url.set("hours", sp.hours);
            if (sp.when) url.set("when", sp.when);
            if (sp.slot) url.set("slot", sp.slot);
            return (
              <Link
                key={c.id}
                href={`/book/${local.id}/spots?${url.toString()}`}
                className={
                  active
                    ? "rounded-full border border-ink bg-ink px-4 py-2.5 text-sm font-medium text-paper"
                    : "rounded-full border border-hair-2 px-4 py-2.5 text-sm font-medium transition hover:bg-paper"
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 font-mono text-sm text-ink-dim">
          {filtered.length} {filtered.length === 1 ? "spot" : "spots"} in {cityName}
          {" · "}sorted by walk distance from {localFirstName}
        </div>

        {/* Result grid */}
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={backToBook(s.id)}
              className="group flex flex-col overflow-hidden rounded-2xl border border-hair bg-paper transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
            >
              <div
                className="relative flex h-40 items-center justify-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${CAT_COLOR[s.kind]} 0%, ${CAT_COLOR[s.kind]}aa 100%)`,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,0.04) 14px 28px)",
                  }}
                />
                <div className="font-display text-6xl font-bold text-white/35">
                  {CAT_GLYPH[s.kind]}
                </div>
                <div className="absolute left-3 top-3 flex gap-1.5">
                  {s.popular && (
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
                      Popular
                    </span>
                  )}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-mono text-[11px] capitalize text-white backdrop-blur">
                  {s.kind}
                </div>
              </div>
              <div className="space-y-2 p-5">
                <div className="font-display text-lg font-semibold leading-tight">
                  {s.name}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-ink-dim">
                  <MapPin size={13} /> {s.area} · {s.hours}
                </div>
                {s.safety.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {s.safety.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-hair-2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-dim"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-hair-2 bg-paper px-6 py-12 text-center text-sm text-ink-dim md:col-span-2">
              No spots match. Try a different category or clear your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
