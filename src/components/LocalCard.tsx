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
      className="group relative flex flex-col items-center rounded-2xl border border-line bg-surface px-4 pb-3 pt-5 text-center transition hover:border-coral/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
    >
      {/* Top-right Founding badge — absolute so it doesn't take vertical space
          when absent. */}
      {local.isFounding && (
        <span
          className="absolute right-3 top-3 inline-flex items-center rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-coral"
          title="Founding 100 local — keeps 90% of every booking"
        >
          ★ Founding
        </span>
      )}

      {/* Circular avatar — 96px (was 128px) for the slimmer card. */}
      <div className="relative h-24 w-24 shrink-0">
        {photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            alt={name}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-line-2 ring-offset-2 ring-offset-surface"
            style={{ objectPosition: "center top" }}
          />
        ) : (
          <div
            aria-label={name}
            className="grad-sunset flex h-24 w-24 items-center justify-center rounded-full font-display text-2xl font-semibold text-white ring-2 ring-line-2 ring-offset-2 ring-offset-surface"
          >
            {initials}
          </div>
        )}
        {local.idVerified && (
          <span
            className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-good text-[10px] text-white ring-2 ring-surface"
            title="ID verified"
          >
            ✓
          </span>
        )}
      </div>

      {/* Name + location — tighter block, no extra mt below location so the
          tagline sits closer. */}
      <div className="mt-3">
        <div className="font-display text-lg font-semibold leading-tight tracking-tight text-text">
          {name}
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-text-dim">
          <MapPin size={11} />
          {local.neighborhood ? `${local.neighborhood}, ${cityName}` : cityName}
        </div>
      </div>

      {/* Tagline — 2-line clamp; min-h keeps a 1-line card the same height as
          a 2-line card so the stat row aligns across the row. */}
      <p className="mt-2 line-clamp-2 min-h-[34px] text-[13px] leading-snug text-text-dim">
        {local.tagline}
      </p>

      {/* Stat row — 3 cells. Values are coral-tinted (the brand "live" color)
          so they pop against muted labels and the rest of the card. */}
      <div className="mt-3 grid w-full grid-cols-3 divide-x divide-line-2 rounded-xl border border-line-2 bg-bg-2/60 py-2">
        <Stat
          value={
            typeof local.rating === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Star size={10} className="fill-coral text-coral" />
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
    <div className="flex flex-col items-center justify-center px-1">
      <div className="font-display text-[13px] font-semibold leading-tight text-coral">
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
