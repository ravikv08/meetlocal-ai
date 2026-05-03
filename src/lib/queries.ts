import { prisma } from "@/lib/prisma";
import type { CategoryId, CitySlug } from "@/lib/cities";

export interface DiscoverFilters {
  city?: CitySlug;
  /** Multi-select vibes — local matches if ANY of their tags overlap. */
  vibes?: CategoryId[];
  englishOnly?: boolean;
  underThirty?: boolean; // <$30/hr
  rootedOnly?: boolean; // native | rooted residency
}

export async function listActiveLocals(filters: DiscoverFilters = {}) {
  const locals = await prisma.localProfile.findMany({
    where: {
      status: "active",
      city: filters.city,
      tags: filters.vibes && filters.vibes.length > 0
        ? { hasSome: filters.vibes }
        : undefined,
      languages: filters.englishOnly ? { has: "EN" } : undefined,
      ratePerHour: filters.underThirty ? { lt: 3000 } : undefined,
      residency: filters.rootedOnly ? { in: ["native", "rooted"] } : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  // Hydrate with review aggregates (1 query, then map)
  const ids = locals.map((l) => l.userId);
  const stats = ids.length
    ? await prisma.review.groupBy({
        by: ["subjectId"],
        where: { subjectId: { in: ids }, visible: true },
        _avg: { rating: true },
        _count: { rating: true },
      })
    : [];
  const byUser = new Map(stats.map((s) => [s.subjectId, s]));

  return locals.map((l) => ({
    ...l,
    rating: byUser.get(l.userId)?._avg.rating ?? null,
    reviewCount: byUser.get(l.userId)?._count.rating ?? 0,
  }));
}

export async function getLocalById(id: string) {
  const local = await prisma.localProfile.findUnique({
    where: { id, status: "active" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
  if (!local) return null;

  const [stats, reviews] = await Promise.all([
    prisma.review.aggregate({
      where: { subjectId: local.userId, visible: true },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { subjectId: local.userId, visible: true },
      include: { author: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    ...local,
    rating: stats._avg.rating,
    reviewCount: stats._count.rating,
    reviews,
  };
}

export async function listMeetingSpots(city: CitySlug) {
  return prisma.meetingSpot.findMany({
    where: { city },
    orderBy: [{ popular: "desc" }, { name: "asc" }],
  });
}
