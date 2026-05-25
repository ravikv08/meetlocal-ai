// v1 launch market — Bay Area only.
// Scoped down 2026-05-24 to a single city: founder lives in SFO, has 10
// friends as recruitable locals, and one-city focus is the right MVP
// posture (Airbnb did SF, Uber did SF; you only spread once a beachhead
// is at ~20 active locals + 200 completed meetups). Miami is V2 (Akhil
// is the planned beachhead there; he stays in 'pending' until V2 ships).
// Tampa + Portland (ME) deferred indefinitely until demand signals.
// Seed data for all deprecated cities still lives in prisma/seed.ts and
// the DB, but is paused — never surfaces in discovery / reels / city pages.
export const CITIES = [
  { slug: "bay-area", name: "Bay Area", state: "CA", tz: "America/Los_Angeles" },
] as const;

export type CitySlug = (typeof CITIES)[number]["slug"];

export const CATEGORIES = [
  { id: "food", label: "Food", blurb: "Hole-in-the-walls, family kitchens, late-night counters" },
  { id: "nightlife", label: "Nightlife", blurb: "Bars without signs, rooftops with views" },
  { id: "outdoors", label: "Outdoors", blurb: "Beaches, trails, sunset spots" },
  { id: "culture", label: "Culture", blurb: "Museums, galleries, history walks" },
  { id: "music", label: "Music", blurb: "Live shows, vinyl shops, local scenes" },
  { id: "founders", label: "Founders", blurb: "Coffee with the people building the city" },
  { id: "drive", label: "Drive & day trips", blurb: "Outside the city, with someone who knows the way" },
  { id: "hidden", label: "Hidden favorites", blurb: "Where locals actually go on a Tuesday" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// Residency tiers — colored badge on cards & profile
export const RESIDENCY = {
  native: { label: "Born & raised", short: "Native", desc: "Born in this city" },
  rooted: { label: "10+ yrs local", short: "Rooted", desc: "10+ years living here" },
  seasoned: { label: "3–10 yrs here", short: "Seasoned", desc: "Long-term resident" },
  newlocal: { label: "New local", short: "New", desc: "Recently moved" },
} as const;

export type ResidencyTier = keyof typeof RESIDENCY;
