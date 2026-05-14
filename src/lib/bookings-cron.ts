import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// Auto-cancel any booking that's been in `requested` state longer than the
// configured window. Designed to be called from a cron route handler.
// Returns the number cancelled + the IDs for logging.

const WINDOW_MS = 14 * 60 * 1000; // 14 minutes — must match the UI promise

export async function expireStaleRequestedBookings(
  now: Date = new Date(),
): Promise<{ cancelled: number; ids: string[]; errors: string[] }> {
  const cutoff = new Date(now.getTime() - WINDOW_MS);
  const errors: string[] = [];

  const stale = await prisma.booking.findMany({
    where: {
      status: "requested",
      createdAt: { lt: cutoff },
    },
    select: { id: true, stripePaymentIntentId: true },
  });

  for (const b of stale) {
    // Cancel the Stripe auth if one exists so the hold is released.
    if (b.stripePaymentIntentId && stripe) {
      try {
        await stripe.paymentIntents.cancel(b.stripePaymentIntentId);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${b.id}: stripe cancel failed — ${msg}`);
        // Continue — we still want to mark the booking cancelled even if
        // Stripe rejects (e.g., already captured/canceled state).
      }
    }
    await prisma.booking.update({
      where: { id: b.id },
      data: { status: "cancelled" },
    });
  }

  return { cancelled: stale.length, ids: stale.map((b) => b.id), errors };
}
