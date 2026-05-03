import Link from "next/link";
import { Check, X, Sparkles, Star } from "lucide-react";
import type { BookingStatus } from "@prisma/client";
import {
  acceptBooking,
  declineBooking,
  markBookingCompleted,
} from "@/lib/booking-actions";

interface BookingActionBarProps {
  bookingId: string;
  status: BookingStatus;
  role: "traveler" | "local";
  /** Whether this booking has Stripe payment authorized — affects copy */
  hasStripePayment: boolean;
}

// Server-rendered action strip surfaced in the chat (and in /host). Renders
// the right buttons based on who's looking and where the booking is in its
// lifecycle. Forms post to server actions in lib/booking-actions.ts.
export function BookingActionBar({
  bookingId,
  status,
  role,
  hasStripePayment,
}: BookingActionBarProps) {
  // Local sees Accept/Decline on a fresh request
  if (role === "local" && status === "requested") {
    return (
      <Banner tone="amber">
        <div className="flex-1">
          <strong className="text-text">New request · 14 min to respond</strong>
          <p className="mt-1 text-sm text-text-dim">
            {hasStripePayment
              ? "Payment is authorized. Accept to capture; decline to release the hold."
              : "Accept to confirm the meetup. The traveler will be notified by email."}
          </p>
        </div>
        <form action={acceptBooking}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            className="grad-sunset flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            <Check size={14} /> Accept
          </button>
        </form>
        <form action={declineBooking}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm text-text-dim transition hover:text-text"
          >
            <X size={14} /> Decline
          </button>
        </form>
      </Banner>
    );
  }

  // Traveler waiting on a request
  if (role === "traveler" && status === "requested") {
    return (
      <Banner tone="amber">
        <div className="flex-1">
          <strong className="text-text">Request sent · awaiting accept</strong>
          <p className="mt-1 text-sm text-text-dim">
            Your local has 14 minutes. We&rsquo;ll re-route automatically if they
            don&rsquo;t respond.
          </p>
        </div>
      </Banner>
    );
  }

  // Confirmed → either side can mark completed
  if (status === "confirmed" || status === "in_progress") {
    return (
      <Banner tone="good">
        <div className="flex-1">
          <strong className="text-text">
            <Sparkles className="-mt-0.5 inline" size={14} /> Booking confirmed
          </strong>
          <p className="mt-1 text-sm text-text-dim">
            {role === "local"
              ? "Mark this complete after the meetup so we can release the payout."
              : "Mark this complete after you and your local wrap up — both sides get a review prompt."}
          </p>
        </div>
        <form action={markBookingCompleted}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <button
            type="submit"
            className="rounded-full bg-text px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Mark complete
          </button>
        </form>
      </Banner>
    );
  }

  // Completed → review prompt
  if (status === "completed") {
    return (
      <Banner tone="good">
        <div className="flex-1">
          <strong className="text-text">Session complete</strong>
          <p className="mt-1 text-sm text-text-dim">
            Leave a review — both sides see each other&rsquo;s only after both
            submit.
          </p>
        </div>
        <Link
          href={`/review/${bookingId}`}
          className="grad-sunset flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white"
        >
          <Star size={14} /> Leave review
        </Link>
      </Banner>
    );
  }

  if (status === "cancelled") {
    return (
      <Banner tone="muted">
        <div className="flex-1">
          <strong className="text-text">Booking cancelled</strong>
          <p className="mt-1 text-sm text-text-dim">
            {hasStripePayment
              ? "The Stripe authorization has been released."
              : "No further action needed."}
          </p>
        </div>
      </Banner>
    );
  }

  return null;
}

function Banner({
  tone,
  children,
}: {
  tone: "amber" | "good" | "muted";
  children: React.ReactNode;
}) {
  const styles = {
    amber: "border-amber/40 bg-amber/5",
    good: "border-good/30 bg-good/5",
    muted: "border-line bg-surface",
  }[tone];
  return (
    <div
      className={`flex flex-wrap items-center gap-3 border-b px-6 py-3 ${styles}`}
    >
      {children}
    </div>
  );
}
