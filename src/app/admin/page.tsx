import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Check,
  X,
  ArrowRight,
  IdCard,
  Camera,
  ShieldAlert,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar } from "@/components/Avatar";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";
import {
  acceptBooking,
  declineBooking,
} from "@/lib/booking-actions";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?from=/admin");
  if (!session.user.isAdmin) redirect("/");

  const [
    pendingApps,
    activeLocals,
    recentBookings,
    recentMessagesCount,
    pendingApplications,
  ] = await Promise.all([
    prisma.localProfile.count({ where: { status: "pending" } }),
    prisma.localProfile.count({ where: { status: "active" } }),
    prisma.booking.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        traveler: { select: { name: true, image: true } },
        local: { include: { user: { select: { name: true, image: true } } } },
      },
    }),
    prisma.message.count({
      // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
      where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
    }),
    // Pending local applications — surface on the dashboard so the founder
    // doesn't have to drill into /admin/locals?status=pending to know who's
    // waiting. Show full identity + KYC submission state at a glance.
    prisma.localProfile.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" }, // oldest first — fairness
      take: 10,
      include: {
        user: { select: { name: true, email: true, image: true } },
      },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-14 py-10">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
            Admin
          </div>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">
            Founder dashboard
          </h1>
          <p className="mt-2 text-text-dim">
            Vet new locals, watch booking flow, jump in on safety issues.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Pending applications" value={String(pendingApps)} link="/admin/locals?status=pending" />
          <Stat label="Active locals" value={String(activeLocals)} link="/admin/locals" />
          <Stat label="Bookings (last 7d)" value={String(recentBookings.length)} />
          <Stat label="Messages (last 7d)" value={String(recentMessagesCount)} />
        </div>

        {/* Pending applications — surfaced inline so the founder can review
            without drilling. Each card shows identity + KYC submission state
            + a one-click Review button that opens the full review page. */}
        {pendingApplications.length > 0 && (
          <section>
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Pending applications
                  <span className="ml-2 rounded-full bg-amber/15 px-2.5 py-0.5 align-middle font-mono text-[11px] font-normal uppercase tracking-wider text-amber">
                    {pendingApps} waiting
                  </span>
                </h2>
                <p className="mt-1 text-sm text-text-dim">
                  Review each candidate&rsquo;s ID, selfie, social profiles
                  before approving. Oldest first.
                </p>
              </div>
              {pendingApps > 10 && (
                <Link
                  href="/admin/locals?status=pending"
                  className="text-sm text-text-dim transition hover:text-text"
                >
                  See all {pendingApps} →
                </Link>
              )}
            </div>

            <div className="grid gap-3">
              {pendingApplications.map((l) => {
                const cityName =
                  CITIES.find((c) => c.slug === l.city)?.name ?? l.city;
                const idSubmitted = Boolean(l.governmentIdUrl);
                const selfieSubmitted = Boolean(l.selfieUrl);
                const dobSubmitted = Boolean(l.dateOfBirth);
                const socialCount = [
                  l.instagramHandle,
                  l.facebookUrl,
                  l.twitterHandle,
                  l.linkedinUrl,
                  l.snapchatHandle,
                  l.lumaUrl,
                  l.websiteUrl,
                ].filter(Boolean).length;
                const submittedAgo = msAgo(l.createdAt);
                const kycComplete = idSubmitted && selfieSubmitted && dobSubmitted;
                return (
                  <div
                    key={l.id}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-2"
                  >
                    <Avatar
                      name={l.user.name ?? "?"}
                      size={52}
                      imageUrl={l.user.image ?? l.photoUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display text-base font-semibold text-text">
                          {l.user.name ?? l.user.email}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                          {cityName}
                          {l.neighborhood ? ` · ${l.neighborhood}` : ""}
                        </span>
                        <span className="font-mono text-[11px] text-text-muted">
                          {submittedAgo}
                        </span>
                      </div>
                      <div className="mt-1 truncate text-sm text-text-dim">
                        {l.tagline}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <KycBadge
                          on={idSubmitted}
                          icon={<IdCard size={11} />}
                          label="ID"
                        />
                        <KycBadge
                          on={selfieSubmitted}
                          icon={<Camera size={11} />}
                          label="Selfie"
                        />
                        <KycBadge
                          on={dobSubmitted}
                          icon={<Check size={11} />}
                          label="DOB"
                        />
                        <span className="rounded-full border border-line-2 bg-bg-2 px-2 py-0.5 font-mono uppercase tracking-wider text-text-muted">
                          {socialCount} social{socialCount === 1 ? "" : "s"}
                        </span>
                        <span className="rounded-full border border-line-2 bg-bg-2 px-2 py-0.5 font-mono uppercase tracking-wider text-text-muted">
                          {formatPrice(l.ratePerHour)}/hr
                        </span>
                        {!kycComplete && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-magenta/15 px-2 py-0.5 font-mono uppercase tracking-wider text-magenta">
                            <ShieldAlert size={11} /> KYC incomplete
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/locals/${l.id}`}
                      className="grad-sunset flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95"
                    >
                      Review <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold">Recent bookings</h2>
            <Link
              href="/admin/locals"
              className="text-sm text-text-dim transition hover:text-text"
            >
              Manage locals →
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-12 text-center text-text-dim">
              No bookings yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <table className="w-full text-sm">
                <thead className="border-b border-line text-left font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  <tr>
                    <th className="px-5 py-3 font-normal">When</th>
                    <th className="px-5 py-3 font-normal">Traveler</th>
                    <th className="px-5 py-3 font-normal">Local · city</th>
                    <th className="px-5 py-3 font-normal">Status</th>
                    <th className="px-5 py-3 text-right font-normal">Total</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => {
                    const cityName =
                      CITIES.find((c) => c.slug === b.local.city)?.name ?? b.local.city;
                    return (
                      <tr key={b.id} className="border-b border-line last:border-b-0">
                        <td className="px-5 py-3 align-middle text-text-dim">
                          {b.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
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
                        <td className="px-5 py-3 align-middle">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              name={b.local.user.name ?? "?"}
                              size={26}
                              imageUrl={b.local.user.image}
                            />
                            <span>
                              {b.local.user.name}{" "}
                              <span className="text-text-muted">· {cityName}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 align-middle">
                          <StatusPill status={b.status} />
                        </td>
                        <td className="px-5 py-3 text-right align-middle font-mono">
                          {formatPrice(b.totalAmount)}
                        </td>
                        <td className="px-5 py-3 align-middle text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.status === "requested" && (
                              <>
                                <form action={acceptBooking}>
                                  <input
                                    type="hidden"
                                    name="bookingId"
                                    value={b.id}
                                  />
                                  <button
                                    type="submit"
                                    title="Accept on behalf of local"
                                    className="grad-sunset flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                                  >
                                    <Check size={11} /> Accept
                                  </button>
                                </form>
                                <form action={declineBooking}>
                                  <input
                                    type="hidden"
                                    name="bookingId"
                                    value={b.id}
                                  />
                                  <button
                                    type="submit"
                                    title="Decline on behalf of local"
                                    className="flex items-center gap-1 rounded-full border border-line-2 px-2.5 py-1 text-xs text-text-dim transition hover:text-text"
                                  >
                                    <X size={11} /> Decline
                                  </button>
                                </form>
                              </>
                            )}
                            <Link
                              href={`/messages/${b.id}`}
                              className="text-text-dim transition hover:text-text"
                            >
                              Open →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-line bg-surface p-5 transition hover:border-line-2">
      <div className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
  return link ? <Link href={link}>{inner}</Link> : inner;
}

function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    requested: "bg-amber/15 text-amber",
    confirmed: "bg-good/15 text-good",
    in_progress: "bg-coral/15 text-coral",
    completed: "bg-text/10 text-text-dim",
    cancelled: "bg-magenta/15 text-magenta",
    disputed: "bg-magenta/30 text-magenta",
  };
  return (
    <span
      className={
        "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider " +
        (tone[status] ?? "bg-surface-2 text-text-dim")
      }
    >
      {status.replace("_", " ")}
    </span>
  );
}

// Compact "submitted X ago" — just enough granularity for a triage list.
function msAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  return `${mo}mo ago`;
}

// Compact KYC submission badge — green=submitted, red=missing. Used on the
// pending-applications dashboard card so the founder can see at a glance
// whether each candidate has all the required uploads.
function KycBadge({
  on,
  icon,
  label,
}: {
  on: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono uppercase tracking-wider " +
        (on
          ? "bg-good/15 text-good"
          : "bg-magenta/15 text-magenta")
      }
    >
      {icon} {label}
    </span>
  );
}
