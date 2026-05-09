"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { CATEGORIES } from "@/lib/cities";
import { createLocalProfileAsAdmin } from "@/lib/locals";
import { AdminCreateLocalSchema } from "@/lib/schemas/local";

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

export async function createLocalAsAdmin(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Forbidden." };

  const mode = String(formData.get("mode") ?? "existing");
  const raw = {
    mode,
    city: String(formData.get("city") ?? ""),
    neighborhood: String(formData.get("neighborhood") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    ratePerHourDollars: Number(formData.get("ratePerHour") ?? 0),
    residency: String(formData.get("residency") ?? ""),
    yearsInCity: Number(formData.get("yearsInCity") ?? 0),
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || null,
    tags: formData
      .getAll("tags")
      .map(String)
      .filter((t) => VALID_CATEGORIES.has(t)),
    languages: formData.getAll("languages").map(String).filter(Boolean),
    activate: String(formData.get("activate") ?? "") === "1",
    ...(mode === "new"
      ? {
          newName: String(formData.get("newName") ?? ""),
          newEmail: String(formData.get("newEmail") ?? ""),
        }
      : { userId: String(formData.get("userId") ?? "") }),
  };

  const parsed = AdminCreateLocalSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  let profile;
  try {
    ({ profile } = await createLocalProfileAsAdmin(parsed.data));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not create." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/locals");
  redirect(`/admin/locals?status=${profile.status}`);
}
