import Link from "next/link";
import { Heart, MessageCircle, Calendar, MapPin, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { CITIES, RESIDENCY } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";

// Vertical Instagram-style reels feed. Each reel = an active local rendered as
// a full-bleed gradient card with an overlay (avatar, name, tagline, vibes,
// rate). Tap the gradient CTA to jump straight into the booking flow.
//
// CSS scroll-snap gives the per-card "snap" feel on mobile + trackpad scroll.
export default async function ReelsPage() {
  const locals = await prisma.localProfile.findMany({
    where: { status: "active" },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { updatedAt: "desc" },
  });

  // Video backdrops — cycle through 3 placeholder reels for now. Each scroll-
  // snap section uses one as a muted, autoplaying, looping background so users
  // get the "feel" of the reels feed before locals have their own clips.
  // Fallback gradients ride behind the video for legibility while it loads.
  const videos = [
    { src: "/reels/reel-burrito.mp4",   palette: { from: "#FF6A3D", via: "#FF2E78", to: "#7C5CFF" } },
    { src: "/reels/reel-fisherman.mp4", palette: { from: "#FFB84D", via: "#FF6A3D", to: "#FF2E78" } },
    { src: "/reels/reel-traveler.mp4",  palette: { from: "#3BD4C4", via: "#7C5CFF", to: "#FF4DA6" } },
  ];

  if (locals.length === 0) {
    return <ReelsEmpty />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/85 px-6 py-4 backdrop-blur-xl">
        <div className="font-display text-lg font-bold tracking-tight">Reels</div>
        <Link href="/" className="font-mono text-xs text-text-dim transition hover:text-text">
          ← Discover
        </Link>
      </header>

      <main
        className="snap-y snap-mandatory overflow-y-auto"
        style={{ height: "calc(100vh - 65px)" }}
      >
        {locals.map((local, i) => {
          const v = videos[i % videos.length];
          const cityName =
            CITIES.find((c) => c.slug === local.city)?.name ?? local.city;
          const name = local.user.name ?? "Local";
          const residency = RESIDENCY[local.residency];
          return (
            <Reel
              key={local.id}
              localId={local.id}
              name={name}
              cityName={cityName}
              neighborhood={local.neighborhood ?? ""}
              tagline={local.tagline}
              tags={local.tags}
              ratePerHour={local.ratePerHour}
              residencyShort={residency.short}
              yearsInCity={local.yearsInCity}
              avatarUrl={local.user.image ?? local.photoUrl}
              videoSrc={v.src}
              palette={v.palette}
            />
          );
        })}
      </main>
    </div>
  );
}

function Reel({
  localId,
  name,
  cityName,
  neighborhood,
  tagline,
  tags,
  ratePerHour,
  residencyShort,
  yearsInCity,
  avatarUrl,
  videoSrc,
  palette,
}: {
  localId: string;
  name: string;
  cityName: string;
  neighborhood: string;
  tagline: string;
  tags: string[];
  ratePerHour: number;
  residencyShort: string;
  yearsInCity: number;
  avatarUrl: string | null;
  videoSrc: string;
  palette: { from: string; via: string; to: string };
}) {
  return (
    <section
      className="relative flex snap-start items-stretch justify-center overflow-hidden"
      style={{ height: "calc(100vh - 65px)" }}
    >
      {/* Gradient fallback — shows while video loads + sits behind it as a
          color floor in case the video fails to load. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(155deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
        }}
      />
      {/* Video backdrop — muted + playsInline so mobile browsers will autoplay.
          object-cover fills the section without distorting the 9:16 source. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Subtle texture overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(45deg, transparent 0 18px, rgba(0,0,0,0.06) 18px 36px)",
        }}
      />
      {/* Bottom darken for text legibility */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "linear-gradient(to top, rgba(14,11,8,0.85) 10%, transparent 100%)",
        }}
      />

      {/* Right-side action rail */}
      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-5 text-white">
        <ActionIcon icon={<Heart size={26} />} count="—" />
        <ActionIcon icon={<MessageCircle size={26} />} count="—" />
        <Link
          href={`/local/${localId}`}
          className="flex flex-col items-center gap-1"
        >
          <span className="grad-sunset flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(255,106,61,0.45)]">
            <Calendar size={22} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider">
            View
          </span>
        </Link>
      </div>

      {/* Bottom overlay — local info */}
      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-2xl px-6 pb-10 pr-20 text-white">
        <div className="flex items-center gap-3">
          <Avatar name={name} size={44} imageUrl={avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-display text-lg font-bold leading-tight">
              {name}
              <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                {residencyShort} · {yearsInCity}y
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <MapPin size={12} />
              {neighborhood ? `${neighborhood} · ` : ""}
              {cityName}
            </div>
          </div>
        </div>

        <h2 className="mt-4 font-display text-3xl font-bold leading-[1.05] tracking-tight">
          {tagline}
        </h2>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/30 bg-white/10 px-2.5 py-1 text-xs capitalize backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Link
            href={`/local/${localId}`}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.4)]"
          >
            <Calendar size={15} />
            Book {name.split(" ")[0]} · {formatPrice(ratePerHour)}/hr
          </Link>
          <div className="flex items-center gap-1 font-mono text-xs text-white/80">
            <Star size={12} className="fill-amber text-amber" /> 4.9
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionIcon({
  icon,
  count,
}: {
  icon: React.ReactNode;
  count: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 opacity-90">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
        {icon}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider">
        {count}
      </span>
    </div>
  );
}

function ReelsEmpty() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-10 text-center">
      <div className="grad-sunset flex h-14 w-14 items-center justify-center rounded-full text-white">
        <Heart size={24} />
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        No reels yet.
      </h1>
      <p className="max-w-sm text-text-dim">
        Once we have active locals across your cities, their stories show up
        here as a vertical feed.
      </p>
      <Link
        href="/"
        className="rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-bg"
      >
        Back to discover
      </Link>
    </div>
  );
}
