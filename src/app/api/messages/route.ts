import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseServer } from "@/lib/supabase-server";
import { channelForBooking } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { bookingId, body } = (await req.json()) as {
    bookingId?: string;
    body?: string;
  };
  if (!bookingId || !body?.trim()) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { travelerId: true, local: { select: { userId: true } } },
  });
  if (!booking) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  // Authorization: only traveler or local on this booking can post
  const me = session.user.id;
  if (booking.travelerId !== me && booking.local.userId !== me) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: { bookingId, senderId: me, body: body.trim() },
    include: { sender: { select: { name: true, image: true } } },
  });

  // Broadcast to subscribers (the other party's open chat tab)
  try {
    const supabase = getSupabaseServer();
    await supabase
      .channel(channelForBooking(bookingId))
      .send({
        type: "broadcast",
        event: "message",
        payload: {
          id: message.id,
          body: message.body,
          senderId: message.senderId,
          senderName: message.sender.name ?? "user",
          senderImage: message.sender.image,
          createdAt: message.createdAt.toISOString(),
        },
      });
  } catch {
    // Broadcast failures shouldn't fail the POST — message is still persisted.
    // The other side will pick it up on next page load.
  }

  return NextResponse.json({
    id: message.id,
    body: message.body,
    senderId: message.senderId,
    senderName: message.sender.name ?? "user",
    senderImage: message.sender.image,
    createdAt: message.createdAt.toISOString(),
  });
}
