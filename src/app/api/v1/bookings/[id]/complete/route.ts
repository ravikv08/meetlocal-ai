import { markBookingCompletedByUser } from "@/lib/bookings";
import { handleError, ok, requireUser } from "@/lib/api/respond";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await ctx.params;
    const booking = await markBookingCompletedByUser({
      bookingId: id,
      actorUserId: user.userId,
      isAdmin: user.isAdmin,
    });
    return ok({ booking });
  } catch (err) {
    return handleError(err);
  }
}
