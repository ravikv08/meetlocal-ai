// One-off: create a Stripe Identity verification session, mark it verified
// via test_helpers, and let Stripe fire the resulting webhook to our endpoint.
// Equivalent of clicking "Send test events" in the Stripe Dashboard, but does
// it end-to-end so the session and event are both real.
//
// Usage: npx tsx scripts/test-identity-webhook.ts <localProfileId>

import { stripe } from "../src/lib/stripe";

async function main() {
  if (!stripe) {
    console.error("STRIPE_SECRET_KEY not set — check .env");
    process.exit(1);
  }

  const profileId = process.argv[2];
  if (!profileId) {
    console.error(
      "Usage: npx tsx scripts/test-identity-webhook.ts <localProfileId>",
    );
    process.exit(1);
  }

  console.log("1. Creating identity.verificationSession with metadata...");
  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: { localProfileId: profileId },
    options: {
      document: { require_matching_selfie: true, require_live_capture: true },
    },
  });
  console.log(`   ✓ ${session.id} (state: ${session.status})`);

  console.log("2. Calling test_helpers.verify to instant-transition to verified...");
  // The /v1/test_helpers/identity/verification_sessions/{id}/verify endpoint
  // transitions the session to "verified" AND fires the corresponding webhook
  // event. Test-mode only. SDK doesn't expose this in our version, so raw call.
  const secret = process.env.STRIPE_SECRET_KEY!;
  const res = await fetch(
    `https://api.stripe.com/v1/test_helpers/identity/verification_sessions/${session.id}/verify`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Stripe-Version": "2024-12-18.acacia",
      },
    },
  );
  const body = (await res.json()) as { id?: string; status?: string; error?: { message?: string } };
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${body.error?.message ?? JSON.stringify(body)}`);
  }
  console.log(`   ✓ ${body.id} (state: ${body.status})`);

  console.log("");
  console.log(
    "Stripe will fire identity.verification_session.verified → our webhook in ~1-3 seconds.",
  );
  console.log("Check the result in Stripe Dashboard → Workbench → Webhooks →");
  console.log("fascinating-bliss → Event deliveries tab. You want a 200 row.");
  console.log("");
  console.log(`Session id: ${body.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
