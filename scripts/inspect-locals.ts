// Inspect current local-profile state across status + email-domain split.
// Read-only. Run with: npx tsx scripts/inspect-locals.ts

import { PrismaClient, LocalStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.localProfile.findMany({
    include: { user: { select: { email: true, name: true, createdAt: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
  });

  const isSeed = (email: string) => email.endsWith("@meetlocal.ai");
  const buckets: Record<string, { seed: number; real: number; realRows: string[] }> = {};
  for (const l of all) {
    const s = l.status as string;
    buckets[s] ??= { seed: 0, real: 0, realRows: [] };
    if (isSeed(l.user.email)) buckets[s].seed += 1;
    else {
      buckets[s].real += 1;
      buckets[s].realRows.push(
        `    ${l.user.email.padEnd(40)} ${(l.user.name ?? "—").padEnd(24)} ${l.city.padEnd(12)} (joined ${l.user.createdAt.toISOString().slice(0, 10)})`,
      );
    }
  }

  console.log("\nLocalProfile snapshot:\n");
  for (const status of Object.values(LocalStatus)) {
    const b = buckets[status] ?? { seed: 0, real: 0, realRows: [] };
    console.log(`  ${status.padEnd(10)} ${b.seed} seed · ${b.real} real`);
    for (const row of b.realRows) console.log(row);
  }
  console.log();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
