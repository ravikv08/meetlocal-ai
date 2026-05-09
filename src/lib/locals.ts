import type { LocalProfile } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendEmail,
  applicationApprovedTemplate,
  applicationReceivedTemplate,
} from "@/lib/email";
import type {
  AdminCreateLocalInput,
  LocalApplicationInput,
  SetLocalStatusInput,
  SetVerificationFlagInput,
} from "@/lib/schemas/local";

// Pure business logic for the LocalProfile lifecycle: apply, admin-create,
// status changes, verification flags. Validation lives in the Zod schemas
// (src/lib/schemas/local.ts); these functions assume input is already valid.
// Server actions and future REST/mobile API routes both call into this lib.

const HANDLE_RE = /^[A-Za-z0-9._]{1,30}$/;

function normalizeHandle(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().replace(/^@/, "");
  if (!trimmed) return null;
  return HANDLE_RE.test(trimmed) ? trimmed : null;
}

function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
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

// ── Application flow: a signed-in user applies to be a local ────────────────

export interface SubmitApplicationContext {
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  /** Founder admins notified on submission. */
  adminEmails: string[];
  input: LocalApplicationInput;
}

export async function submitLocalApplication(
  ctx: SubmitApplicationContext,
): Promise<{ profile: LocalProfile }> {
  const i = ctx.input;

  const profile = await prisma.localProfile.create({
    data: {
      userId: ctx.userId,
      city: i.city,
      neighborhood: i.neighborhood,
      tagline: i.tagline,
      bio: i.bio,
      ratePerHour: Math.round(i.ratePerHourDollars * 100),
      languages: i.languages,
      tags: i.tags,
      residency: i.residency,
      yearsInCity: i.yearsInCity,
      photoUrl: i.photoUrl ?? null,
      status: "pending",
      dateOfBirth: new Date(i.dateOfBirth),
      governmentIdUrl: i.governmentIdUrl,
      selfieUrl: i.selfieUrl,
      instagramHandle: normalizeHandle(i.instagramHandle),
      twitterHandle: normalizeHandle(i.twitterHandle),
      snapchatHandle: normalizeHandle(i.snapchatHandle),
      facebookUrl: normalizeUrl(i.facebookUrl),
      linkedinUrl: normalizeUrl(i.linkedinUrl),
      lumaUrl: normalizeUrl(i.lumaUrl),
      websiteUrl: normalizeUrl(i.websiteUrl),
    },
  });

  for (const adminEmail of ctx.adminEmails) {
    await sendEmail({
      to: adminEmail,
      ...applicationReceivedTemplate({
        name: ctx.userName ?? ctx.userEmail ?? "Someone",
      }),
    });
  }

  return { profile };
}

// ── Admin: create a LocalProfile (attach to existing user, or invite new) ───

export async function createLocalProfileAsAdmin(
  input: AdminCreateLocalInput,
): Promise<{ profile: LocalProfile }> {
  let userId: string;

  if (input.mode === "new") {
    const existing = await prisma.user.findUnique({
      where: { email: input.newEmail },
    });
    if (existing) {
      const existingProfile = await prisma.localProfile.findUnique({
        where: { userId: existing.id },
      });
      if (existingProfile) {
        throw new Error("That user already has a local profile.");
      }
      userId = existing.id;
    } else {
      const created = await prisma.user.create({
        data: { email: input.newEmail, name: input.newName },
      });
      userId = created.id;
    }
  } else {
    const existingProfile = await prisma.localProfile.findUnique({
      where: { userId: input.userId },
    });
    if (existingProfile) {
      throw new Error("That user already has a local profile.");
    }
    userId = input.userId;
  }

  const profile = await prisma.localProfile.create({
    data: {
      userId,
      city: input.city,
      neighborhood: input.neighborhood,
      tagline: input.tagline,
      bio: input.bio,
      ratePerHour: Math.round(input.ratePerHourDollars * 100),
      languages: input.languages,
      tags: input.tags,
      residency: input.residency,
      yearsInCity: input.yearsInCity,
      photoUrl: input.photoUrl ?? null,
      status: input.activate ? "active" : "pending",
    },
  });

  return { profile };
}

// ── Admin: status & verification toggles ────────────────────────────────────

export interface SetLocalStatusContext {
  input: SetLocalStatusInput;
  /** Used to build the welcome-email profile link. */
  baseUrl: string;
}

export async function setLocalProfileStatus(ctx: SetLocalStatusContext) {
  const { id, status } = ctx.input;

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
    await sendEmail({
      to: previous.user.email,
      ...applicationApprovedTemplate({
        name: previous.user.name ?? "there",
        profileUrl: `${ctx.baseUrl}/local/${id}`,
      }),
    });
  }
}

export async function setLocalVerificationFlag(input: SetVerificationFlagInput) {
  await prisma.localProfile.update({
    where: { id: input.id },
    data: { [input.flag]: input.value },
  });
}
