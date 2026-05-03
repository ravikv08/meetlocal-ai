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
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:border-line-2"
    >
      {/* Photo / placeholder */}
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
        style={{
          background:
            local.photoUrl || local.user.image
              ? `center / cover no-repeat url(${local.photoUrl ?? local.user.image})`
              : "var(--grad-sunset)",
        }}
      >
        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {local.idVerified && (
            <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">
              ID verified
            </span>
          )}
          <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white backdrop-blur">
            {RESIDENCY[local.residency].short} · {local.yearsInCity}y
          </span>
        </div>
        {/* Bottom photo caption (when no real photo) */}
        {!local.photoUrl && !local.user.image && (
          <div className="absolute bottom-3 left-3 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/80">
            {name} · {cityName}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Avatar name={name} size={28} imageUrl={local.user.image} />
              <div className="min-w-0">
                <div className="truncate font-display text-base font-semibold leading-tight">
                  {name}
                </div>
                <div className="truncate font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {local.neighborhood ?? cityName}
                </div>
              </div>
            </div>
          </div>
          {typeof local.rating === "number" && (
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star size={13} className="fill-amber text-amber" />
              <span className="font-medium">{local.rating.toFixed(2)}</span>
              <span className="text-text-muted">({local.reviewCount ?? 0})</span>
            </div>
          )}
        </div>

        <p className="line-clamp-2 text-sm text-text-dim">{local.tagline}</p>

        <div className="flex flex-wrap gap-1.5">
          {local.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-line px-2 py-0.5 text-xs text-text-dim capitalize"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-baseline justify-between border-t border-line pt-3">
          <div>
            <span className="font-display text-lg font-semibold">
              {formatPrice(local.ratePerHour)}
            </span>
            <span className="ml-1 text-sm text-text-dim">/hr</span>
          </div>
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
            {local.languages.join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
