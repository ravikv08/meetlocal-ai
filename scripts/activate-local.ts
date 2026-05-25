// One-off: approve a LocalProfile end-to-end, simulating what the admin UI
// does (Mark ID verified + Activate). Sends the welcome email via the
// existing setLocalProfileStatus helper so the code path is identical.
//
// Usage:
//   npx tsx scripts/activate-local.ts <localProfileId>
//   npx tsx scripts/activate-local.ts <localProfileId> --commit
//
// Dry-run by default — shows what would change without writing.

import { PrismaClient } from "@prisma/client";
import { setLocalProfileStatus } from "../src/lib/locals";

const prisma = new PrismaClient();

async function main() {
  const id = process.argv[2];
  const commit = process.argv.includes("--commit");

  if (!id || id.startsWith("--")) {
    console.error("Usage: npx tsx scripts/activate-local.ts <id> [--commit]");
    process.exit(1);
  }

  const profile = await prisma.localProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!profile) {
    console.error(`No LocalProfile with id ${id}`);
    process.exit(1);
  }

  console.log("\nFound profile:");
  console.log(`  Name:        ${profile.user.name ?? "(no name)"}`);
  console.log(`  Email:       ${profile.user.email ?? "(no email)"}`);
  console.log(`  City:        ${profile.city}`);
  console.log(`  Status:      ${profile.status}`);
  console.log(`  idVerified:  ${profile.idVerified}`);
  console.log(`  isFounding:  ${profile.isFounding}`);
  console.log(
    `  Stripe IV:   ${profile.stripeIdentityVerificationId ?? "(none)"}`,
  );

  console.log("\nWill do:");
  if (!profile.idVerified) console.log("  • set idVerified = true");
  if (profile.status !== "active")
    console.log(
      `  • set status = active (was ${profile.status})  → triggers welcome email to ${profile.user.email ?? "(no email)"}`,
    );
  if (profile.idVerified && profile.status === "active") {
    console.log("  • nothing to do — already verified + active");
  }

  if (!commit) {
    console.log("\nDry run. Re-run with --commit to apply.\n");
    return;
  }

  if (!profile.idVerified) {
    await prisma.localProfile.update({
      where: { id },
      data: { idVerified: true },
    });
    console.log("✓ idVerified flipped to true");
  }

  if (profile.status !== "active") {
    // Uses the same helper as the admin UI — same DB update path AND same
    // welcome-email trigger via Resend. baseUrl is used to build the
    // profile-link in the email body.
    await setLocalProfileStatus({
      input: { id, status: "active" },
      baseUrl: "https://meetlocal-ai.vercel.app",
    });
    console.log("✓ status flipped to active + welcome email sent");
  }

  console.log("\nDone.\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
