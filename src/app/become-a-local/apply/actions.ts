"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CATEGORIES } from "@/lib/cities";
import { submitLocalApplication } from "@/lib/locals";
import { LocalApplicationSchema } from "@/lib/schemas/local";

const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function submitApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in." };
  }

  const raw = {
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
    dateOfBirth: String(formData.get("dateOfBirth") ?? "").trim(),
    governmentIdUrl: String(formData.get("governmentIdUrl") ?? "").trim(),
    selfieUrl: String(formData.get("selfieUrl") ?? "").trim(),
    instagramHandle: String(formData.get("instagramHandle") ?? "") || null,
    twitterHandle: String(formData.get("twitterHandle") ?? "") || null,
    snapchatHandle: String(formData.get("snapchatHandle") ?? "") || null,
    facebookUrl: String(formData.get("facebookUrl") ?? "") || null,
    linkedinUrl: String(formData.get("linkedinUrl") ?? "") || null,
    lumaUrl: String(formData.get("lumaUrl") ?? "") || null,
    websiteUrl: String(formData.get("websiteUrl") ?? "") || null,
  };

  // Server-side enforcement of the IC agreement acceptance. The form sets
  // agreedIC=1 only when the checkbox is ticked; never trust client-only.
  const agreedIC = String(formData.get("agreedIC") ?? "") === "1";
  if (!agreedIC) {
    return {
      error: "You must accept the Local Independent Contractor Agreement.",
    };
  }

  const parsed = LocalApplicationSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await submitLocalApplication({
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    adminEmails: ADMIN_EMAILS,
    input: parsed.data,
  });

  redirect("/become-a-local/apply?submitted=1");
}
