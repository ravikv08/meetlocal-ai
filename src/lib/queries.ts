import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CategoryId, CitySlug } from "@/lib/cities";

export interface DiscoverFilters {
  city?: CitySlug;
  /** Multi-city alternative to `city`. Use for "all launch cities" queries
   *  on the homepage so deprecated-city locals don't leak in. */
  cities?: readonly CitySlug[];
  /** Require a profile photo (photoUrl or user.image). Used by the home
   *  featured-locals grid so photo-less seeds can't sneak into the trust
   *  surface. */
  hasPhoto?: boolean;
  /** Multi-select vibes — local matches if ANY of their tags overlap. */
  vibes?: CategoryId[];
  englishOnly?: boolean;
  underThirty?: boolean; // <$30/hr
  rootedOnly?: boolean; // native | rooted residency
}

export async function listActiveLocals(filters: DiscoverFilters = {}) {
  const where: Prisma.LocalProfileWhereInput = {
    status: "active",
    city: filters.cities ? { in: [...filters.cities] } : filters.city,
    tags: filters.vibes && filters.vibes.length > 0
      ? { hasSome: filters.vibes }
      : undefined,
    languages: filters.englishOnly ? { has: "EN" } : undefined,
    ratePerHour: filters.underThirty ? { lt: 3000 } : undefined,
    residency: filters.rootedOnly ? { in: ["native", "rooted"] } : undefined,
  };
  if (filters.hasPhoto) {
    // OR across LocalProfile.photoUrl + User.image — either counts as "has
    // a face the homepage can render."
    where.OR = [
      { photoUrl: { not: null } },
      { user: { is: { image: { not: null } } } },
    ];
  }

  const locals = await prisma.localProfile.findMany({
    where,
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
