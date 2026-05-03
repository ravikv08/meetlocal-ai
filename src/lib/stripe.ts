import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Lazy + nullable so the app boots without Stripe configured. Booking flow
// falls back to a "request only" mode if `stripe` is null.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" })
  : null;

export const isStripeConfigured = () => stripe !== null;

interface CreateCheckoutInput {
  bookingId: string;
  travelerEmail?: string | null;
}

// Creates a Stripe Checkout Session for a Booking and persists the session id.
// Returns the URL to redirect the user to. Throws if Stripe isn't configured —
// callers should check `isStripeConfigured()` first and skip if not.
export async function createCheckoutSessionForBooking({
  bookingId,
  travelerEmail,
}: CreateCheckoutInput): Promise<string> {
  if (!stripe) throw new Error("stripe not configured");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      local: { include: { user: { select: { name: true } } } },
    },
  });
  if (!booking) throw new Error("booking not found");

  const localName = booking.local.user.name ?? "Local";
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_intent_data: {
      // Authorize now, capture only after the local accepts.
      capture_method: "manual",
      metadata: { bookingId: booking.id },
    },
    customer_email: travelerEmail ?? undefined,
    line_items: [
      {
        price_data: {
          currency: booking.currency.toLowerCase(),
          product_data: {
            name: `${booking.hours}h with ${localName}`,
            description: booking.local.tagline,
          },
          unit_amount: booking.totalAmount,
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${baseUrl}/booking/${booking.id}/confirmed?payment=ok`,
    cancel_url: `${baseUrl}/book/${booking.local.id}?cancelled=1`,
  });

  if (!checkout.url) throw new Error("stripe returned no checkout url");
  return checkout.url;
}
