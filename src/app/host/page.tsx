import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Star,
  MapPin,
  Wallet,
  Clock,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { ComingSoon } from "@/components/ComingSoon";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";
import { acceptBooking, declineBooking } from "@/lib/booking-actions";

export default async function HostPage() {
  const session = await auth();

  // Not signed in → pitch
  if (!session?.user?.id) {
    return <PendingHostPlaceholder eyebrow="Host · Earn from your city" />;
  }

  const profile = await prisma.localProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { name: true, image: true } } },
  });

  // No profile yet → pitch
  if (!profile) {
    return <PendingHostPlaceholder eyebrow="Host · Earn from your city" />;
  }

  // Pending review
  if (profile.status === "pending") {
    return (
      <ComingSoon
        eyebrow="Host · Application under review"
        title="You're in the queue."
        emphasis="We'll be in touch within 24h."
        description="The founder reads every application personally. Once you're approved, this page becomes your earnings + incoming-requests dashboard."
        icon={ShieldCheck}
        features={[
          {
            title: "What happens next",
            body: "We email you once your profile is live. Travelers can book you immediately after.",
          },
          {
            title: "Rate & availability",
            body: "Edit anything you submitted by emailing founders@meetlocal.ai for now.",
          },
          {
            title: "Safety stays first",
            body: "Even pending, the same Starbucks Rule and ID verification apply.",
          },
        ]}
      />
    );
  }

  // Active local — load real dashboard data
  const me = session.user.id;
  const cityName = CITIES.find((c) => c.slug === profile.city)?.name ?? profile.city;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);

  const [incoming, upcoming, earningsRows, weekCompleted, lastWeekCompleted] =
    await Promise.all([
      prisma.booking.findMany({
        where: { local: { userId: me }, status: "requested" },
        include: { traveler: { select: { name: true, image: true, email: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.findMany({
        where: {
          local: { userId: me },
          status: { in: ["confirmed", "in_progress"] },
        },
        include: {
          traveler: { select: { name: true } },
          meetingSpot: true,
        },
        orderBy: { scheduledFor: "asc" },
        take: 5,
      }),
      // For sparkline: completed bookings per day for last 7 days
      prisma.booking.findMany({
        where: {
          local: { userId: me },
          status: "completed",
          completedAt: { gte: sevenDaysAgo },
        },
        select: { totalAmount: true, completedAt: true },
      }),
      prisma.booking.aggregate({
        where: {
          local: { userId: me },
          status: "completed",
          completedAt: { gte: sevenDaysAgo },
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.booking.aggregate({
        where: {
          local: { userId: me },
          status: "completed",
          completedAt: {
            gte: new Date(Date.now() - 14 * 86400_000),
            lt: sevenDaysAgo,
          },
        },
        _sum: { totalAmount: true },
      }),
    ]);

  // Local keeps 78% per playbook (we take 22%)
  const localCut = (cents: number) => Math.round(cents * 0.78);
  const thisWeekEarnings = localCut(weekCompleted._sum.totalAmount ?? 0);
  const lastWeekEarnings = localCut(lastWeekCompleted._sum.totalAmount ?? 0);
  const wowDelta =
    lastWeekEarnings > 0
      ? Math.round(((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
      : null;
  const dollars = (thisWeekEarnings / 100).toFixed(2);
  const [dollarsInt, dollarsFrac] = dollars.split(".");

  // Build a 7-bucket sparkline of cents-per-day
  const buckets = Array.from({ length: 7 }).map(() => 0);
  for (const r of earningsRows) {
    if (!r.completedAt) continue;
    const days = Math.floor(
      (Date.now() - new Date(r.completedAt).getTime()) / 86400_000,
    );
    if (days >= 0 && days < 7) buckets[6 - days] += r.totalAmount;
  }
  const sparkPath = buildSparklinePath(buckets);

  const localFirst = (profile.user.name ?? "Local").split(" ")[0];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg text-text">
      {/* radial accents (matches prototype) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(800px 500px at 80% 0%, rgba(255,106,61,0.15), transparent 60%), radial-gradient(800px 500px at 0% 80%, rgba(255,46,120,0.10), transparent 60%)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3.5 border-b border-line px-10 py-5">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-surface"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Logo />
          <span className="h-3.5 w-px bg-line-2" />
          <span className="font-mono text-xs uppercase tracking-wider text-text-dim">
            Local dashboard · {localFirst}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 font-mono text-xs text-text-dim">
          <span className="h-2 w-2 rounded-full bg-good" />
          Available
        </div>
      </div>

      {/* Two-column body */}
      <div className="relative grid flex-1 lg:grid-cols-[1fr_1fr]">
        {/* LEFT — Incoming */}
        <section className="border-r border-line px-12 py-12">
          {incoming.length === 0 ? (
            <EmptyIncoming localFirst={localFirst} />
          ) : (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-coral">
                <span className="animate-ml-pulse h-1.5 w-1.5 rounded-full bg-coral" />
                Incoming · {incoming.length}{" "}
                {incoming.length === 1 ? "request" : "requests"}
              </div>
              <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight">
                {incoming.length === 1 ? "A traveler" : `${incoming.length} travelers`}
                <br />
                {incoming.length === 1 ? "wants to meet" : "want to meet"}
                <br />
                <span className="grad-text">in {cityName}.</span>
              </h1>

              <div className="mt-9 space-y-4">
                {incoming.map((b) => (
                  <article
                    key={b.id}
                    className="rounded-2xl border border-line-2 bg-surface p-5"
                  >
                    <div className="flex items-center gap-3.5">
                      <Avatar
                        name={b.traveler.name ?? "Traveler"}
                        size={48}
                        imageUrl={b.traveler.image}
                        ring
                      />
                      <div className="flex-1">
                        <div className="font-display text-base font-semibold">
                          {b.traveler.name ?? b.traveler.email ?? "Traveler"}
                        </div>
                        <div className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
                          {b.scheduledFor
                            ? new Date(b.scheduledFor).toLocaleString("en-US", {
                                weekday: "short",
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : "Time TBD"}{" "}
                          · {b.hours}h
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-text-dim">
                        <Star size={13} className="fill-amber text-amber" />
                        <span className="font-medium text-text">new</span>
                      </div>
                    </div>

                    {b.travelerNote && (
                      <div className="mt-4 rounded-xl bg-surface-2 p-3.5 text-sm leading-relaxed">
                        &ldquo;{b.travelerNote}&rdquo;
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Tag icon={<Clock size={12} />}>
                        {b.scheduledFor
                          ? new Date(b.scheduledFor).toLocaleDateString("en-US", {
                              weekday: "short",
                            })
                          : "TBD"}{" "}
                        · {b.hours}h
                      </Tag>
                      <Tag icon={<Wallet size={12} />}>
                        {formatPrice(b.totalAmount)} ·{" "}
                        you keep {formatPrice(localCut(b.totalAmount))}
                      </Tag>
                    </div>

                    <div className="mt-5 flex gap-2.5">
                      <form action={acceptBooking} className="flex-[2]">
                        <input type="hidden" name="bookingId" value={b.id} />
                        <button
                          type="submit"
                          className="grad-sunset flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,106,61,0.27)]"
                        >
                          Accept · lock this slot
                        </button>
                      </form>
                      <Link
                        href={`/messages/${b.id}`}
                        className="flex flex-1 items-center justify-center rounded-xl border border-line-2 px-4 py-3.5 text-sm font-medium"
                      >
                        Counter
                      </Link>
                      <form action={declineBooking}>
                        <input type="hidden" name="bookingId" value={b.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-line-2 px-4 py-3.5 text-sm text-text-dim transition hover:text-text"
                        >
                          Pass
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {/* RIGHT — Earnings + queue */}
        <section className="bg-bg-2 px-12 py-12">
          <div className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
            This week
          </div>
          <div className="mt-2 font-display text-7xl font-bold leading-none tracking-tight">
            $<span className="grad-text">{dollarsInt}</span>
            <span className="text-3xl font-medium text-text-dim">
              .{dollarsFrac}
            </span>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-text-dim">
            {wowDelta !== null && (
              <span>
                <span className={wowDelta >= 0 ? "text-good" : "text-magenta"}>
                  {wowDelta >= 0 ? "↑" : "↓"} {Math.abs(wowDelta)}%
                </span>{" "}
                vs last wk
              </span>
            )}
            <span>·</span>
            <span>
              {weekCompleted._count} {weekCompleted._count === 1 ? "meetup" : "meetups"}
            </span>
          </div>

          {sparkPath && (
            <svg viewBox="0 0 300 60" className="mt-5 h-15 w-full">
              <defs>
                <linearGradient id="spark" x1="0" x2="1">
                  <stop offset="0" stopColor="#FFB84D" />
                  <stop offset=".5" stopColor="#FF6A3D" />
                  <stop offset="1" stopColor="#FF2E78" />
                </linearGradient>
              </defs>
              <path
                d={sparkPath.line}
                stroke="url(#spark)"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
              <path d={sparkPath.fill} fill="url(#spark)" opacity={0.1} />
            </svg>
          )}

          {/* Upcoming */}
          <div className="mt-9">
            <div className="font-mono text-[11px] uppercase tracking-wider text-text-dim">
              Upcoming this week
            </div>
            {upcoming.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-line-2 bg-surface px-5 py-8 text-center text-sm text-text-dim">
                Nothing on the calendar yet — accept your first request to fill it.
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                {upcoming.map((b) => (
                  <Link
                    key={b.id}
                    href={`/messages/${b.id}`}
                    className="flex items-center gap-3.5 rounded-xl border border-line bg-surface px-4 py-3.5 transition hover:border-line-2"
                  >
                    <div className="w-32 shrink-0 font-mono text-[11px] uppercase tracking-wider text-text-dim">
                      {b.scheduledFor
                        ? new Date(b.scheduledFor).toLocaleString("en-US", {
                            weekday: "short",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "TBD"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {b.traveler.name ?? "Traveler"}
                      </div>
                      <div className="truncate text-xs text-text-dim">
                        {b.meetingSpot?.name ?? "Spot TBD"}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-semibold">
                      {formatPrice(localCut(b.totalAmount))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Auto-accept teaser (UI only for v1) */}
          <div className="mt-7 flex items-center gap-3.5 rounded-xl border border-line bg-surface p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-amber">
              <Zap size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Auto-accept (coming soon)</div>
              <div className="mt-1 text-xs text-text-dim">
                Enable to instantly confirm bookings from repeat travelers.
              </div>
            </div>
            <div className="grad-sunset relative h-5 w-9 rounded-full opacity-50">
              <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
            </div>
          </div>

          {/* Public profile + earnings reference */}
          <div className="mt-7 grid gap-2 text-sm text-text-dim">
            <Link
              href={`/local/${profile.id}`}
              className="inline-flex items-center gap-2 transition hover:text-text"
            >
              <MapPin size={13} /> View your public profile
            </Link>
            <span className="inline-flex items-center gap-2">
              <Wallet size={13} /> {formatPrice(profile.ratePerHour)}/hr · you keep 78%
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyIncoming({ localFirst }: { localFirst: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-text-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-good" /> Inbox empty
      </div>
      <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight">
        All caught up,
        <br />
        <span className="grad-text">{localFirst}.</span>
      </h1>
      <p className="mt-5 max-w-md text-text-dim">
        No incoming requests right now. We&rsquo;ll ping you the moment a traveler
        wants to meet — you&rsquo;ll have 14 minutes to lock the slot.
      </p>
      <div className="mt-7 grid gap-3">
        <Tip>
          <strong className="text-text">Add weekend availability</strong> — most
          requests land Thursday night.
        </Tip>
        <Tip>
          <strong className="text-text">Photograph one signature spot</strong> —
          locals with a hero photo accept 3× more requests.
        </Tip>
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 text-sm text-text-dim">
      {children}
    </div>
  );
}

function Tag({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs">
      {icon}
      {children}
    </span>
  );
}

function PendingHostPlaceholder({ eyebrow }: { eyebrow: string }) {
  return (
    <ComingSoon
      eyebrow={eyebrow}
      title="A dashboard for"
      emphasis="locals who host travelers."
      description="Once you're an approved local, this becomes your home base: incoming requests with a 14-minute accept window, weekly earnings, upcoming meetups, and the panic button at all times."
      icon={ShieldCheck}
      features={[
        {
          title: "Live arrivals",
          body: "Travelers landing in your city in real time. Pre-pitch in 15 seconds.",
        },
        {
          title: "Earnings dashboard",
          body: "Weekly payout schedule, sparkline chart, monthly totals. No spreadsheet needed.",
        },
        {
          title: "Auto-accept",
          body: "Toggle on for trusted travelers. We confirm slots while you sleep.",
        },
      ]}
      primaryHref="/become-a-local"
      primaryLabel="Apply to be a local"
    />
  );
}

// Build a smoothed spark line from a 7-day cents bucket array.
// Returns SVG path strings for the line and the filled area below.
function buildSparklinePath(buckets: number[]) {
  const max = Math.max(...buckets, 1);
  const w = 300;
  const h = 60;
  const step = w / (buckets.length - 1);
  const points = buckets.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * (h - 8) - 4; // 4px padding top/bottom
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const fill = `${line} L${w} ${h} L0 ${h} Z`;
  return { line, fill };
}
