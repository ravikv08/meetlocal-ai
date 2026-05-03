"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail, applicationApprovedTemplate } from "@/lib/email";
import type { LocalStatus } from "@prisma/client";

const ALLOWED: LocalStatus[] = ["pending", "active", "paused", "removed"];
const ALLOWED_FLAGS = ["idVerified", "bgChecked"] as const;
type VerificationFlag = (typeof ALLOWED_FLAGS)[number];

export async function setLocalStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("forbidden");
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LocalStatus;
  if (!id || !ALLOWED.includes(status)) {
    throw new Error("invalid input");
  }

  const previous = await prisma.localProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!previous) throw new Error("not found");

  await prisma.localProfile.update({ where: { id }, data: { status } });

  // Welcome the local on first activation
  if (
    previous.status === "pending" &&
    status === "active" &&
    previous.user.email
  ) {
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    await sendEmail({
      to: previous.user.email,
      ...applicationApprovedTemplate({
        name: previous.user.name ?? "there",
        profileUrl: `${baseUrl}/local/${id}`,
      }),
    });
  }

  revalidatePath("/admin/locals");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setVerificationFlag(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    throw new Error("forbidden");
  }
  const id = String(formData.get("id") ?? "");
  const flag = String(formData.get("flag") ?? "") as VerificationFlag;
  const value = String(formData.get("value") ?? "") === "true";
  if (!id || !ALLOWED_FLAGS.includes(flag)) {
    throw new Error("invalid input");
  }

  await prisma.localProfile.update({
    where: { id },
    data: { [flag]: value },
  });

  revalidatePath(`/admin/locals/${id}`);
  revalidatePath("/admin/locals");
  revalidatePath(`/local/${id}`);
}
