import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createIdentityVerificationSession,
  isStripeConfigured,
} from "@/lib/stripe";

// POST /api/identity/start
// Body: { localProfileId: string }
// Returns: { url: string } — the Stripe-hosted verification URL to redirect to.
//
// Auth: caller must be the owner of the LocalProfile (or an admin). Anyone
// else gets 403. We persist the session id on the LocalProfile so the
// webhook handler in /api/stripe/webhook can look it up when the
// `identity.verification_session.verified` event fires.

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this environment." },
      { status: 501 },
    );
  }

  const { localProfileId } = (await req.json()) as { localProfileId?: string };
  if (!localProfileId) {
    return NextResponse.json(
      { error: "localProfileId required" },
      { status: 400 },
    );
  }

  const profile = await prisma.localProfile.findUnique({
    where: { id: localProfileId },
    select: { id: true, userId: true, idVerified: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const isOwner = profile.userId === session.user.id;
  if (!isOwner && !session.user.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (profile.idVerified) {
    return NextResponse.json(
      { error: "already verified" },
      { status: 409 },
    );
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const { url, sessionId } = await createIdentityVerificationSession({
    localProfileId,
    returnUrl: `${baseUrl}/become-a-local/apply?id_verification=returning`,
  });

  // Persist so the webhook can locate this profile via metadata OR via
  // the stored session id (defense in depth — webhooks can race profile
  // updates if the user closes Stripe's tab and reopens it).
  await prisma.localProfile.update({
    where: { id: localProfileId },
    data: { stripeIdentityVerificationId: sessionId },
  });

  return NextResponse.json({ url });
}
