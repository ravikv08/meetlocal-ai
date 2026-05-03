import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./ReviewForm";

interface ReviewPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?from=${encodeURIComponent(`/review/${bookingId}`)}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { select: { id: true, name: true } },
      local: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  });
  if (!booking) notFound();

  const me = session.user.id;
  const isTraveler = booking.travelerId === me;
  const isLocal = booking.local.userId === me;
  if (!isTraveler && !isLocal) notFound();

  // Already reviewed?
  const existing = await prisma.review.findUnique({
    where: { bookingId_authorId: { bookingId, authorId: me } },
  });

  const subjectName = isTraveler
    ? booking.local.user.name ?? "your local"
    : booking.traveler.name ?? "your traveler";
  const subjectId = isTraveler ? booking.local.userId : booking.travelerId;

  return (
    <ReviewForm
      bookingId={bookingId}
      subjectId={subjectId}
      subjectName={subjectName}
      submittedAlready={!!existing}
      ratePerHour={booking.ratePerHour}
      hours={booking.hours}
      reviewerKind={isTraveler ? "traveler" : "local"}
    />
  );
}
