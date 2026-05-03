import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, MessageCircle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { formatPrice } from "@/lib/utils";

interface ConfirmedPageProps {
  params: Promise<{ bookingId: string }>;
}

// Port of the prototype's BookingConfirmed screen — paper aesthetic, "request
// sent" framing rather than "you're charged" because the local has 14 minutes
// to accept first.
export default async function BookingConfirmedPage({ params }: ConfirmedPageProps) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      local: { include: { user: { select: { name: true, image: true } } } },
    },
  });
  if (!booking || booking.travelerId !== session.user.id) notFound();

  const localName = booking.local.user.name ?? "Local";
  const localFirstName = localName.split(" ")[0];
  const conf = `ML-${booking.id.slice(-7).toUpperCase()}`;
  const slotLabel = booking.scheduledFor
    ? booking.scheduledFor.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "TBD";

  return (
    <div className="min-h-screen bg-paper-bg text-ink">
      <div className="mx-auto max-w-lg px-10 py-20 text-center">
        <div className="animate-ml-fadeup mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink">
          <Check size={24} className="text-white" strokeWidth={2.5} />
        </div>
        <h1
          className="animate-ml-fadeup mt-6 font-display text-4xl font-semibold tracking-tight"
          style={{ animationDelay: "0.05s" }}
        >
          Request sent.
        </h1>
        <p
          className="animate-ml-fadeup mt-3 leading-relaxed text-ink-dim"
          style={{ animationDelay: "0.1s" }}
        >
          {localFirstName} has <b className="text-ink">14 minutes</b> to accept. If they
          can&rsquo;t, we&rsquo;ll match you with another local automatically.
        </p>

        <div
          className="animate-ml-fadeup mt-9 overflow-hidden rounded-2xl border border-hair bg-paper text-left"
          style={{ animationDelay: "0.18s" }}
        >
          <div className="flex items-center gap-3.5 border-b border-hair p-5">
            <Avatar name={localName} size={44} imageUrl={booking.local.user.image} />
            <div className="flex-1">
              <div className="text-sm font-semibold">{localName}</div>
              <div className="text-xs text-ink-dim">{booking.local.tagline}</div>
            </div>
            <span className="rounded-full bg-[#F5F1E8] px-2.5 py-1 font-mono text-[11px] tracking-wider text-[#7A5A2E]">
              Awaiting accept
            </span>
          </div>
          <dl className="grid gap-2.5 p-5 text-sm">
            <Row k="When" v={slotLabel} />
            <Row k="Duration" v={`${booking.hours} hours`} />
            <Row k="Confirmation" v={conf} />
            <div className="mt-2 border-t border-hair pt-3">
              <Row k="Authorized" v={formatPrice(booking.totalAmount)} bold />
            </div>
          </dl>
        </div>

        <div
          className="animate-ml-fadeup mt-6 flex gap-2.5"
          style={{ animationDelay: "0.25s" }}
        >
          <Link
            href={`/messages/${booking.id}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-sm font-semibold text-paper"
          >
            <MessageCircle size={14} /> Message {localFirstName}
          </Link>
          <Link
            href="/"
            className="flex-1 rounded-2xl border border-hair px-4 py-3.5 text-sm font-medium"
          >
            Back to discover
          </Link>
        </div>
        <p className="mt-5 font-mono text-xs text-ink-muted">
          Receipt emailed · Manage trip in Account
        </p>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div
      className={
        "flex justify-between" +
        (bold ? " text-base font-semibold" : " text-sm text-ink-dim")
      }
    >
      <span>{k}</span>
      <span className={bold ? "font-display tracking-tight text-ink" : "text-ink"}>
        {v}
      </span>
    </div>
  );
}
