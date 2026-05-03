import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BookingActionBar } from "@/components/BookingActionBar";
import { ChatRoom } from "./ChatRoom";

interface MessagesPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { bookingId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/signin?from=${encodeURIComponent(`/messages/${bookingId}`)}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      traveler: { select: { id: true, name: true, image: true } },
      local: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      meetingSpot: true,
      messages: {
        include: { sender: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!booking) notFound();

  const me = session.user.id;
  const isTraveler = booking.travelerId === me;
  const isLocal = booking.local.userId === me;
  if (!isTraveler && !isLocal) notFound();

  const counterpart = isTraveler ? booking.local.user : booking.traveler;

  return (
    <ChatRoom
      bookingId={booking.id}
      bookingStatus={booking.status}
      hours={booking.hours}
      totalAmount={booking.totalAmount}
      scheduledFor={booking.scheduledFor?.toISOString() ?? null}
      meetingSpotName={booking.meetingSpot?.name ?? null}
      currentUserId={me}
      currentUserName={session.user.name ?? "you"}
      currentUserImage={session.user.image ?? null}
      counterpart={{
        id: counterpart.id,
        name: counterpart.name ?? "Local",
        image: counterpart.image,
      }}
      role={isTraveler ? "traveler" : "local"}
      initialMessages={booking.messages.map((m) => ({
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        senderName: m.sender.name ?? "user",
        senderImage: m.sender.image,
        createdAt: m.createdAt.toISOString(),
      }))}
      actionBar={
        <BookingActionBar
          bookingId={booking.id}
          status={booking.status}
          role={isTraveler ? "traveler" : "local"}
          hasStripePayment={!!booking.stripePaymentIntentId}
        />
      }
    />
  );
}
