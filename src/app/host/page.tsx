import Link from "next/link";
import {
  ShieldCheck,
  Star,
  MapPin,
  Wallet,
  Clock,
  Zap,
  ArrowLeft,
  Banknote,
  AlertCircle,
  History,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { ComingSoon } from "@/components/ComingSoon";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";
import { acceptBooking, declineBooking } from "@/lib/booking-actions";
import { setHostAvailability } from "@/lib/local-actions";

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

  // Active or paused local — load real dashboard data. (Paused still sees the
  // dashboard so they can toggle back on and watch their stats.)
  const me = session.user.id;
  const cityName = CITIES.find((c) => c.slug === profile.city)?.name ?? profile.city;
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400_000);
  const isPaused = profile.status === "paused";

  const [
    incoming,
    upcoming,
    allCompleted,
    recentPayouts,
    bookingHistory,
    myReviews,
    ratingAgg,
  ] = await Promise.all([
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
    // All completed bookings — we slice by window in code so we can compute
    // takes from each booking's snapshot (ratePerHour * hours - platformFee).
    // Aggregates can't express that math because subtotal isn't a stored column.
    prisma.booking.findMany({
      where: { local: { userId: me }, status: "completed" },
      select: {
        ratePerHour: true,
        hours: true,
        platformFee: true,
        completedAt: true,
      },
      orderBy: { completedAt: "desc" },
    }),
    // Most recent 10 completed bookings — surfaced as "payouts" until Stripe
    // Connect onboarding lands. Each completed booking = one manual payout.
    prisma.booking.findMany({
      where: { local: { userId: me }, status: "completed" },
      include: { traveler: { select: { name: true, image: true } } },
      orderBy: { completedAt: "desc" },
      take: 10,
    }),
    // Full booking history — past meetups in any terminal state.
    prisma.booking.findMany({
      where: {
        local: { userId: me },
        status: { in: ["completed", "cancelled", "disputed"] },
      },
      include: {
        traveler: { select: { name: true, image: true } },
        meetingSpot: true,
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    // Visible reviews where this local is the subject. Two-way reveal logic
    // lives in the reviews API; here we just respect visible=true.
    prisma.review.findMany({
      where: { subjectId: me, visible: true },
      include: { author: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.aggregate({
      where: { subjectId: me, visible: true },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  // Founding 100 locals keep 90% of subtotal; standard locals keep 78%.
  // Per-booking displays use the snapshot from b.platformFee so historical
  // earnings stay correct even if the local later gets bumped to/from Founding:
  //   take = (b.ratePerHour * b.hours) - b.platformFee
  // The metric cards (lifetime / 30d / this week) sum those takes manually
  // since Prisma aggregate can't express the subtotal-minus-fee math.
  const cutPct = profile.isFounding ? 90 : 78;
  const takeFor = (b: {
    ratePerHour: number;
    hours: number;
    platformFee: number;
  }) => Math.round(b.ratePerHour * b.hours) - b.platformFee;
  const sumTakes = (bs: { ratePerHour: number; hours: number; platformFee: number }[]) =>
    bs.reduce((n, b) => n + takeFor(b), 0);
  // Window slices from the single allCompleted query — avoids 4 round-trips
  // and lets us sum takes (subtotal - platformFee) per booking honestly.
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const lastWeekStart = new Date(Date.now() - 14 * 86400_000);
  const thisWeekRows = allCompleted.filter(
    (b) => b.completedAt && b.completedAt >= sevenDaysAgo,
  );
  const lastWeekRows = allCompleted.filter(
    (b) =>
      b.completedAt &&
      b.completedAt >= lastWeekStart &&
      b.completedAt < sevenDaysAgo,
  );
  const last30Rows = allCompleted.filter(
    (b) => b.completedAt && b.completedAt >= thirtyDaysAgo,
  );

  const thisWeekEarnings = sumTakes(thisWeekRows);
  const lastWeekEarnings = sumTakes(lastWeekRows);
  const lifetimeEarnings = sumTakes(allCompleted);
  const last30Earnings = sumTakes(last30Rows);
  const lifetimeCount = allCompleted.length;
  const last30Count = last30Rows.length;
  const thisWeekCount = thisWeekRows.length;
  const avgRating = ratingAgg._avg.rating ?? null;
  const reviewCount = ratingAgg._count ?? 0;
  const wowDelta =
    lastWeekEarnings > 0
      ? Math.round(((thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100)
      : null;
  const dollars = (thisWeekEarnings / 100).toFixed(2);
  const [dollarsInt, dollarsFrac] = dollars.split(".");

  // Build a 7-bucket sparkline of take-per-day for the past week.
  const buckets = Array.from({ length: 7 }).map(() => 0);
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const nowMs = Date.now();
  for (const r of thisWeekRows) {
    if (!r.completedAt) continue;
    const days = Math.floor(
      (nowMs - new Date(r.completedAt).getTime()) / 86400_000,
    );
    if (days >= 0 && days < 7) buckets[6 - days] += takeFor(r);
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
        {/* Availability toggle — a single-button form per state. Submitting the
            opposite state flips it; the server action guards against pending/
            removed transitions. Tiny enough to live next to the logo. */}
        <form
          action={setHostAvailability}
          className="flex items-center gap-1.5 font-mono text-xs"
        >
          <input
            type="hidden"
            name="status"
            value={isPaused ? "active" : "paused"}
          />
          <button
            type="submit"
            title={
              isPaused
                ? "You're paused. Click to start taking requests again."
                : "Click to pause new requests. Existing bookings still apply."
            }
            className={
              "flex items-center gap-2 rounded-full border px-3 py-1.5 transition " +
              (isPaused
                ? "border-amber/40 text-amber hover:border-amber"
                : "border-line-2 text-text-dim hover:border-line")
            }
          >
            <span
              className={
                "h-2 w-2 rounded-full " + (isPaused ? "bg-amber" : "bg-good")
              }
            />
            {isPaused ? "Paused — tap to go live" : "Available — tap to pause"}
          </button>
        </form>
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
                        you keep {formatPrice(takeFor(b))}
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
              {thisWeekCount} {thisWeekCount === 1 ? "meetup" : "meetups"}
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
                      {formatPrice(takeFor(b))}
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
              <Wallet size={13} /> {formatPrice(profile.ratePerHour)}/hr · you keep {cutPct}%
              {profile.isFounding && (
                <span className="ml-1.5 rounded-full bg-coral/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-coral">
                  Founding
                </span>
              )}
            </span>
          </div>
        </section>
      </div>

      {/* ───────────────────────── BELOW THE FOLD ──────────────────────────
          Earnings/payouts → reviews → full booking history. Scrolls under the
          hero so the "incoming requests + this-week" remain the primary view. */}
      <div className="relative space-y-12 px-12 py-12">
        {/* Earnings & payouts */}
        <section>
          <SectionHeader
            eyebrow="Earnings"
            title="Money in the door"
            sub="78% of every booking is yours. Lifetime, last 30 days, and the most recent meetups paid out."
          />

          {!profile.payoutsEnabled && (
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber/40 bg-amber/5 px-5 py-4 text-sm">
              <AlertCircle size={16} className="shrink-0 text-amber" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-text">Manual payouts for v1</div>
                <div className="text-text-dim">
                  Stripe Connect onboarding is in the works. Until it ships, we
                  pay out weekly via Venmo / Zelle — email{" "}
                  <a
                    href="mailto:founders@meetlocal.ai"
                    className="text-coral hover:underline"
                  >
                    founders@meetlocal.ai
                  </a>{" "}
                  with your preferred handle.
                </div>
              </div>
              <a
                href="mailto:founders@meetlocal.ai?subject=Payout%20handle"
                className="grad-sunset rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)]"
              >
                Set up payouts
              </a>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="Lifetime earnings"
              value={formatPrice(lifetimeEarnings)}
              sub={`${lifetimeCount} meetup${lifetimeCount === 1 ? "" : "s"} completed`}
              icon={<Wallet size={14} />}
            />
            <MetricCard
              label="Last 30 days"
              value={formatPrice(last30Earnings)}
              sub={`${last30Count} meetup${last30Count === 1 ? "" : "s"}`}
              icon={<Banknote size={14} />}
            />
            <MetricCard
              label="This week"
              value={formatPrice(thisWeekEarnings)}
              sub={
                wowDelta !== null
                  ? `${wowDelta >= 0 ? "↑" : "↓"} ${Math.abs(wowDelta)}% vs last wk`
                  : "First week with earnings"
              }
              icon={<Zap size={14} />}
            />
          </div>

          {/* Recent payouts list. Until Stripe Connect lands, "payout" ≈
              "completed booking" — the 78% slice is what hits your account. */}
          <div className="mt-7">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-base font-semibold">
                Recent payouts
              </h3>
              <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                Last {recentPayouts.length}
              </span>
            </div>
            {recentPayouts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-10 text-center text-sm text-text-dim">
                No completed meetups yet — your first one shows up here.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <table className="w-full text-sm">
                  <thead className="border-b border-line text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                    <tr>
                      <th className="px-5 py-3 font-normal">Date</th>
                      <th className="px-5 py-3 font-normal">Traveler</th>
                      <th className="px-5 py-3 font-normal">Hours</th>
                      <th className="px-5 py-3 text-right font-normal">Gross</th>
                      <th className="px-5 py-3 text-right font-normal">
                        You keep
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayouts.map((b) => (
                      <tr
                        key={b.id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-5 py-3 align-middle text-text-dim">
                          {b.completedAt?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }) ?? "—"}
                        </td>
                        <td className="px-5 py-3 align-middle">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={b.traveler.name ?? "?"}
                              size={26}
                              imageUrl={b.traveler.image}
                            />
                            <span>{b.traveler.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 align-middle text-text-dim">
                          {b.hours}h
                        </td>
                        <td className="px-5 py-3 text-right align-middle font-mono text-text-dim">
                          {formatPrice(b.totalAmount)}
                        </td>
                        <td className="px-5 py-3 text-right align-middle font-mono font-semibold">
                          {formatPrice(takeFor(b))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Reviews from travelers */}
        <section>
          <SectionHeader
            eyebrow="Ratings"
            title={
              avgRating !== null
                ? `${avgRating.toFixed(1)} from ${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                : "No reviews yet"
            }
            sub="Reviews appear after both you and the traveler submit — until then, neither side sees the other's words."
          />

          {myReviews.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-10 text-center text-sm text-text-dim">
              Nothing public yet. Complete a meetup and ask your traveler to
              leave a review — yours unlocks theirs.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myReviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-line bg-surface p-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={r.author.name ?? "Traveler"}
                      size={36}
                      imageUrl={r.author.image}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {r.author.name ?? "Traveler"}
                      </div>
                      <div className="font-mono text-[11px] text-text-muted">
                        {r.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < r.rating ? "fill-amber" : "opacity-25"}
                        />
                      ))}
                    </div>
                  </div>
                  {r.body && (
                    <p className="mt-3 text-sm leading-relaxed text-text-dim">
                      &ldquo;{r.body}&rdquo;
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Full booking history (includes cancelled/disputed) */}
        <section>
          <SectionHeader
            eyebrow="History"
            title="Past bookings"
            sub="Every meetup that's left the request stage — completed, cancelled, or disputed."
            icon={<History size={14} />}
          />

          {bookingHistory.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-10 text-center text-sm text-text-dim">
              No history yet. Accepted requests will land here once they
              complete (or fall through).
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-5 py-3 font-normal">When</th>
                    <th className="px-5 py-3 font-normal">Traveler</th>
                    <th className="px-5 py-3 font-normal">Spot</th>
                    <th className="px-5 py-3 font-normal">Status</th>
                    <th className="px-5 py-3 text-right font-normal">Payout</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-5 py-3 align-middle text-text-dim">
                        {(b.completedAt ?? b.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={b.traveler.name ?? "?"}
                            size={26}
                            imageUrl={b.traveler.image}
                          />
                          <span>{b.traveler.name ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 align-middle text-text-dim">
                        {b.meetingSpot?.name ?? "—"}
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <HistoryStatusPill status={b.status} />
                      </td>
                      <td className="px-5 py-3 text-right align-middle font-mono">
                        {b.status === "completed"
                          ? formatPrice(takeFor(b))
                          : "—"}
                      </td>
                      <td className="px-5 py-3 align-middle text-right">
                        <Link
                          href={`/messages/${b.id}`}
                          className="text-text-dim transition hover:text-text"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  icon,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {icon}
        {eyebrow}
      </div>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
        {title}
      </h2>
      {sub && (
        <p className="mt-1.5 max-w-2xl text-sm text-text-dim">{sub}</p>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold tracking-tight">
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-text-dim">{sub}</div>}
    </div>
  );
}

function HistoryStatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    completed: "bg-good/15 text-good",
    cancelled: "bg-text/10 text-text-dim",
    disputed: "bg-magenta/15 text-magenta",
  };
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider " +
        (tone[status] ?? "bg-surface-2 text-text-dim")
      }
    >
      {status}
    </span>
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
        wants to meet — you&rsquo;ll have 30 minutes to lock the slot.
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
      description="Once you're an approved local, this becomes your home base: incoming requests with a 30-minute accept window, weekly earnings, upcoming meetups, and the panic button at all times."
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
