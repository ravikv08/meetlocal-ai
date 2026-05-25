import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { SiteHeader } from "@/components/SiteHeader";
import { CITIES, RESIDENCY } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";
import { setLocalStatus, setVerificationFlag } from "../actions";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLocalReviewPage({ params }: ReviewPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/signin?from=/admin/locals");
  if (!session.user.isAdmin) redirect("/");

  const { id } = await params;
  const local = await prisma.localProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, image: true } } },
  });
  if (!local) notFound();

  const cityName = CITIES.find((c) => c.slug === local.city)?.name ?? local.city;
  const residencyLabel = RESIDENCY[local.residency]?.label ?? local.residency;
  const age = local.dateOfBirth ? computeAge(local.dateOfBirth) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-8 px-14 py-10">
        <Link
          href="/admin/locals"
          className="inline-flex items-center gap-2 text-sm text-text-dim transition hover:text-text"
        >
          <ArrowLeft size={14} /> Back to all locals
        </Link>

        {/* Identity header */}
        <header className="flex flex-wrap items-start gap-5">
          <Avatar
            name={local.user.name ?? "?"}
            size={88}
            imageUrl={local.user.image ?? local.photoUrl ?? null}
          />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
              Admin · Review
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              {local.user.name ?? local.user.email}
            </h1>
            <div className="mt-1 text-sm text-text-dim">
              {local.user.email} · {cityName}
              {local.neighborhood ? `, ${local.neighborhood}` : ""}
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <Pill>{local.status}</Pill>
              <Pill>{residencyLabel}</Pill>
              <Pill>
                {formatPrice(local.ratePerHour)}/hr
              </Pill>
              {age !== null && (
                <Pill>
                  <Calendar size={11} /> {age} yrs old
                </Pill>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            {local.status !== "active" && (
              <form action={setLocalStatus}>
                <input type="hidden" name="id" value={local.id} />
                <input type="hidden" name="status" value="active" />
                <button className="rounded-full bg-good px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90">
                  Approve & activate
                </button>
              </form>
            )}
            {local.status === "active" && (
              <form action={setLocalStatus}>
                <input type="hidden" name="id" value={local.id} />
                <input type="hidden" name="status" value="paused" />
                <button className="rounded-full border border-line-2 px-4 py-2 text-sm">
                  Pause
                </button>
              </form>
            )}
            <Link
              href={`/local/${local.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2 text-sm"
            >
              View public profile <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Verification panel — selfie ↔ ID side-by-side */}
        <section className="rounded-2xl border border-line-2 bg-surface p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                Identity verification
              </div>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
                Selfie ↔ Government ID
              </h2>
            </div>
            <div className="flex gap-2 text-xs">
              <FlagPill on={local.idVerified} label="ID verified" />
              <FlagPill on={local.bgChecked} label="Background checked" />
            </div>
          </div>

          {/* Stripe Identity verification card. Shown when the local ran the
              hosted flow at /api/identity/start. Includes a deep link into the
              Stripe Dashboard for the founder to inspect document images,
              selfie-match score, fraud signals etc. — those don't (and shouldn't)
              come back to our servers per Stripe's data-residency model. */}
          {local.stripeIdentityVerificationId && (
            <div
              className={
                "mt-5 flex flex-wrap items-center gap-3 rounded-2xl border p-4 " +
                (local.idVerified
                  ? "border-good/40 bg-good/5"
                  : "border-amber/40 bg-amber/5")
              }
            >
              <div
                className={
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl " +
                  (local.idVerified
                    ? "bg-good/15 text-good"
                    : "bg-amber/15 text-amber")
                }
              >
                <ShieldCheck size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm font-semibold">
                  {local.idVerified
                    ? "Verified via Stripe Identity"
                    : "Stripe Identity in progress"}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-text-muted">
                  Session: {local.stripeIdentityVerificationId}
                </div>
                {!local.idVerified && (
                  <div className="mt-1 text-xs text-text-dim">
                    Webhook hasn&rsquo;t fired yet. Check the session on Stripe
                    to see the verification status, or flip the ID-verified
                    flag manually below if Stripe shows it as verified.
                  </div>
                )}
              </div>
              <a
                href={`https://dashboard.stripe.com/identity/verification-sessions/${local.stripeIdentityVerificationId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line-2 bg-surface px-4 py-2 text-sm font-medium transition hover:bg-surface-2"
              >
                Open in Stripe →
              </a>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Photo
              label="Live selfie"
              url={local.selfieUrl}
              empty={
                local.stripeIdentityVerificationId
                  ? "Captured via Stripe Identity (see card above)"
                  : "No selfie submitted"
              }
            />
            <Photo
              label="Government-issued ID"
              url={local.governmentIdUrl}
              empty={
                local.stripeIdentityVerificationId
                  ? "Captured via Stripe Identity (see card above)"
                  : "No ID submitted"
              }
            />
          </div>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <Detail label="Date of birth">
              {local.dateOfBirth
                ? `${local.dateOfBirth.toISOString().slice(0, 10)} (age ${age})`
                : "—"}
            </Detail>
            <Detail label="Years in city">{local.yearsInCity}</Detail>
            <Detail label="Residency">{residencyLabel}</Detail>
            <Detail label="Submitted">
              {local.createdAt.toISOString().slice(0, 10)}
            </Detail>
          </dl>

          <div className="mt-5 flex flex-wrap gap-2">
            <FlagToggleForm
              id={local.id}
              flag="idVerified"
              currentlyOn={local.idVerified}
              onLabel="✓ Mark ID verified"
              offLabel="Unmark ID verified"
            />
            <FlagToggleForm
              id={local.id}
              flag="bgChecked"
              currentlyOn={local.bgChecked}
              onLabel="✓ Mark background checked"
              offLabel="Unmark background"
            />
            {/* Founding 100 program — flip to give this local 90% take rate
                (vs 78% standard) on future bookings. Snapshotted per booking
                at creation, so historical bookings keep their original cut. */}
            <FlagToggleForm
              id={local.id}
              flag="isFounding"
              currentlyOn={local.isFounding}
              onLabel="★ Mark as Founding 100 (90% cut)"
              offLabel="Remove Founding (back to 78%)"
            />
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Compare the selfie against the photo on the ID. Confirm the DOB on
            the document matches what they entered. Flip the badges only when
            both checks pass.
          </p>
        </section>

        {/* Profile details */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Profile content
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
            What travelers see
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Detail label="Tagline">{local.tagline}</Detail>
            <Detail label="Bio">
              <span className="whitespace-pre-line text-text-dim">{local.bio}</span>
            </Detail>
            <Detail label="Languages">{local.languages.join(" · ")}</Detail>
            <Detail label="Tags">{local.tags.join(", ")}</Detail>
          </div>
        </section>

        {/* Social verification rows */}
        {hasAnySocial(local) && (
          <section className="rounded-2xl border border-line bg-surface p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              Open-web verification
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              Social profiles
            </h2>
            <ul className="mt-4 grid gap-2">
              {local.instagramHandle && (
                <SocialRow
                  label="Instagram"
                  href={`https://instagram.com/${local.instagramHandle.replace(/^@/, "")}`}
                  preview={`@${local.instagramHandle.replace(/^@/, "")}`}
                />
              )}
              {local.facebookUrl && (
                <SocialRow label="Facebook" href={local.facebookUrl} preview={local.facebookUrl} />
              )}
              {local.twitterHandle && (
                <SocialRow
                  label="X"
                  href={`https://x.com/${local.twitterHandle.replace(/^@/, "")}`}
                  preview={`@${local.twitterHandle.replace(/^@/, "")}`}
                />
              )}
              {local.linkedinUrl && (
                <SocialRow label="LinkedIn" href={local.linkedinUrl} preview={local.linkedinUrl} />
              )}
              {local.snapchatHandle && (
                <SocialRow
                  label="Snapchat"
                  href={`https://www.snapchat.com/add/${local.snapchatHandle.replace(/^@/, "")}`}
                  preview={`@${local.snapchatHandle.replace(/^@/, "")}`}
                />
              )}
              {local.lumaUrl && (
                <SocialRow label="Luma" href={local.lumaUrl} preview={local.lumaUrl} />
              )}
              {local.websiteUrl && (
                <SocialRow label="Website" href={local.websiteUrl} preview={local.websiteUrl} />
              )}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}

function computeAge(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

function hasAnySocial(local: {
  instagramHandle: string | null;
  facebookUrl: string | null;
  twitterHandle: string | null;
  linkedinUrl: string | null;
  snapchatHandle: string | null;
  lumaUrl: string | null;
  websiteUrl: string | null;
}) {
  return Boolean(
    local.instagramHandle ||
      local.facebookUrl ||
      local.twitterHandle ||
      local.linkedinUrl ||
      local.snapchatHandle ||
      local.lumaUrl ||
      local.websiteUrl,
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-bg-2 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-text-dim">
      {children}
    </span>
  );
}

function FlagPill({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider " +
        (on
          ? "grad-sunset text-white"
          : "border border-line-2 bg-bg-2 text-text-muted")
      }
    >
      {on ? <BadgeCheck size={12} /> : <ShieldCheck size={12} />} {label}
    </span>
  );
}

function Photo({
  label,
  url,
  empty,
}: {
  label: string;
  url: string | null;
  empty: string;
}) {
  return (
    <figure>
      <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </figcaption>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-line-2 bg-bg-2">
        {url ? (
          // Admin-only view; private uploads. eslint-disable-next-line @next/next/no-img-element
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-muted">
            {empty}
          </div>
        )}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-text-muted transition hover:text-text"
        >
          Open full size <ExternalLink size={11} />
        </a>
      )}
    </figure>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-text">{children}</dd>
    </div>
  );
}

function SocialRow({
  label,
  href,
  preview,
}: {
  label: string;
  href: string;
  preview: string;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5 transition hover:border-coral/50"
      >
        <div className="min-w-0">
          <div className="text-sm font-medium text-text">{label}</div>
          <div className="truncate font-mono text-xs text-text-dim">{preview}</div>
        </div>
        <ExternalLink size={14} className="shrink-0 text-text-muted" />
      </a>
    </li>
  );
}

function FlagToggleForm({
  id,
  flag,
  currentlyOn,
  onLabel,
  offLabel,
}: {
  id: string;
  flag: "idVerified" | "bgChecked" | "isFounding";
  currentlyOn: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <form action={setVerificationFlag}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="flag" value={flag} />
      <input type="hidden" name="value" value={currentlyOn ? "false" : "true"} />
      <button
        className={
          "rounded-full px-4 py-2 text-sm font-semibold transition " +
          (currentlyOn
            ? "border border-line-2 bg-surface text-text hover:bg-surface-2"
            : "grad-sunset text-white shadow-[0_10px_30px_rgba(255,106,61,0.2)]")
        }
      >
        {currentlyOn ? offLabel : onLabel}
      </button>
    </form>
  );
}
