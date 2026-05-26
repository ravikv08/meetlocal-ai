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
      className="group relative flex flex-col items-center rounded-2xl border border-line bg-surface px-3 pb-2.5 pt-4 text-center transition hover:border-coral/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
    >
      {/* Top-right Founding badge — absolute so it doesn't take vertical space
          when absent. */}
      {local.isFounding && (
        <span
          className="absolute right-2 top-2 inline-flex items-center rounded-full bg-coral/15 px-1.5 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-wider text-coral"
          title="Founding 100 local — keeps 90% of every booking"
        >
          ★ Founding
        </span>
      )}

      {/* Circular avatar — 96px (bigger so the face reads at any grid size).
          The narrower 4-5-up grid means the avatar still doesn't dominate;
          a 96px photo in a ~200px-wide card is the Airbnb / LinkedIn ratio. */}
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
            className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-good text-[9px] text-white ring-2 ring-surface"
            title="ID verified"
          >
            ✓
          </span>
        )}
      </div>

      {/* Name + location — direct child of card, tight rhythm. No tagline
          block now: bio was repetitive of what the local's profile page
          shows. Tighter cards = more locals visible per scroll. */}
      <div className="mt-2.5">
        <div className="font-display text-base font-semibold leading-tight tracking-tight text-text">
          {name}
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-text-dim">
          <MapPin size={10} />
          {local.neighborhood ? `${local.neighborhood}, ${cityName}` : cityName}
        </div>
      </div>

      {/* Stat row — 3 cells. Values are coral-tinted (the brand "live" color)
          so they pop against muted labels. mt-2 sits closer to the location
          line now that the tagline doesn't separate them. */}
      <div className="mt-2 grid w-full grid-cols-3 divide-x divide-line-2 rounded-lg border border-line-2 bg-bg-2/60 py-1.5">
        <Stat
          value={
            typeof local.rating === "number" ? (
              <span className="inline-flex items-center gap-1">
                <Star size={9} className="fill-coral text-coral" />
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
          value={`${formatPrice(local.ratePerHour)}/hr`}
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
      <div className="font-display text-[12px] font-semibold leading-tight text-coral">
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}
