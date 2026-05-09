"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  acceptBookingByUser,
  declineBookingByUser,
  markBookingCompletedByUser,
} from "@/lib/bookings";

// Thin Next.js server-action wrappers around src/lib/bookings.ts. These handle
// session lookup and cache invalidation; the lifecycle logic itself lives in
// the lib so the same code powers a future REST/mobile API.

async function getActor() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");
  return {
    actorUserId: session.user.id,
    isAdmin: !!session.user.isAdmin,
  };
}

function revalidateBookingPaths(bookingId: string, includeAdmin = true) {
  revalidatePath(`/messages/${bookingId}`);
  revalidatePath(`/host`);
  revalidatePath(`/trips`);
  if (includeAdmin) revalidatePath(`/admin`);
}

export async function acceptBooking(formData: FormData) {
  const actor = await getActor();
  const bookingId = String(formData.get("bookingId") ?? "");
  await acceptBookingByUser({ bookingId, ...actor });
  revalidateBookingPaths(bookingId);
}

export async function declineBooking(formData: FormData) {
  const actor = await getActor();
  const bookingId = String(formData.get("bookingId") ?? "");
  await declineBookingByUser({ bookingId, ...actor });
  revalidateBookingPaths(bookingId);
}

export async function markBookingCompleted(formData: FormData) {
  const actor = await getActor();
  const bookingId = String(formData.get("bookingId") ?? "");
  await markBookingCompletedByUser({ bookingId, ...actor });
  revalidateBookingPaths(bookingId, false);
}
