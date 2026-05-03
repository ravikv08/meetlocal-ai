"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail, bookingAcceptedTemplate } from "@/lib/email";

// Authorization helper: a booking can be acted on by the local that owns the
// LocalProfile, or by any admin. Throws on miss so callers can short-circuit.
async function loadActionableBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { select: { id: true, name: true, email: true } },
      local: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });
  if (!booking) throw new Error("booking not found");

  const me = session.user.id;
  const isLocal = booking.local.userId === me;
  const isAdmin = session.user.isAdmin;
  if (!isLocal && !isAdmin) throw new Error("forbidden");

  return { session, booking, isLocal, isAdmin };
}

export async function acceptBooking(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const { booking } = await loadActionableBooking(bookingId);

  if (booking.status !== "requested") {
    throw new Error(`Cannot accept a booking that is ${booking.status}`);
  }

  // Capture the authorized Stripe payment (if Stripe was used). Failures are
  // logged but don't block the accept — the booking record is the source of
  // truth and the founder can reconcile manually.
  if (booking.stripePaymentIntentId && stripe) {
    try {
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[booking] stripe capture failed:", err);
    }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "confirmed", acceptedAt: new Date() },
  });

  if (booking.traveler.email) {
    await sendEmail({
      to: booking.traveler.email,
      ...bookingAcceptedTemplate({
        travelerName: booking.traveler.name ?? "there",
        localName: booking.local.user.name ?? "your local",
        bookingId: booking.id,
      }),
    });
  }

  revalidatePath(`/messages/${booking.id}`);
  revalidatePath(`/host`);
  revalidatePath(`/trips`);
  revalidatePath(`/admin`);
}

export async function declineBooking(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const { booking } = await loadActionableBooking(bookingId);

  if (!["requested", "confirmed"].includes(booking.status)) {
    throw new Error(`Cannot decline a booking that is ${booking.status}`);
  }

  // Cancel Stripe authorization (release the hold) if there is one.
  if (booking.stripePaymentIntentId && stripe) {
    try {
      await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[booking] stripe cancel failed:", err);
    }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
  });

  revalidatePath(`/messages/${booking.id}`);
  revalidatePath(`/host`);
  revalidatePath(`/trips`);
  revalidatePath(`/admin`);
}

export async function markBookingCompleted(formData: FormData) {
  const bookingId = String(formData.get("bookingId") ?? "");
  const { booking } = await loadActionableBooking(bookingId);
  if (booking.status !== "confirmed" && booking.status !== "in_progress") {
    throw new Error(`Cannot complete a booking that is ${booking.status}`);
  }
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "completed", completedAt: new Date() },
  });
  revalidatePath(`/messages/${booking.id}`);
  revalidatePath(`/host`);
  revalidatePath(`/trips`);
}
