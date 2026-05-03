import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Profile resolves intelligently:
//  - signed out → /signin
//  - has an active LocalProfile → that profile's public page
//  - signed in but no LocalProfile → /trips (their account view)
export default async function ProfileRedirect() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/profile");

  const profile = await prisma.localProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
  });
  if (profile && profile.status === "active") {
    redirect(`/local/${profile.id}`);
  }
  redirect("/trips");
}
