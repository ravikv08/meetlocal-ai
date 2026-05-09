"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createBookingForTraveler } from "@/lib/bookings";

// Server action invoked by the booking form. Parses the form, runs auth, calls
// the pure booking lib, then handles Next-specific redirects. The same lib
// function is what the future mobile API at /api/v1/bookings will call.
export async function createBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const localId = String(formData.get("localId") ?? "");
  const hours = Number(formData.get("hours") ?? 3);
  const slot = String(formData.get("slot") ?? "20:00");
  const when = String(formData.get("when") ?? "tonight");
  const spotIdRaw = formData.get("spotId");
  const travelerNote =
    String(formData.get("travelerNote") ?? "").trim() || null;

  const { booking, checkoutUrl } = await createBookingForTraveler({
    travelerId: session.user.id,
    travelerEmail: session.user.email,
    travelerName: session.user.name,
    localId,
    hours,
    slot,
    when,
    spotId: spotIdRaw ? String(spotIdRaw) : null,
    travelerNote,
  });

  if (checkoutUrl) {
    redirect(checkoutUrl);
  }
  redirect(`/booking/${booking.id}/confirmed`);
}
