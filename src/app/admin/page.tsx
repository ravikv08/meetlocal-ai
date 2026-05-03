import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar } from "@/components/Avatar";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin?from=/admin");
  if (!session.user.isAdmin) redirect("/");

  const [pendingApps, activeLocals, recentBookings, recentMessagesCount] =
    await Promise.all([
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
        where: { createdAt: { gte: new Date(Date.now() - 7 * 86400_000) } },
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
                          <Link
                            href={`/messages/${b.id}`}
                            className="text-text-dim transition hover:text-text"
                          >
                            Open →
                          </Link>
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
