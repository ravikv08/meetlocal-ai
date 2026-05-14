import { NextResponse } from "next/server";
import { expireStaleRequestedBookings } from "@/lib/bookings-cron";

// Cron endpoint — Vercel Cron Jobs hits this every minute. Cancels any
// booking that's been in `requested` state >14 min and releases the
// Stripe auth. See vercel.json for the schedule.
//
// Secured via CRON_SECRET — Vercel sends `Authorization: Bearer <secret>`
// in the header. Reject anything else so this can't be invoked by anon
// callers.

export const runtime = "nodejs";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await expireStaleRequestedBookings();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
