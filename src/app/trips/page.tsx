import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Avatar } from "@/components/Avatar";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";

export default async function TripsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/trips");

  const me = session.user.id;

  // A user can be both a traveler and a local — show both sides if applicable.
  const [asTraveler, asLocal, localProfile] = await Promise.all([
    prisma.booking.findMany({
      where: { travelerId: me },
      orderBy: { createdAt: "desc" },
      include: {
        local: { include: { user: { select: { name: true, image: true } } } },
        meetingSpot: true,
      },
    }),
    prisma.booking.findMany({
      where: { local: { userId: me } },
      orderBy: { createdAt: "desc" },
      include: {
        traveler: { select: { name: true, image: true } },
        meetingSpot: true,
      },
    }),
    prisma.localProfile.findUnique({ where: { userId: me } }),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-12 px-14 py-10 pb-32">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
            Trips
          </div>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">
            Your meetlocal trips
          </h1>
          <p className="mt-2 text-text-dim">
            Everything you&rsquo;ve booked, plus everything booked with you.
          </p>
        </div>

        {/* As a traveler */}
        <section>
          <h2 className="mb-4 font-display text-xl font-semibold">
            Bookings you&rsquo;ve made
          </h2>
          {asTraveler.length === 0 ? (
            <EmptyCTA
              text="No trips booked yet."
              ctaHref="/"
              ctaLabel="Browse locals"
            />
          ) : (
            <div className="grid gap-3">
              {asTraveler.map((b) => {
                const cityName =
                  CITIES.find((c) => c.slug === b.local.city)?.name ?? b.local.city;
                return (
                  <BookingRow
                    key={b.id}
                    href={`/messages/${b.id}`}
                    counterpartName={b.local.user.name ?? "Local"}
                    counterpartImage={b.local.user.image}
                    subtitle={`${cityName} · ${b.local.tagline}`}
                    when={b.scheduledFor}
                    status={b.status}
                    total={b.totalAmount}
                    spotName={b.meetingSpot?.name ?? null}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* As a local */}
        {localProfile && (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold">
              Bookings travelers made with you
            </h2>
            {asLocal.length === 0 ? (
              <EmptyCTA
                text="No incoming bookings yet."
                ctaHref={`/local/${localProfile.id}`}
                ctaLabel="View your profile"
              />
            ) : (
              <div className="grid gap-3">
                {asLocal.map((b) => (
                  <BookingRow
                    key={b.id}
                    href={`/messages/${b.id}`}
                    counterpartName={b.traveler.name ?? "Traveler"}
                    counterpartImage={b.traveler.image}
                    subtitle={`${b.hours}h · ${formatPrice(b.totalAmount)}`}
                    when={b.scheduledFor}
                    status={b.status}
                    total={b.totalAmount}
                    spotName={b.meetingSpot?.name ?? null}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {!localProfile && (
          <section className="rounded-3xl border border-line-2 bg-surface p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Want to host travelers in your city?
            </h2>
            <p className="mt-2 text-text-dim">
              Set your rate, your hours, what you&rsquo;d show. We bring you the
              travelers.
            </p>
            <Link
              href="/become-a-local"
              className="grad-sunset mt-5 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
            >
              Apply to be a local <ArrowRight size={15} />
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function BookingRow({
  href,
  counterpartName,
  counterpartImage,
  subtitle,
  when,
  status,
  total,
  spotName,
}: {
  href: string;
  counterpartName: string;
  counterpartImage: string | null;
  subtitle: string;
  when: Date | null;
  status: string;
  total: number;
  spotName: string | null;
}) {
  const whenLabel = when
    ? when.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-line-2"
    >
      <Avatar name={counterpartName} size={48} imageUrl={counterpartImage} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-display text-base font-semibold">
            {counterpartName}
          </span>
          <StatusPill status={status} />
        </div>
        <div className="truncate text-sm text-text-dim">{subtitle}</div>
        <div className="mt-1 font-mono text-[11px] tracking-wider text-text-muted">
          {whenLabel}
          {spotName ? ` · ${spotName}` : ""}
        </div>
      </div>
      <div className="hidden text-right sm:block">
        <div className="font-display font-semibold">{formatPrice(total)}</div>
        <div className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-text-muted">
          <MessageCircle size={11} /> Open chat
        </div>
      </div>
    </Link>
  );
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
        "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider " +
        (tone[status] ?? "bg-surface-2 text-text-dim")
      }
    >
      {status.replace("_", " ")}
    </span>
  );
}

function EmptyCTA({
  text,
  ctaHref,
  ctaLabel,
}: {
  text: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-10 text-center">
      <p className="text-text-dim">{text}</p>
      <Link
        href={ctaHref}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg"
      >
        {ctaLabel} <ArrowRight size={14} />
      </Link>
    </div>
  );
}
