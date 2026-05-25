import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { CITIES, CATEGORIES } from "@/lib/cities";
import { isStripeConfigured } from "@/lib/stripe";
import { IdentityVerificationButton } from "@/components/IdentityVerificationButton";
import { ApplyForm } from "./ApplyForm";

export default async function ApplyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?from=/become-a-local/apply");
  }

  // When Stripe is configured, the apply form hides the manual upload UI;
  // identity is collected post-submit via Stripe Identity hosted flow.
  const useStripeIdentity = isStripeConfigured();

  const existing = await prisma.localProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true, idVerified: true },
  });

  if (existing) {
    return (
      <div className="relative min-h-screen overflow-x-hidden bg-bg text-text">
        <PageGlow />
        <TopBar />
        <div className="relative mx-auto max-w-xl px-10 py-20 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            You&rsquo;ve already applied.
          </h1>
          <p className="mt-3 text-text-dim">
            Status: <b className="text-text">{existing.status}</b>
            {existing.status === "pending" &&
              ". The founder will email you within 24h."}
            {existing.status === "active" && ". Your profile is live."}
          </p>

          {/* Identity verification CTA. Shown when the local hasn't done it
              yet AND Stripe Identity is configured. Webhook flips idVerified
              automatically on success. */}
          {useStripeIdentity && !existing.idVerified && (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-line-2 bg-surface/80 p-6">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-coral">
                <ShieldCheck size={13} />
                One last step
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Verify your identity
              </h2>
              <p className="max-w-md text-sm text-text-dim">
                We use Stripe Identity to confirm your government ID matches
                your selfie. Takes about 2 minutes, happens entirely on
                stripe.com — your photos never touch our servers.
              </p>
              <div className="mt-2">
                <IdentityVerificationButton localProfileId={existing.id} />
              </div>
            </div>
          )}

          {useStripeIdentity && existing.idVerified && (
            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-good/40 bg-good/10 px-4 py-2 text-sm text-good">
              <ShieldCheck size={14} /> Identity verified
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            {existing.status === "active" && (
              <Link
                href={`/local/${existing.id}`}
                className="grad-sunset rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.27)]"
              >
                View your profile
              </Link>
            )}
            <Link
              href="/"
              className="rounded-2xl border border-line-2 bg-surface px-5 py-3 text-sm font-medium text-text hover:bg-surface-2"
            >
              Back to discover
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-bg text-text">
      <PageGlow />
      <TopBar />
      <ApplyForm
        cities={CITIES.map((c) => ({ slug: c.slug, name: `${c.name}, ${c.state}` }))}
        categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        currentName={session.user.name ?? ""}
        useStripeIdentity={useStripeIdentity}
      />
    </div>
  );
}

function PageGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(900px 500px at 80% -10%, rgba(255,46,120,0.15), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(255,184,77,0.13), transparent 60%)",
      }}
    />
  );
}

function TopBar() {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-line bg-bg/80 px-10 py-4 backdrop-blur">
      <Link
        href="/become-a-local"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 text-text transition hover:bg-surface"
      >
        <ArrowLeft size={15} />
      </Link>
      <div className="flex items-center gap-3 text-sm text-text-dim">
        <Logo />
        <span className="h-3.5 w-px bg-line-2" />
        <span className="font-mono text-xs">Become a local · application</span>
      </div>
    </div>
  );
}
