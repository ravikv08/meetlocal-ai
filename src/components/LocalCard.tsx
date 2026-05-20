import Link from "next/link";
import { Star } from "lucide-react";
import type { LocalProfile, User } from "@prisma/client";
import { Avatar } from "@/components/Avatar";
import { CITIES, RESIDENCY } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";

type LocalWithUser = LocalProfile & {
  user: Pick<User, "id" | "name" | "image">;
  // aggregate review stats — joined separately, optional
  rating?: number | null;
  reviewCount?: number;
};

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
  const qs = new URLSearchParams();
  if (whenParam) qs.set("when", whenParam);
  const href = qs.toString()
    ? `/local/${local.id}?${qs.toString()}`
    : `/local/${local.id}`;
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-line-2"
    >
      {/* Photo / placeholder — square keeps cards compact at 3-4 across.
          background-position is biased toward the top (25% from top) because
          most portrait selfies put the face in the upper third — a pure
          50%/50% center crop chops the head and shows the chest. */}
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{
          background:
            local.photoUrl || local.user.image
              ? `center 25% / cover no-repeat url(${local.photoUrl ?? local.user.image})`
              : "var(--grad-sunset)",
        }}
      >
        {/* Top-left trust badges */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {local.idVerified && (
            <span className="rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white backdrop-blur">
              ID verified
            </span>
          )}
          <span className="rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white backdrop-blur">
            {RESIDENCY[local.residency].short} · {local.yearsInCity}y
          </span>
        </div>
        {!local.photoUrl && !local.user.image && (
          <div className="absolute bottom-2 left-2 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/80">
            {name} · {cityName}
          </div>
        )}
      </div>

      {/* Body — tight, Airbnb-card density */}
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Avatar name={name} size={18} imageUrl={local.user.image} />
              <div className="min-w-0">
                <div className="truncate font-display text-[13px] font-semibold leading-tight">
                  {name}
                </div>
                <div className="truncate font-mono text-[9px] uppercase tracking-wider text-text-muted">
                  {local.neighborhood ?? cityName}
                </div>
              </div>
            </div>
          </div>
          {typeof local.rating === "number" && (
            <div className="flex shrink-0 items-center gap-0.5 text-[11px]">
              <Star size={10} className="fill-amber text-amber" />
              <span className="font-medium">{local.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="line-clamp-1 text-[11px] text-text-dim">{local.tagline}</p>

        <div className="mt-auto flex items-baseline justify-between pt-1">
          <div>
            <span className="font-display text-sm font-semibold">
              {formatPrice(local.ratePerHour)}
            </span>
            <span className="ml-0.5 text-[10px] text-text-dim">/hr</span>
          </div>
          {local.tags.length > 0 && (
            <span className="truncate font-mono text-[9px] uppercase tracking-wider text-text-muted">
              {local.tags.slice(0, 1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
