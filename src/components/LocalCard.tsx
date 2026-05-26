import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { LocalProfile, User } from "@prisma/client";
import { CITIES, RESIDENCY } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";

type LocalWithUser = LocalProfile & {
  user: Pick<User, "id" | "name" | "image">;
  // aggregate review stats — joined separately, optional
  rating?: number | null;
  reviewCount?: number;
};

// Airbnb host-card layout — centered circular avatar, big name, location,
// short tagline, divided stat row at bottom. Templated so 100s of cards
// look identical regardless of photo aspect ratio or who uploaded them.
//
// Required to look consistent across cards:
//   • Photo cropped to a CIRCLE with object-position: top — always shows the
//     face (portrait shots put it in the upper third).
//   • Fixed avatar size (128px) so a wider/taller photo doesn't stretch the
//     card.
//   • Fixed body min-height so cards align in rows even when one local has
//     a 2-line tagline and another has 1.
//   • Stat row is always 3 cells (rating / years / rate) — even when there
//     are zero reviews we show "new" so the layout doesn't collapse.
export function LocalCard({
  local,
  whenParam,
}: {
  local: LocalWithUser;
  /** Optional ISO date that round-trips into the booking form */
  whenParam?: string;
}) {
  const cityName = CITIES.find((c) => c.slug === local.city)?.name ?? local.city;
  const name = local.user.name ?? "Local";
  const photoSrc = local.photoUrl ?? local.user.image ?? null;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

  const qs = new URLSearchParams();
  if (whenParam) qs.set("when", whenParam);
  const href = qs.toString()
    ? `/local/${local.id}?${qs.toString()}`
    : `/local/${local.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center rounded-3xl border border-line bg-surface px-6 pb-5 pt-8 text-center transition hover:border-coral/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
    >
      {/* Top-right Founding badge — only shown when applicable, doesn't
          take vertical space when absent (absolute positioning). */}
      {local.isFounding && (
        <span
          className="absolute right-4 top-4 inline-flex items-center rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-coral"
          title="Founding 100 local — keeps 90% of every booking"
        >
          ★ Founding
        </span>
      )}

      {/* Circular avatar — 128px fixed for grid consistency. object-position
          top so faces stay framed; falls back to gradient + initials when
          the local has no photo. */}
      <div className="relative h-32 w-32 shrink-0">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt={name}
            className="h-32 w-32 rounded-full object-cover ring-2 ring-line-2 ring-offset-2 ring-offset-surface"
            style={{ objectPosition: "center top" }}
          />
        ) : (
          <div
            aria-label={name}
            className="grad-sunset flex h-32 w-32 items-center justify-center rounded-full font-display text-3xl font-semibold text-white ring-2 ring-line-2 ring-offset-2 ring-offset-surface"
          >
            {initials}
          </div>
        )}
        {local.idVerified && (
          <span
            className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-good text-white ring-2 ring-surface"
            title="ID verified"
          >
            ✓
          </span>
        )}
      </div>

      {/* Name + location. Fixed min-height on the wrapper keeps cards aligned
          regardless of name length. */}
      <div className="mt-5 min-h-[68px]">
        <div className="font-display text-xl font-semibold leading-tight tracking-tight text-text">
          {name}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1 text-sm text-text-dim">
          <MapPin size={12} />
          {local.neighborhood ? `${local.neighborhood}, ${cityName}` : cityName}
        </div>
      </div>

      {/* Tagline — 2-line clamp so card heights don't drift. */}
      <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-snug text-text-dim">
        {local.tagline}
      </p>

      {/* Stat row — always 3 cells (rating / yrs in city / rate). When the
          local has no reviews yet we render "new" so the grid stays uniform. */}
      <div className="mt-5 grid w-full grid-cols-3 divide-x divide-line-2 rounded-2xl border border-line-2 bg-bg-2/60 py-2.5">
        <Stat
          value={
            typeof local.rating === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Star size={11} className="fill-amber text-amber" />
                {local.rating.toFixed(1)}
              </span>
            ) : (
              "new"
            )
          }
          label="rating"
        />
        <Stat
          value={`${local.yearsInCity}y`}
          label={RESIDENCY[local.residency].short.toLowerCase()}
        />
        <Stat
          value={
            <>
              {formatPrice(local.ratePerHour)}
              <span className="text-text-dim">/hr</span>
            </>
          }
          label="rate"
        />
      </div>
    </Link>
  );
}

function Stat({
  value,
  label,
}: {
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      <div className="font-display text-sm font-semibold leading-tight text-text">
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
