"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSessionForBooking, isStripeConfigured } from "@/lib/stripe";
import { sendEmail, bookingRequestedTemplate } from "@/lib/email";

// Server action invoked by the booking form. Creates a Booking row in
// `requested` state, then either redirects to Stripe Checkout (if configured)
// or to the confirmation page (request-only fallback).
export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const localId = String(formData.get("localId") ?? "");
  const hours = Number(formData.get("hours") ?? 3);
  const slot = String(formData.get("slot") ?? "20:00");
  const when = String(formData.get("when") ?? "tonight");
  const spotId = formData.get("spotId");
  const travelerNote = String(formData.get("travelerNote") ?? "").trim() || null;

  const local = await prisma.localProfile.findUnique({
    where: { id: localId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!local || local.status !== "active") {
    throw new Error("Local not available");
  }

  const subtotal = local.ratePerHour * hours;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.03);
  const totalAmount = subtotal + serviceFee + taxes;
  const platformFee = Math.round(subtotal * 0.22); // 22% take rate per playbook

  const scheduledFor = resolveScheduledFor(when, slot);

  const booking = await prisma.booking.create({
    data: {
      travelerId: session.user.id,
      localId: local.id,
      hours,
      ratePerHour: local.ratePerHour,
      totalAmount,
      platformFee,
      currency: "USD",
      status: "requested",
      scheduledFor,
      travelerNote,
      meetingSpotId: spotId ? String(spotId) : null,
    },
  });

  if (isStripeConfigured()) {
    const url = await createCheckoutSessionForBooking({
      bookingId: booking.id,
      travelerEmail: session.user.email,
    });
    redirect(url);
  }

  // Stripe not configured — request-only mode. Fire the local notification
  // immediately so the founder can hand-collect payment.
  if (local.user.email) {
    await sendEmail({
      to: local.user.email,
      ...bookingRequestedTemplate({
        localName: local.user.name ?? "there",
        travelerName: session.user.name ?? "A traveler",
        hours,
        totalCents: totalAmount,
        bookingId: booking.id,
      }),
    });
  }

  redirect(`/booking/${booking.id}/confirmed`);
}

// Compose a Date from an ISO `YYYY-MM-DD` and `HH:mm` slot, in the local TZ.
// Falls back to today + slot for legacy/empty `when` values.
function resolveScheduledFor(when: string, slot: string): Date {
  const [hh, mm] = slot.split(":").map((n) => Number(n));
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(when);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const out = new Date(Number(y), Number(m) - 1, Number(d), hh ?? 20, mm ?? 0, 0, 0);
    return out;
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
