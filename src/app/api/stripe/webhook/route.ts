import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail, bookingRequestedTemplate } from "@/lib/email";

// Stripe webhook handler. Configure the endpoint in the Stripe dashboard at
// `${AUTH_URL}/api/stripe/webhook`; copy the signing secret into
// STRIPE_WEBHOOK_SECRET. For local dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 501 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  // Idempotency: insert event id first; if it already exists the unique
  // constraint throws (P2002) and we skip side effects. This is race-safe —
  // two simultaneous retries can both pass a "findUnique" check, but only one
  // can win the create. Stripe also retries up to 5x with exponential
  // backoff, so this gate is load-bearing.
  try {
    await prisma.webhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ received: true, replay: true });
    }
    throw err;
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      await handleCheckoutCancelled(event.data.object as Stripe.Checkout.Session);
      break;
    case "identity.verification_session.verified":
      await handleIdentityVerified(
        event.data.object as Stripe.Identity.VerificationSession,
      );
      break;
    case "identity.verification_session.requires_input":
      // Stripe surfaces this when the document was unreadable, the selfie
      // didn't match, etc. Leave idVerified=false; user can re-try from the
      // apply page (the same session is reusable for a while).
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(cs: Stripe.Checkout.Session) {
  const bookingId = cs.metadata?.bookingId;
  if (!bookingId) return;

  const paymentIntentId =
    typeof cs.payment_intent === "string"
      ? cs.payment_intent
      : (cs.payment_intent?.id ?? null);

  // Status stays "requested" — payment is just authorized; the local still
  // needs to accept before we capture. The local accept action moves it to
  // "confirmed" + captures the PI.
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { stripePaymentIntentId: paymentIntentId },
    include: {
      traveler: { select: { name: true } },
      local: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  if (booking.local.user.email) {
    await sendEmail({
      to: booking.local.user.email,
      ...bookingRequestedTemplate({
        localName: booking.local.user.name ?? "there",
        travelerName: booking.traveler.name ?? "A traveler",
        hours: booking.hours,
        totalCents: booking.totalAmount,
        bookingId: booking.id,
      }),
    });
  }
}

async function handleCheckoutCancelled(cs: Stripe.Checkout.Session) {
  const bookingId = cs.metadata?.bookingId;
  if (!bookingId) return;
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });
}

async function handleIdentityVerified(vs: Stripe.Identity.VerificationSession) {
  // Two ways to locate the profile (in priority order): metadata we attached
  // at creation, then a fallback lookup by the stored session id. The
  // metadata path covers the normal case; the fallback covers the rare case
  // where metadata got dropped (e.g., manual session creation from dashboard).
  const localProfileId = vs.metadata?.localProfileId ?? undefined;

  const updated = localProfileId
    ? await prisma.localProfile.updateMany({
        where: { id: localProfileId, idVerified: false },
        data: {
          idVerified: true,
          stripeIdentityVerificationId: vs.id,
        },
      })
    : await prisma.localProfile.updateMany({
        where: { stripeIdentityVerificationId: vs.id, idVerified: false },
        data: { idVerified: true },
      });

  // If updated.count is 0 the profile was either already verified (idempotent
  // re-fire) or genuinely not findable (orphan session). Either way, nothing
  // to do — webhook still acks 200 so Stripe doesn't keep retrying.
  void updated;
}
