import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart, Wallet, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReferralLink } from "./ReferralLink";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Refer a friend · meetlocal.ai",
  description:
    "Share meetlocal with a friend. They get $15 off their first booking, you get $20 in credit when they complete it.",
};

// Refer-a-friend landing — manual referral mechanic at Stage 1 per
// GROWTH_PLAYBOOK § 3. Each signed-in user gets a personalized link with
// their user-id as a ref param. The actual credit accounting is manual
// for v1; the engineered referral product ships at Stage 2.

export default async function ReferPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/refer");

  // Pull the user's display name for the share copy
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  const firstName = user?.name?.split(" ")[0] ?? "your friend";

  // Build the referral link — uses AUTH_URL in prod, falls back to
  // localhost in dev.
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const referralLink = `${baseUrl}/?ref=${session.user.id}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -10%, rgba(255,46,120,0.13), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(255,184,77,0.10), transparent 60%)",
        }}
      />
      <SiteHeader />

      <section className="relative mx-auto max-w-3xl px-14 pb-12 pt-20">
        <div className="font-mono text-xs uppercase tracking-[0.12em] text-coral">
          ● Refer a friend
        </div>
        <h1 className="mt-5 font-display text-6xl font-bold leading-[0.96] tracking-tight">
          Give <span className="grad-text">$15</span>.
          <br />
          Get <span className="grad-text">$20</span>.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-relaxed text-text-dim">
          Share your meetlocal link. Your friend gets $15 off their first
          booking. You get $20 credit when they complete it. Simple.
        </p>

        <div className="mt-9">
          <ReferralLink link={referralLink} firstName={firstName} />
        </div>

        {/* How it works in 3 steps */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Step n="01" icon={Heart} t="Send your link">
            Share by text, email, or DM. Each one is yours.
          </Step>
          <Step n="02" icon={Sparkles} t="They book a local">
            Your friend gets $15 off their first meetlocal session.
          </Step>
          <Step n="03" icon={Wallet} t="You get $20 credit">
            Applied to your next booking once theirs is completed.
          </Step>
        </div>

        {/* Fine print */}
        <div className="mt-10 rounded-2xl border border-line bg-surface p-5 text-xs leading-relaxed text-text-muted">
          <p>
            <strong className="text-text-dim">How it works during beta:</strong>{" "}
            For our Founding 50 launch, referral credits are tracked
            manually by the founder and applied to your next booking
            within 48 hours of your friend&rsquo;s first completed meet.
            The engineered referral product ships at Stage 2 (200+ bookings).
          </p>
          <p className="mt-2">
            Referrals are per-friend (one $20 credit per unique new user
            you bring). Self-referrals don&rsquo;t count.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Step({
  n,
  icon: Icon,
  t,
  children,
}: {
  n: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  t: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="grad-sunset flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-[0_8px_20px_rgba(255,106,61,0.25)]">
          <Icon size={16} />
        </div>
        <div className="font-mono text-[10px] tracking-wider text-text-muted">
          {n}
        </div>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold tracking-tight">
        {t}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-text-dim">
        {children}
      </p>
    </div>
  );
}
