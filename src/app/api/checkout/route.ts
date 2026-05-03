import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createCheckoutSessionForBooking,
  isStripeConfigured,
} from "@/lib/stripe";

// Thin wrapper for client-side "retry payment" flows. Server-side createBooking
// action calls the helper directly.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 501 });
  }

  const { bookingId } = (await req.json()) as { bookingId?: string };
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { travelerId: true },
  });
  if (!booking || booking.travelerId !== session.user.id) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const url = await createCheckoutSessionForBooking({
    bookingId,
    travelerEmail: session.user.email,
  });
  return NextResponse.json({ url });
}
