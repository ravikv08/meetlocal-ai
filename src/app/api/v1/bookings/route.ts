import { createBookingForTraveler } from "@/lib/bookings";
import { CreateBookingSchema } from "@/lib/schemas/booking";
import { handleError, ok, parseJson, requireUser } from "@/lib/api/respond";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(req, CreateBookingSchema);
    const { booking, checkoutUrl } = await createBookingForTraveler({
      travelerId: user.userId,
      travelerEmail: user.email,
      travelerName: user.name,
      ...input,
    });
    return ok({ booking, checkoutUrl });
  } catch (err) {
    return handleError(err);
  }
}
