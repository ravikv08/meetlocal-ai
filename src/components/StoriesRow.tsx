import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";

// Horizontal Instagram-style story strip. Pulls all unexpired stories ordered
// by newest first, deduped by author so each person shows only once.
export async function StoriesRow() {
  const cutoff = new Date();
  const rows = await prisma.story.findMany({
    where: { expiresAt: { gt: cutoff } },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Dedupe by user — show only the freshest story per author.
  const seen = new Set<string>();
  const stories = rows.filter((s) => {
    if (seen.has(s.userId)) return false;
    seen.add(s.userId);
    return true;
  });

  if (stories.length === 0) return null;

  return (
    <section className="px-14 pt-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
        Stories · last 24h
      </div>
      <div className="scroll-hide mt-3 flex gap-4 overflow-x-auto pb-1">
        {stories.map((s) => (
          <StoryThumb
            key={s.id}
            href={s.imageUrl}
            name={s.user.name ?? "Local"}
            avatarUrl={s.user.image}
          />
        ))}
      </div>
    </section>
  );
}

function StoryThumb({
  href,
  name,
  avatarUrl,
}: {
  href: string;
  name: string;
  avatarUrl: string | null;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex shrink-0 flex-col items-center gap-1.5"
      style={{ width: 72 }}
    >
      <span
        aria-hidden
        className="grad-sunset block rounded-full p-[2px] transition hover:scale-105"
      >
        <span className="block rounded-full bg-bg p-[2px]">
          <Avatar name={name} size={56} imageUrl={avatarUrl} />
        </span>
      </span>
      <span className="max-w-full truncate text-center text-xs text-text-dim">
        {name.split(" ")[0]}
      </span>
    </Link>
  );
}
