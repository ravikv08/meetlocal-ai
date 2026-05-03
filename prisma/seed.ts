// Seed v1 data: 10 vetted locals across the 4 launch cities + curated meeting
// spots per city. These are placeholder personas — replace with the founder's
// real network during onboarding. Re-runs are idempotent: existing rows with
// the same email get updated.

import { PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedLocal {
  email: string;
  name: string;
  city: string;
  neighborhood: string;
  tagline: string;
  bio: string;
  ratePerHour: number; // cents
  languages: string[];
  tags: string[];
  residency: "native" | "rooted" | "seasoned" | "newlocal";
  yearsInCity: number;
  idVerified: boolean;
  bgChecked: boolean;
  // Optional social + trust fields (added when we want a richer profile)
  instagramHandle?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  twitterHandle?: string;
  lumaUrl?: string;
  websiteUrl?: string;
  responseRate?: number;
  responseTimeMinutes?: number;
  yearsHosting?: number;
  experienceHeadline?: string;
  experienceBlurb?: string;
  careerHighlight?: string;
  education?: string;
}

const LOCALS: SeedLocal[] = [
  // Miami (3)
  {
    email: "carla.miami@meetlocal.ai",
    name: "Carla M.",
    city: "miami",
    neighborhood: "Little Havana",
    tagline: "Cuban food crawls & domino-park afternoons",
    bio: "Born in Havana, raised in Miami. I'll take you to the cafecito counters that locals actually queue at, then a salsa night at a place with no website. We'll start at Versailles, weave through Calle Ocho, end at a domino park where my uncle Tito will absolutely beat you in a round.",
    ratePerHour: 3500,
    languages: ["EN", "ES"],
    tags: ["food", "music", "hidden"],
    residency: "rooted",
    yearsInCity: 22,
    idVerified: true,
    bgChecked: true,
    instagramHandle: "carla.lh.miami",
    linkedinUrl: "https://www.linkedin.com/in/carla-m-miami",
    lumaUrl: "https://lu.ma/carla-miami",
    websiteUrl: "https://carlamiami.com",
    twitterHandle: "carlalovesmiami",
    responseRate: 100,
    responseTimeMinutes: 45,
    yearsHosting: 6,
    experienceHeadline: "6 years guiding · 220+ travelers hosted",
    experienceBlurb:
      "Took my first solo traveler through Little Havana in 2019 and never stopped. Most of my bookings are repeat or referrals.",
    careerHighlight:
      "Featured in Eater Miami's “Cuban Food the Local Way” (2024) and the Miami Herald's 36-hours-in-Miami series. Local Yelp Elite since 2021.",
    education:
      "BA in Journalism, Florida International University. Hospitality cert from Miami Dade College.",
  },
  {
    email: "diego.miami@meetlocal.ai",
    name: "Diego R.",
    city: "miami",
    neighborhood: "Wynwood",
    tagline: "Street art walks & natural-wine bars",
    bio: "Painter & gallery curator. Wynwood and Allapattah without the tour-bus version. Best for a 2-hour walk into a 1-hour wine bar.",
    ratePerHour: 4500,
    languages: ["EN", "ES", "PT"],
    tags: ["culture", "nightlife", "hidden"],
    residency: "seasoned",
    yearsInCity: 8,
    idVerified: true,
    bgChecked: false,
    instagramHandle: "diego.wynwood",
    websiteUrl: "https://diegoreyes.studio",
    twitterHandle: "diegoreyesart",
    responseRate: 96,
    responseTimeMinutes: 90,
    yearsHosting: 4,
    experienceHeadline: "4 years guiding · 140+ travelers",
    experienceBlurb:
      "Working artist and curator. I take travelers off the main Wynwood walls into the studio buildings most tour groups miss.",
    careerHighlight:
      "Curated three Wynwood Walls satellite shows. Featured in Hyperallergic and The New Tropic.",
  },
  {
    email: "priya.miami@meetlocal.ai",
    name: "Priya S.",
    city: "miami",
    neighborhood: "Brickell",
    tagline: "Founder coffee & rooftop sunsets",
    bio: "Ex-fintech, now an angel investor. Happy to host visiting founders for an afternoon of cafés, intros, and a sunset rooftop.",
    ratePerHour: 6500,
    languages: ["EN", "HI"],
    tags: ["founders", "nightlife"],
    residency: "newlocal",
    yearsInCity: 2,
    idVerified: true,
    bgChecked: true,
    linkedinUrl: "https://www.linkedin.com/in/priya-s-miami",
    twitterHandle: "priyabuilds",
    websiteUrl: "https://priya.fund",
    lumaUrl: "https://lu.ma/priya-miami",
    responseRate: 98,
    responseTimeMinutes: 30,
    yearsHosting: 1,
    experienceHeadline: "Hosted 60+ visiting founders",
    careerHighlight:
      "Angel checks in 24 companies, two now Series A. Co-host of Miami Founders Brunch (monthly).",
    education: "MS Computer Science, Stanford. BS, IIT Bombay.",
  },

  // Tampa (2)
  {
    email: "marcus.tampa@meetlocal.ai",
    name: "Marcus T.",
    city: "tampa",
    neighborhood: "Ybor City",
    tagline: "Cigar history & Cuban sandwiches",
    bio: "Third-generation Tampeño. I'll show you the original Columbia Restaurant, the cigar workshops still running, and a few rooftops most tourists never find.",
    ratePerHour: 3000,
    languages: ["EN", "ES"],
    tags: ["food", "culture", "hidden"],
    residency: "native",
    yearsInCity: 36,
    idVerified: true,
    bgChecked: true,
    instagramHandle: "marcus.ybor",
    facebookUrl: "https://www.facebook.com/marcus.tampa",
    websiteUrl: "https://oldtampatours.com",
    responseRate: 100,
    responseTimeMinutes: 60,
    yearsHosting: 7,
    experienceHeadline: "7 years guiding · 400+ travelers",
    careerHighlight:
      "Featured in Tampa Bay Times' “Real Ybor with locals” series. Volunteer tour guide at the Ybor City Museum.",
    education: "Florida history minor, USF. Cigar maker certification, El Reloj.",
  },
  {
    email: "lena.tampa@meetlocal.ai",
    name: "Lena K.",
    city: "tampa",
    neighborhood: "Riverwalk",
    tagline: "Kayaks, manatees & sunset paddles",
    bio: "Biologist by day, paddler by sunset. Half-day kayak trips on the Hillsborough where you'll likely meet a manatee. Gear included.",
    ratePerHour: 4000,
    languages: ["EN"],
    tags: ["outdoors", "drive"],
    residency: "rooted",
    yearsInCity: 11,
    idVerified: true,
    bgChecked: false,
    instagramHandle: "lena.paddles",
    linkedinUrl: "https://www.linkedin.com/in/lena-k-tampa",
    websiteUrl: "https://hillsboroughpaddle.co",
    responseRate: 95,
    responseTimeMinutes: 120,
    yearsHosting: 3,
    experienceHeadline: "3 years guiding · 90+ paddles led",
    experienceBlurb:
      "Marine biologist. I run small-group sunset paddles April through October — solo travelers welcome.",
    education: "BS Marine Biology, USF. Certified ACA paddle instructor.",
  },

  // Bay Area (3)
  {
    email: "jay.sf@meetlocal.ai",
    name: "Jay W.",
    city: "bay-area",
    neighborhood: "Mission",
    tagline: "Burrito tour & vintage record dig",
    bio: "Born in SF. I'll take you to the burrito my grandfather ate, the vinyl shop my brother runs, and a dive bar in between.",
    ratePerHour: 5000,
    languages: ["EN"],
    tags: ["food", "music", "hidden"],
    residency: "native",
    yearsInCity: 31,
    idVerified: true,
    bgChecked: true,
    instagramHandle: "jay.themission",
    twitterHandle: "jaywsf",
    websiteUrl: "https://missionafterdark.com",
    responseRate: 99,
    responseTimeMinutes: 45,
    yearsHosting: 5,
    experienceHeadline: "5 years guiding · 230+ travelers",
    careerHighlight:
      "Co-host of the Mission After Dark walking tour. Eater SF contributor (vinyl + late-night).",
  },
  {
    email: "amy.sf@meetlocal.ai",
    name: "Amy L.",
    city: "bay-area",
    neighborhood: "Berkeley",
    tagline: "Hike, coffee, bookstore",
    bio: "PhD candidate. Half-day loop: Tilden ridge hike, third-wave coffee, then Moe's Books on Telegraph. Quiet & restorative.",
    ratePerHour: 3500,
    languages: ["EN", "ZH"],
    tags: ["outdoors", "culture"],
    residency: "seasoned",
    yearsInCity: 6,
    idVerified: true,
    bgChecked: false,
    instagramHandle: "amy.tilden",
    linkedinUrl: "https://www.linkedin.com/in/amy-l-berkeley",
    websiteUrl: "https://amywrites.substack.com",
    responseRate: 92,
    responseTimeMinutes: 180,
    yearsHosting: 2,
    experienceHeadline: "2 years guiding · slow-pace tours",
    experienceBlurb:
      "Quieter half-days for travelers who want a real conversation, not a checklist.",
    education: "PhD candidate, UC Berkeley English. Hospitality cert from Berkeley Extension.",
  },
  {
    email: "raj.sf@meetlocal.ai",
    name: "Raj P.",
    city: "bay-area",
    neighborhood: "SoMa",
    tagline: "Founder intros over espresso",
    bio: "YC alum, currently building. I'll do warm intros over coffee in SoMa — best for visiting founders raising or hiring.",
    ratePerHour: 8000,
    languages: ["EN", "HI"],
    tags: ["founders"],
    residency: "rooted",
    yearsInCity: 12,
    idVerified: true,
    bgChecked: true,
    linkedinUrl: "https://www.linkedin.com/in/raj-p",
    twitterHandle: "rajbuilds",
    websiteUrl: "https://raj.fyi",
    lumaUrl: "https://lu.ma/raj-soma",
    responseRate: 100,
    responseTimeMinutes: 20,
    yearsHosting: 4,
    experienceHeadline: "4 years guiding · 180+ founder coffees",
    careerHighlight:
      "YC W19 alum. Host of SoMa Founder Coffee (Wednesdays at Sightglass).",
    education: "BS Computer Science, Stanford.",
  },

  // Portland, ME (2)
  {
    email: "sam.pdx-me@meetlocal.ai",
    name: "Sam B.",
    city: "portland-me",
    neighborhood: "Old Port",
    tagline: "Lobster shacks & lighthouse drives",
    bio: "Born here. Family runs a lobster boat. I'll take you to the dock for a roll fresh off the trap, then the lighthouse loop nobody puts on Instagram.",
    ratePerHour: 4000,
    languages: ["EN"],
    tags: ["food", "drive", "outdoors"],
    residency: "native",
    yearsInCity: 41,
    idVerified: true,
    bgChecked: true,
    instagramHandle: "sam.boatkid",
    facebookUrl: "https://www.facebook.com/sam.b.portland",
    websiteUrl: "https://maincoastlocals.com",
    responseRate: 100,
    responseTimeMinutes: 60,
    yearsHosting: 8,
    experienceHeadline: "8 years guiding · 500+ travelers",
    careerHighlight:
      "Featured in Down East Magazine and the Portland Press Herald (twice). Maine Lobster Festival official guide 2023.",
    education: "Maine Maritime Academy alum. Coast Guard captain's license.",
  },
  {
    email: "kira.pdx-me@meetlocal.ai",
    name: "Kira H.",
    city: "portland-me",
    neighborhood: "East End",
    tagline: "Coffee, breweries, art walks",
    bio: "Designer & illustrator. Saturday loop through East End cafés, two of the best small breweries, and a pop-up gallery if one's open.",
    ratePerHour: 3500,
    languages: ["EN"],
    tags: ["food", "culture", "nightlife"],
    residency: "rooted",
    yearsInCity: 9,
    idVerified: true,
    bgChecked: false,
    instagramHandle: "kira.draws.me",
    linkedinUrl: "https://www.linkedin.com/in/kira-h-portland",
    websiteUrl: "https://kirahdesign.com",
    twitterHandle: "kira_pdxme",
    responseRate: 97,
    responseTimeMinutes: 75,
    yearsHosting: 3,
    experienceHeadline: "3 years guiding · 110+ Saturday loops",
    careerHighlight:
      "Illustrator for Old Port Magazine. Featured at the 2024 Portland First Friday Art Walk.",
    education: "BFA Illustration, Maine College of Art & Design.",
  },
];

interface SeedSpot {
  city: string;
  name: string;
  area: string;
  kind: "coffee" | "hotel" | "plaza" | "museum" | "book" | "station" | "restaurant";
  hours: string;
  lat: number;
  lng: number;
  safety: string[];
  popular?: boolean;
}

const SPOTS: SeedSpot[] = [
  // Miami
  { city: "miami", name: "Versailles Restaurant", area: "Little Havana", kind: "restaurant", hours: "08:00 – 01:00", lat: 25.7651, lng: -80.2728, safety: ["Staffed", "Iconic landmark", "Always busy"], popular: true },
  { city: "miami", name: "Panther Coffee Wynwood", area: "Wynwood", kind: "coffee", hours: "07:00 – 22:00", lat: 25.8018, lng: -80.1986, safety: ["Staffed", "CCTV"], popular: true },
  { city: "miami", name: "1 Hotel South Beach Lobby", area: "South Beach", kind: "hotel", hours: "24h", lat: 25.7818, lng: -80.131, safety: ["Concierge", "24h security"] },
  // Tampa
  { city: "tampa", name: "Buddy Brew Coffee", area: "Hyde Park", kind: "coffee", hours: "06:30 – 21:00", lat: 27.9425, lng: -82.4716, safety: ["Staffed", "CCTV", "Busy daytime"], popular: true },
  { city: "tampa", name: "Tampa Marriott Water Street Lobby", area: "Water Street", kind: "hotel", hours: "24h", lat: 27.943, lng: -82.4521, safety: ["Concierge", "24h security"] },
  { city: "tampa", name: "Centennial Park", area: "Ybor City", kind: "plaza", hours: "06:00 – 22:00", lat: 27.9622, lng: -82.4385, safety: ["Open public space", "CCTV"] },
  // Bay Area
  { city: "bay-area", name: "Blue Bottle Mint Plaza", area: "SoMa, SF", kind: "coffee", hours: "07:00 – 18:00", lat: 37.7825, lng: -122.4078, safety: ["Staffed", "CCTV"], popular: true },
  { city: "bay-area", name: "Ferry Building", area: "Embarcadero, SF", kind: "plaza", hours: "10:00 – 19:00", lat: 37.7955, lng: -122.3937, safety: ["Tourist police", "CCTV", "Busy 12+ hrs/day"], popular: true },
  { city: "bay-area", name: "Hotel Kabuki Lobby", area: "Japantown, SF", kind: "hotel", hours: "24h", lat: 37.7853, lng: -122.4314, safety: ["Concierge", "24h security"] },
  // Portland, ME
  { city: "portland-me", name: "Tandem Coffee + Bakery", area: "East Bayside", kind: "coffee", hours: "07:00 – 17:00", lat: 43.665, lng: -70.2487, safety: ["Staffed", "Glass-front"], popular: true },
  { city: "portland-me", name: "Press Hotel Lobby", area: "Old Port", kind: "hotel", hours: "24h", lat: 43.659, lng: -70.2554, safety: ["Concierge", "24h security"] },
  { city: "portland-me", name: "Monument Square", area: "Downtown", kind: "plaza", hours: "24h", lat: 43.6589, lng: -70.2569, safety: ["Open public space", "CCTV"] },
];

async function main() {
  console.log("Seeding meeting spots…");
  for (const spot of SPOTS) {
    // No natural unique key; use city+name as a soft key
    const existing = await prisma.meetingSpot.findFirst({
      where: { city: spot.city, name: spot.name },
    });
    if (existing) {
      await prisma.meetingSpot.update({
        where: { id: existing.id },
        data: spot,
      });
    } else {
      await prisma.meetingSpot.create({ data: spot });
    }
  }

  console.log("Seeding locals…");
  for (const l of LOCALS) {
    const user = await prisma.user.upsert({
      where: { email: l.email },
      update: { name: l.name },
      create: { email: l.email, name: l.name },
    });
    const profileData: Prisma.LocalProfileUpdateInput = {
      city: l.city,
      neighborhood: l.neighborhood,
      tagline: l.tagline,
      bio: l.bio,
      ratePerHour: l.ratePerHour,
      languages: l.languages,
      tags: l.tags,
      residency: l.residency,
      yearsInCity: l.yearsInCity,
      idVerified: l.idVerified,
      bgChecked: l.bgChecked,
      status: "active",
      // Optional social + trust fields — null overrides clear stale data on re-seed
      instagramHandle: l.instagramHandle ?? null,
      linkedinUrl: l.linkedinUrl ?? null,
      facebookUrl: l.facebookUrl ?? null,
      twitterHandle: l.twitterHandle ?? null,
      lumaUrl: l.lumaUrl ?? null,
      websiteUrl: l.websiteUrl ?? null,
      responseRate: l.responseRate ?? null,
      responseTimeMinutes: l.responseTimeMinutes ?? null,
      yearsHosting: l.yearsHosting ?? null,
      experienceHeadline: l.experienceHeadline ?? null,
      experienceBlurb: l.experienceBlurb ?? null,
      careerHighlight: l.careerHighlight ?? null,
      education: l.education ?? null,
    };
    await prisma.localProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: { ...profileData, user: { connect: { id: user.id } } } as Prisma.LocalProfileCreateInput,
    });
  }

  console.log(`✓ Seeded ${LOCALS.length} locals + ${SPOTS.length} meeting spots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
