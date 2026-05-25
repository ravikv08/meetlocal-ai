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

  // First name only — "Funds held until Akhil accepts" reads better than the
  // full name and matches the in-app voice elsewhere.
  const localFirstName = localName.split(" ")[0];

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    // "book" → the primary CTA reads "Book" instead of "Pay", which matches
    // the meetlocal model (you're booking a meetup, not buying a thing).
    submit_type: "book",
    // Card only. Stripe still surfaces Apple Pay / Google Pay / Link as
    // browser-detected card payments — but kills the Klarna / Affirm /
    // Amazon Pay / Cash App grid that's noisy for a ~$50 booking.
    payment_method_types: ["card"],
    payment_intent_data: {
      // Authorize now, capture only after the local accepts.
      capture_method: "manual",
      metadata: { bookingId: booking.id },
      // What shows on the traveler's card statement. 22-char cap; meetlocal.ai
      // is 12 incl. dot, leaves room for a short local-name hint.
      statement_descriptor_suffix: "BOOKING",
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
    // Above the submit button. Reinforces the auth-now-capture-later model so
    // the traveler isn't surprised when no charge shows up immediately.
    custom_text: {
      submit: {
        message: `We authorize your card now and only capture once ${localFirstName} accepts within 30 minutes. If they don't, the hold drops off automatically.`,
      },
    },
    metadata: { bookingId: booking.id },
    success_url: `${baseUrl}/booking/${booking.id}/confirmed?payment=ok`,
    cancel_url: `${baseUrl}/book/${booking.local.id}?cancelled=1`,
  });

  if (!checkout.url) throw new Error("stripe returned no checkout url");
  return checkout.url;
}
