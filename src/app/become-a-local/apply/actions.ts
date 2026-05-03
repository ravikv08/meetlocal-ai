"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CITIES, CATEGORIES } from "@/lib/cities";
import { sendEmail, applicationReceivedTemplate } from "@/lib/email";

const ALLOWED_RESIDENCY = ["native", "rooted", "seasoned", "newlocal"] as const;
const VALID_CITIES = new Set<string>(CITIES.map((c) => c.slug));
const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

function normalizeHandle(raw: string): string | null {
  const trimmed = raw.trim().replace(/^@/, "");
  if (!trimmed) return null;
  return HANDLE_RE.test(trimmed) ? trimmed : null;
}

function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function submitApplication(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Please sign in." };
  }

  const city = String(formData.get("city") ?? "");
  const neighborhood = String(formData.get("neighborhood") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const ratePerHourDollars = Number(formData.get("ratePerHour") ?? 0);
  const residency = String(formData.get("residency") ?? "");
  const yearsInCity = Number(formData.get("yearsInCity") ?? 0);
  const photoUrlRaw = String(formData.get("photoUrl") ?? "").trim();
  const tags = formData.getAll("tags").map(String).filter((t) => VALID_CATEGORIES.has(t));
  const languages = formData.getAll("languages").map(String).filter(Boolean);

  // Identity verification
  const dateOfBirthRaw = String(formData.get("dateOfBirth") ?? "").trim();
  const governmentIdUrlRaw = String(formData.get("governmentIdUrl") ?? "").trim();
  const selfieUrlRaw = String(formData.get("selfieUrl") ?? "").trim();

  // Social links — all optional
  const instagramHandle = normalizeHandle(String(formData.get("instagramHandle") ?? ""));
  const twitterHandle = normalizeHandle(String(formData.get("twitterHandle") ?? ""));
  const snapchatHandle = normalizeHandle(String(formData.get("snapchatHandle") ?? ""));
  const facebookUrl = normalizeUrl(String(formData.get("facebookUrl") ?? ""));
  const linkedinUrl = normalizeUrl(String(formData.get("linkedinUrl") ?? ""));
  const lumaUrl = normalizeUrl(String(formData.get("lumaUrl") ?? ""));
  const websiteUrl = normalizeUrl(String(formData.get("websiteUrl") ?? ""));

  if (!VALID_CITIES.has(city)) return { error: "Invalid city." };
  if (!neighborhood) return { error: "Neighborhood required." };
  if (tagline.length < 10) return { error: "Tagline too short." };
  if (bio.length < 40) return { error: "Bio is a bit short — tell us more." };
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

  if (!dateOfBirthRaw) return { error: "Date of birth required for verification." };
  const dob = new Date(dateOfBirthRaw);
  if (Number.isNaN(dob.getTime())) return { error: "Date of birth looks invalid." };
  const ageMs = Date.now() - dob.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  if (ageYears < 18) return { error: "You must be 18 or older to host." };
  if (ageYears > 110) return { error: "Date of birth looks invalid." };

  if (!governmentIdUrlRaw) {
    return { error: "Upload a photo of your government-issued ID." };
  }
  if (!selfieUrlRaw) {
    return { error: "Take a live selfie so we can match you to your ID." };
  }

  await prisma.localProfile.create({
    data: {
      userId: session.user.id,
      city,
      neighborhood,
      tagline,
      bio,
      ratePerHour: Math.round(ratePerHourDollars * 100), // store cents
      languages,
      tags,
      residency: residency as (typeof ALLOWED_RESIDENCY)[number],
      yearsInCity,
      photoUrl: photoUrlRaw || null,
      status: "pending",
      dateOfBirth: dob,
      governmentIdUrl: governmentIdUrlRaw,
      selfieUrl: selfieUrlRaw,
      instagramHandle,
      twitterHandle,
      snapchatHandle,
      facebookUrl,
      linkedinUrl,
      lumaUrl,
      websiteUrl,
    },
  });

  // Notify founder admins
  for (const adminEmail of ADMIN_EMAILS) {
    await sendEmail({
      to: adminEmail,
      ...applicationReceivedTemplate({ name: session.user.name ?? session.user.email ?? "Someone" }),
    });
  }

  redirect("/become-a-local/apply?submitted=1");
}
