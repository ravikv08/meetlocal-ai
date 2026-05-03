"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CITIES, CATEGORIES } from "@/lib/cities";

const ALLOWED_RESIDENCY = ["native", "rooted", "seasoned", "newlocal"] as const;
const VALID_CITIES = new Set<string>(CITIES.map((c) => c.slug));
const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

export async function createLocalAsAdmin(formData: FormData) {
  const session = await auth();
  if (!session?.user?.isAdmin) return { error: "Forbidden." };

  const mode = String(formData.get("mode") ?? "existing");
  const city = String(formData.get("city") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const ratePerHourDollars = Number(formData.get("ratePerHour") ?? 0);
  const residency = String(formData.get("residency") ?? "");
  const yearsInCity = Number(formData.get("yearsInCity") ?? 0);
  const photoUrl = String(formData.get("photoUrl") ?? "").trim() || null;
  const tags = formData
    .getAll("tags")
    .map(String)
    .filter((t) => VALID_CATEGORIES.has(t));
  const languages = formData.getAll("languages").map(String).filter(Boolean);
  const activate = String(formData.get("activate") ?? "") === "1";

  if (!VALID_CITIES.has(city)) return { error: "Invalid city." };
  if (!neighborhood) return { error: "Neighborhood required." };
  if (tagline.length < 10) return { error: "Tagline too short." };
  if (bio.length < 40) return { error: "Bio is a bit short." };
  if (!ratePerHourDollars || ratePerHourDollars < 15)
    return { error: "Rate must be at least $15/hr." };
  if (!ALLOWED_RESIDENCY.includes(residency as (typeof ALLOWED_RESIDENCY)[number])) {
    return { error: "Pick a residency option." };
  }
  if (yearsInCity < 0 || yearsInCity > 100) {
    return { error: "Years in city looks off." };
  }
  if (tags.length === 0) return { error: "Pick at least one category." };
  if (languages.length === 0) return { error: "Pick at least one language." };

  // Resolve which user this LocalProfile attaches to.
  let userId: string;
  if (mode === "new") {
    const newName = String(formData.get("newName") ?? "").trim();
    const newEmail = String(formData.get("newEmail") ?? "").trim().toLowerCase();
    if (!newName || !newEmail) return { error: "Name and email required." };

    const existing = await prisma.user.findUnique({ where: { email: newEmail } });
    if (existing) {
      // If they already have a LocalProfile, fail; else attach.
      const existingProfile = await prisma.localProfile.findUnique({
        where: { userId: existing.id },
      });
      if (existingProfile) {
        return { error: "That user already has a local profile." };
      }
      userId = existing.id;
    } else {
      const created = await prisma.user.create({
        data: { email: newEmail, name: newName },
      });
      userId = created.id;
    }
  } else {
    const candidateUserId = String(formData.get("userId") ?? "");
    if (!candidateUserId) return { error: "Pick a user." };
    const existingProfile = await prisma.localProfile.findUnique({
      where: { userId: candidateUserId },
    });
    if (existingProfile) {
      return { error: "That user already has a local profile." };
    }
    userId = candidateUserId;
  }

  const profile = await prisma.localProfile.create({
    data: {
      userId,
      city,
      neighborhood,
      tagline,
      bio,
      ratePerHour: Math.round(ratePerHourDollars * 100),
      languages,
      tags,
      residency: residency as (typeof ALLOWED_RESIDENCY)[number],
      yearsInCity,
      photoUrl,
      status: activate ? "active" : "pending",
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/locals");
  redirect(`/admin/locals?status=${profile.status}`);
}
