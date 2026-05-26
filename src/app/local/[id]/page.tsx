import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HostTrustPanel } from "@/components/HostTrustPanel";
import { CredentialsCard } from "@/components/CredentialsCard";
import { GuestFavoriteReviews } from "@/components/GuestFavoriteReviews";
import { CITIES, RESIDENCY, type CitySlug } from "@/lib/cities";
import { getLocalById, listMeetingSpots } from "@/lib/queries";
import { BookingPanel } from "./BookingPanel";

interface LocalPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ when?: string }>;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function LocalPage({ params, searchParams }: LocalPageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const whenParam = sp.when && ISO_DATE.test(sp.when) ? sp.when : null;
  const local = await getLocalById(id);
  if (!local) notFound();

  const cityName = CITIES.find((c) => c.slug === local.city)?.name ?? local.city;
  const cityState = CITIES.find((c) => c.slug === local.city)?.state ?? "";
  const name = local.user.name ?? "Local";
  const residency = RESIDENCY[local.residency];

  const spotsRaw = await listMeetingSpots(local.city as CitySlug);
  const spots = spotsRaw.map((s) => ({
    id: s.id,
    name: s.name,
    area: s.area,
    kind: s.kind as string,
    hours: s.hours,
    popular: s.popular,
    safety: s.safety,
  }));

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SiteHeader />

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:gap-12 sm:px-10 sm:py-12 lg:grid-cols-[2fr_1fr] lg:px-14 lg:py-14">
        {/* LEFT: profile detail */}
        <div className="space-y-12">
          {/* Meet your Local — single hero card with everything */}
          <HostTrustPanel
            name={name}
            avatarUrl={local.user.image ?? local.photoUrl ?? null}
            cityLabel={`${cityName}${cityState ? `, ${cityState}` : ""}`}
            neighborhood={local.neighborhood}
            tagline={local.tagline}
            languages={local.languages}
            reviewCount={local.reviewCount}
            rating={local.rating ?? null}
            yearsHosting={local.yearsHosting}
            yearsInCity={local.yearsInCity}
            ratePerHour={local.ratePerHour}
            responseRate={local.responseRate}
            responseTimeMinutes={local.responseTimeMinutes}
            idVerified={local.idVerified}
            bgChecked={local.bgChecked}
            social={{
              instagramHandle: local.instagramHandle,
              linkedinUrl: local.linkedinUrl,
              facebookUrl: local.facebookUrl,
              twitterHandle: local.twitterHandle,
              snapchatHandle: local.snapchatHandle,
              lumaUrl: local.lumaUrl,
              websiteUrl: local.websiteUrl,
            }}
          />

          {/* Trust badges (residency + verifications + Founding) */}
          <div className="-mt-6 flex flex-wrap gap-2">
            {local.isFounding && (
              <span
                className="grad-sunset inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(255,106,61,0.35)]"
                title="Founding 100 local — among the first vetted hosts in this city"
              >
                ★ Founding local
              </span>
            )}
            <Badge>
              <ShieldCheck size={13} /> {residency.label}
              <span className="text-text-muted">· {local.yearsInCity}y in {cityName}</span>
            </Badge>
            {local.idVerified && (
              <Badge>
                <ShieldCheck size={13} /> ID verified
              </Badge>
            )}
            {local.bgChecked && (
              <Badge>
                <ShieldCheck size={13} /> Background checked
              </Badge>
            )}
          </div>

          {/* About */}
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              About
            </h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-text-dim">
              {local.bio}
            </p>
          </section>

          {/* Why book — credentials */}
          <CredentialsCard
            name={name}
            experienceHeadline={local.experienceHeadline}
            experienceBlurb={local.experienceBlurb}
            careerHighlight={local.careerHighlight}
            education={local.education}
          />

          {/* Tags */}
          <section>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              What we&apos;ll do
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {local.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line-2 bg-surface px-3 py-1.5 text-sm capitalize text-text"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>

          {/* Reviews — Guest favorite block */}
          <GuestFavoriteReviews
            reviews={local.reviews.map((r) => ({
              id: r.id,
              rating: r.rating,
              body: r.body,
              createdAt: r.createdAt,
              author: r.author,
            }))}
            rating={local.rating ?? null}
            reviewCount={local.reviewCount}
          />
        </div>

        {/* RIGHT: full inline booking panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingPanel
            localId={local.id}
            localName={name}
            ratePerHour={local.ratePerHour}
            rating={local.rating ?? null}
            initialDate={whenParam}
            spots={spots}
          />
        </aside>
      </main>

      <SiteFooter />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-surface px-3 py-1.5 text-xs font-medium text-text-dim">
      {children}
    </span>
  );
}
