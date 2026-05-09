"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  setLocalProfileStatus,
  setLocalVerificationFlag,
} from "@/lib/locals";
import {
  SetLocalStatusSchema,
  SetVerificationFlagSchema,
} from "@/lib/schemas/local";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) throw new Error("forbidden");
}

export async function setLocalStatus(formData: FormData) {
  await requireAdmin();
  const parsed = SetLocalStatusSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    status: String(formData.get("status") ?? ""),
  });
  if (!parsed.success) throw new Error("invalid input");

  await setLocalProfileStatus({
    input: parsed.data,
    baseUrl: process.env.AUTH_URL ?? "http://localhost:3000",
  });

  revalidatePath("/admin/locals");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setVerificationFlag(formData: FormData) {
  await requireAdmin();
  const parsed = SetVerificationFlagSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    flag: String(formData.get("flag") ?? ""),
    value: String(formData.get("value") ?? "") === "true",
  });
  if (!parsed.success) throw new Error("invalid input");

  await setLocalVerificationFlag(parsed.data);

  revalidatePath(`/admin/locals/${parsed.data.id}`);
  revalidatePath("/admin/locals");
  revalidatePath(`/local/${parsed.data.id}`);
}
