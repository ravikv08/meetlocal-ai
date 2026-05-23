// Pause @meetlocal.ai seed locals ONLY in cities where at least one real
// (non-@meetlocal.ai) local is already active. This preserves marketplace
// coverage in cities with no real locals yet (empty discovery > fake demos
// for a visitor, but fake demos > empty for a city with no real options).
//
// Idempotent: re-run anytime a real local is approved in a new city to
// auto-pause that city's seed fillers. Dry-run by default; --commit to apply.
//
//   npx tsx scripts/pause-seed-locals.ts            # dry-run
//   npx tsx scripts/pause-seed-locals.ts --commit   # apply
//   npx tsx scripts/pause-seed-locals.ts --force --commit
//                                                   # ignore the per-city
//                                                   # guard and pause every
//                                                   # active seed everywhere

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const commit = process.argv.includes("--commit");
  const force = process.argv.includes("--force");

  const active = await prisma.localProfile.findMany({
    where: { status: "active" },
    include: { user: { select: { email: true, name: true } } },
    orderBy: [{ city: "asc" }, { createdAt: "asc" }],
  });

  const isSeed = (email: string) => email.endsWith("@meetlocal.ai");
  const byCity = new Map<string, { seeds: typeof active; reals: typeof active }>();
  for (const l of active) {
    const c = l.city;
    if (!byCity.has(c)) byCity.set(c, { seeds: [], reals: [] });
    const bucket = byCity.get(c)!;
    if (isSeed(l.user.email)) bucket.seeds.push(l);
    else bucket.reals.push(l);
  }

  const toPause: typeof active = [];
  const kept: { city: string; count: number; reason: string }[] = [];

  console.log("\nPer-city active-locals breakdown:\n");
  for (const [city, b] of [...byCity.entries()].sort()) {
    const hasReal = b.reals.length > 0;
    const willPause = force || hasReal;
    console.log(
      `  ${city.padEnd(14)} seeds=${b.seeds.length}  real=${b.reals.length}  ${
        b.seeds.length === 0
          ? "(nothing to pause)"
          : willPause
            ? "→ pause seeds"
            : "→ keep seeds (no real coverage yet)"
      }`,
    );
    if (willPause && b.seeds.length > 0) toPause.push(...b.seeds);
    else if (!willPause && b.seeds.length > 0) {
      kept.push({
        city,
        count: b.seeds.length,
        reason: "no real active local in this city yet",
      });
    }
  }

  console.log(`\nWould pause ${toPause.length} seed locals:`);
  for (const l of toPause) {
    console.log(`  ${l.user.email.padEnd(40)} ${l.city}`);
  }
  if (kept.length) {
    console.log(
      `\nKept active (${kept.reduce((n, k) => n + k.count, 0)} seeds across ${kept.length} cities):`,
    );
    for (const k of kept) console.log(`  ${k.city.padEnd(14)} ${k.count} seeds — ${k.reason}`);
    console.log(
      "\nApprove a real local in those cities then re-run; they'll auto-pause.",
    );
  }

  if (!commit) {
    console.log("\nDry run. Re-run with --commit to apply.\n");
    return;
  }
  if (toPause.length === 0) {
    console.log("\nNothing to do.\n");
    return;
  }

  const result = await prisma.localProfile.updateMany({
    where: { id: { in: toPause.map((l) => l.id) }, status: "active" },
    data: { status: "paused" },
  });
  console.log(`\nPaused ${result.count} seed locals.\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
