import { z } from "zod";
import { CITIES, CATEGORIES } from "@/lib/cities";

// Single source of truth for "what makes a valid local profile". Used by:
//   • react-hook-form on the apply + admin-create forms (client-side validation)
//   • server actions (server-side validation before DB write)
//   • future REST API at /api/v1/applications (mobile-callable)
// Keeping schemas in their own file (no Prisma imports) ensures forms can
// import them without the bundler dragging server-only deps into the client.

const VALID_CITIES = new Set<string>(CITIES.map((c) => c.slug));
const VALID_CATEGORIES = new Set<string>(CATEGORIES.map((c) => c.id));

export const RESIDENCY_VALUES = [
  "native",
  "rooted",
  "seasoned",
  "newlocal",
] as const;
export type Residency = (typeof RESIDENCY_VALUES)[number];

// Mirror of Prisma's LocalStatus enum. Hardcoded so this file stays
// client-safe; if you change it, update prisma/schema.prisma too.
export const LOCAL_STATUS_VALUES = [
  "pending",
  "active",
  "paused",
  "removed",
] as const;
export type LocalStatusLiteral = (typeof LOCAL_STATUS_VALUES)[number];

export const VERIFICATION_FLAG_VALUES = ["idVerified", "bgChecked"] as const;
export type VerificationFlag = (typeof VERIFICATION_FLAG_VALUES)[number];

// Shared "core" fields between the apply flow and admin-create. Money is in
// dollars at the boundary, converted to cents before DB write per CLAUDE.md.
export const LocalProfileCoreSchema = z.object({
  city: z.string().refine((v) => VALID_CITIES.has(v), "Invalid city."),
  neighborhood: z.string().trim().min(1, "Neighborhood required."),
  tagline: z.string().trim().min(10, "Tagline too short."),
  bio: z.string().trim().min(40, "Bio is a bit short — tell us more."),
  ratePerHourDollars: z.number().min(15, "Rate must be at least $15/hr."),
  residency: z.enum(RESIDENCY_VALUES, { message: "Pick a residency option." }),
  yearsInCity: z
    .number()
    .int()
    .min(0)
    .max(100, "Years in city looks off."),
  tags: z
    .array(z.string().refine((t) => VALID_CATEGORIES.has(t)))
    .min(1, "Pick at least one category."),
  languages: z.array(z.string().min(1)).min(1, "Pick at least one language."),
  photoUrl: z.string().nullable().optional(),
});
export type LocalProfileCoreInput = z.infer<typeof LocalProfileCoreSchema>;

// Apply-flow extras: KYC + optional social links.
export const LocalApplicationSchema = LocalProfileCoreSchema.extend({
  // Accept ISO date string; runtime check confirms 18 ≤ age ≤ 110.
  dateOfBirth: z
    .string()
    .min(1, "Date of birth required for verification.")
    .refine((s) => {
      const d = new Date(s);
      if (Number.isNaN(d.getTime())) return false;
      const years =
        (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return years >= 18 && years <= 110;
    }, "You must be 18+ with a valid date of birth."),
  governmentIdUrl: z
    .string()
    .min(1, "Upload a photo of your government-issued ID."),
  selfieUrl: z
    .string()
    .min(1, "Take a live selfie so we can match you to your ID."),
  instagramHandle: z.string().nullable().optional(),
  twitterHandle: z.string().nullable().optional(),
  snapchatHandle: z.string().nullable().optional(),
  facebookUrl: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  lumaUrl: z.string().nullable().optional(),
  websiteUrl: z.string().nullable().optional(),
});
export type LocalApplicationInput = z.infer<typeof LocalApplicationSchema>;

// Admin-create has two modes: attach to an existing user, or invite a new one.
export const AdminCreateLocalSchema = z.discriminatedUnion("mode", [
  LocalProfileCoreSchema.extend({
    mode: z.literal("existing"),
    userId: z.string().min(1, "Pick a user."),
    activate: z.boolean(),
  }),
  LocalProfileCoreSchema.extend({
    mode: z.literal("new"),
    newName: z.string().trim().min(1, "Name required."),
    newEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email("Valid email required."),
    activate: z.boolean(),
  }),
]);
export type AdminCreateLocalInput = z.infer<typeof AdminCreateLocalSchema>;

// Admin status / verification toggles (very small schemas, but they live here
// so all "local" boundary validation has one home).
export const SetLocalStatusSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(LOCAL_STATUS_VALUES),
});
export type SetLocalStatusInput = z.infer<typeof SetLocalStatusSchema>;

export const SetVerificationFlagSchema = z.object({
  id: z.string().trim().min(1),
  flag: z.enum(VERIFICATION_FLAG_VALUES),
  value: z.boolean(),
});
export type SetVerificationFlagInput = z.infer<
  typeof SetVerificationFlagSchema
>;
