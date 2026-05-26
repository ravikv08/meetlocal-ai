"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Toggle a host's availability between active (taking requests) and paused
// (temporarily off the market). Guarded so we never resurrect a removed or
// still-pending profile via this path — founder-managed states stay sticky.
export async function setHostAvailability(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorized");
  const desired = String(formData.get("status") ?? "");
  if (desired !== "active" && desired !== "paused") {
    throw new Error("invalid status");
  }
  await prisma.localProfile.updateMany({
    where: {
      userId: session.user.id,
      status: { in: ["active", "paused"] },
    },
    data: { status: desired },
  });
  revalidatePath("/host");
}
