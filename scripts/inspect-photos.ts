// Quick audit: which active locals have a photo, which don't?
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const active = await prisma.localProfile.findMany({
    where: { status: "active" },
    include: { user: { select: { name: true, email: true, image: true } } },
    orderBy: { updatedAt: "desc" },
  });
  console.log(`\nActive locals: ${active.length}\n`);
  let withPhoto = 0, withoutPhoto = 0;
  for (const l of active) {
    const photoSrc = l.photoUrl ?? l.user.image ?? null;
    const status = photoSrc ? "✓" : "✗";
    if (photoSrc) withPhoto++; else withoutPhoto++;
    console.log(`  ${status} ${(l.user.name ?? "?").padEnd(24)} ${l.user.email.padEnd(40)} photoUrl=${l.photoUrl ? "Y" : "N"} userImage=${l.user.image ? "Y" : "N"}`);
  }
  console.log(`\nSummary: ${withPhoto} with photo · ${withoutPhoto} without\n`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
