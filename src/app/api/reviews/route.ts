import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Two-way reviews: stored hidden until BOTH parties have submitted, at which
// point we flip both rows visible in a single transaction.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { bookingId, subjectId, rating, body } = (await req.json()) as {
    bookingId?: string;
    subjectId?: string;
    rating?: number;
    body?: string | null;
  };

  if (!bookingId || !subjectId || !rating) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "invalid rating" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { travelerId: true, local: { select: { userId: true } } },
  });
  if (!booking) return NextResponse.json({ error: "not found" }, { status: 404 });

  const me = session.user.id;
  const isTraveler = booking.travelerId === me;
  const isLocal = booking.local.userId === me;
  if (!isTraveler && !isLocal) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // Subject must be the counterpart
  const expectedSubject = isTraveler ? booking.local.userId : booking.travelerId;
  if (subjectId !== expectedSubject) {
    return NextResponse.json({ error: "invalid subject" }, { status: 400 });
  }

  const created = await prisma.review.upsert({
    where: { bookingId_authorId: { bookingId, authorId: me } },
    create: {
      bookingId,
      authorId: me,
      subjectId,
      rating,
      body: body ?? null,
    },
    update: { rating, body: body ?? null },
  });

  // If counterpart already reviewed, flip both visible.
  const counterpartReview = await prisma.review.findFirst({
    where: { bookingId, authorId: { not: me } },
  });
  if (counterpartReview) {
    await prisma.$transaction([
      prisma.review.update({ where: { id: created.id }, data: { visible: true } }),
      prisma.review.update({
        where: { id: counterpartReview.id },
        data: { visible: true },
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
