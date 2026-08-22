import type { Booking } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createCheckoutSessionForBooking,
  isStripeConfigured,
  stripe,
} from "@/lib/stripe";
import {
  sendEmail,
  bookingRequestedTemplate,
  bookingAcceptedTemplate,
} from "@/lib/email";

// Pure business logic for the booking lifecycle. Callers (Next server actions
// today, REST/mobile API routes tomorrow) handle auth, request parsing, and
// side effects like redirects/cache invalidation. These functions only know
// about IDs and data — no FormData, no redirect(), no revalidatePath().

export interface CreateBookingInput {
  travelerId: string;
  travelerEmail?: string | null;
  travelerName?: string | null;
  localId: string;
  hours: number;
  /** "HH:mm" in local time. */
  slot: string;
  /** ISO YYYY-MM-DD, or one of "tonight" | "tomorrow" | "weekend". */
  when: string;
  spotId?: string | null;
  travelerNote?: string | null;
}

export interface CreateBookingResult {
  booking: Booking;
  /** Stripe Checkout URL when Stripe is configured; null in request-only mode. */
  checkoutUrl: string | null;
}

export async function createBookingForTraveler(
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const local = await prisma.localProfile.findUnique({
    where: { id: input.localId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!local || local.status !== "active") {
    throw new Error("Local not available");
  }

  const subtotal = local.ratePerHour * input.hours;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.03);
  const totalAmount = subtotal + serviceFee + taxes;
  // Founding 100 locals pay 10% platform fee (keep 90%); standard pay 22%
  // (keep 78%). Snapshot at booking creation so a later flip of isFounding
  // doesn't retroactively change historical bookings.
  const platformFeeRate = local.isFounding ? 0.1 : 0.22;
  const platformFee = Math.round(subtotal * platformFeeRate);

  const scheduledFor = resolveScheduledFor(input.when, input.slot);

  const booking = await prisma.booking.create({
    data: {
      travelerId: input.travelerId,
      localId: local.id,
      hours: input.hours,
      ratePerHour: local.ratePerHour,
      totalAmount,
      platformFee,
      currency: "USD",
      status: "requested",
      scheduledFor,
      travelerNote: input.travelerNote ?? null,
      meetingSpotId: input.spotId ?? null,
    },
  });

  if (isStripeConfigured()) {
    const checkoutUrl = await createCheckoutSessionForBooking({
      bookingId: booking.id,
      travelerEmail: input.travelerEmail ?? null,
    });
    return { booking, checkoutUrl };
  }

  // Stripe not configured — request-only mode. Notify the local immediately so
  // the founder can hand-collect payment.
  if (local.user.email) {
    await sendEmail({
      to: local.user.email,
      ...bookingRequestedTemplate({
        localName: local.user.name ?? "there",
        travelerName: input.travelerName ?? "A traveler",
        hours: input.hours,
        totalCents: totalAmount,
        bookingId: booking.id,
      }),
    });
  }

  return { booking, checkoutUrl: null };
}

export interface BookingActorContext {
  bookingId: string;
  actorUserId: string;
  isAdmin: boolean;
}

// Authorization helper: a booking can be acted on by the local that owns the
// LocalProfile, or by any admin. Throws on miss so callers can short-circuit.
async function loadActionableBooking({
  bookingId,
  actorUserId,
  isAdmin,
}: BookingActorContext) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      stripePaymentIntentId: true,
      travelerId: true,
      local: { select: { userId: true, status: true } },
    },
  });
  if (!booking) throw new Error("booking not found");

  const isTraveler = booking.travelerId === actorUserId;
  const isLocal = booking.local.userId === actorUserId;
  if (!isTraveler && !isLocal && !isAdmin) throw new Error("forbidden");

  return { booking, isLocal, isTraveler };
}

export async function acceptBookingByUser(ctx: BookingActorContext) {
  const { booking } = await loadActionableBooking(ctx);

  if (booking.status !== "requested") {
    throw new Error(`Cannot accept a booking that is ${booking.status}`);
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id, status: "requested" },
    data: { status: "confirmed", acceptedAt: new Date() },
  });

  // Capture the authorized Stripe payment (if Stripe was used). Only after
  // the row transitioned to `confirmed` — a failed capture is logged and
  // reconciled manually rather than blocking the accept.
  if (booking.stripePaymentIntentId && stripe) {
    try {
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    } catch (err) {
      console.error("[booking] stripe capture failed:", err);
    }
  }

  const traveler = await prisma.user.findUnique({
    where: { id: booking.travelerId },
    select: { name: true, email: true },
  });
  const localUser = await prisma.user.findUnique({
    where: { id: booking.local.userId },
    select: { name: true },
  });
  if (traveler?.email) {
    await sendEmail({
      to: traveler.email,
      ...bookingAcceptedTemplate({
        travelerName: traveler.name ?? "there",
        localName: localUser?.name ?? "your local",
        bookingId: booking.id,
      }),
    });
  }

  return updated;
}

export async function declineBookingByUser(ctx: BookingActorContext) {
  const { booking } = await loadActionableBooking(ctx);

  if (!["requested", "confirmed"].includes(booking.status)) {
    throw new Error(`Cannot decline a booking that is ${booking.status}`);
  }

  // Cancel Stripe authorization (release the hold) if there is one.
  if (booking.stripePaymentIntentId && stripe) {
    try {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
    } catch (err) {
      console.error("[booking] stripe cancel failed:", err);
    }
  }

  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
  });
}

export async function markBookingCompletedByUser(ctx: BookingActorContext) {
  const { booking } = await loadActionableBooking(ctx);
  if (booking.status !== "confirmed" && booking.status !== "in_progress") {
    throw new Error(`Cannot complete a booking that is ${booking.status}`);
  }
  return prisma.booking.update({
    where: { id: booking.id },
    data: { status: "completed", completedAt: new Date() },
  });
}

// Compose a Date from an ISO `YYYY-MM-DD` and `HH:mm` slot, in the local TZ.
// Falls back to today + slot for legacy/empty `when` values.
function resolveScheduledFor(when: string, slot: string): Date {
  const [hh, mm] = slot.split(":").map((n) => Number(n));
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(when);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      hh ?? 20,
      mm ?? 0,
      0,
      0,
    );
  }
  // Legacy fallback: tonight/tomorrow/weekend
  const d = new Date();
  d.setSeconds(0, 0);
  d.setHours(hh ?? 20, mm ?? 0);
  if (when === "tomorrow") d.setDate(d.getDate() + 1);
  if (when === "weekend") {
    const dow = d.getDay();
    const offset = dow <= 5 ? 6 - dow : 7 - dow + 6;
    d.setDate(d.getDate() + offset);
  }
  if (when === "tonight" && d.getTime() < Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}
