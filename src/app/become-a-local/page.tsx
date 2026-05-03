import Link from "next/link";
import { ShieldCheck, Wallet, Heart, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function BecomeALocalPage() {
  const session = await auth();
  // If they're already a local, push them to their profile
  if (session?.user?.id) {
    const existing = await prisma.localProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      // Could redirect to their profile; for v1 just show a different CTA
    }
  }

  const ctaHref = session?.user
    ? "/become-a-local/apply"
    : "/signin?from=/become-a-local/apply";

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 500px at 80% -10%, rgba(255,46,120,0.15), transparent 60%), radial-gradient(700px 400px at -10% 30%, rgba(255,184,77,0.13), transparent 60%)",
        }}
      />

      <SiteHeader />

      <section className="relative mx-auto max-w-5xl px-14 pb-12 pt-24">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs text-text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-coral animate-ml-pulse" />
          For locals · Apply in 3 minutes
        </div>
        <h1 className="font-display text-7xl font-bold leading-[0.96] tracking-tight">
          Show your city
          <br />
          to <span className="grad-text">someone new.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-dim">
          You set the rate, the activity, and the hours. We bring you the
          travelers, vet them, and handle the payment. You just show up and be a
          local.
        </p>

        <Link
          href={ctaHref}
          className="grad-sunset mt-10 inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.27)]"
        >
          Apply to be a local <ArrowRight size={16} />
        </Link>
      </section>

      <section className="relative mx-auto grid max-w-5xl gap-5 px-14 pb-20 md:grid-cols-3">
        <Card icon={<Wallet size={20} />} title="Earn on your own time">
          Set your hourly rate ($25–$80 typical). 78% goes to you, paid out
          weekly. Average local earns $200/week.
        </Card>
        <Card icon={<ShieldCheck size={20} />} title="We handle the trust stuff">
          ID verification, payments, two-way reviews, panic button. Travelers
          you meet are verified before they can book you.
        </Card>
        <Card icon={<Heart size={20} />} title="Meet good humans">
          Travelers worth your time. Founders, photographers, students,
          retirees. The ones who actually want to know your city.
        </Card>
      </section>

      <section className="relative mx-auto max-w-5xl px-14 pb-32">
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          How approval works
        </h2>
        <ol className="mt-6 grid gap-5 md:grid-cols-3">
          <Step n="1" title="Tell us about you">
            Photo, neighborhood, what you&rsquo;d show a friend, your rate.
            Takes 3 minutes.
          </Step>
          <Step n="2" title="Founder review">
            We personally read every application. Goal: 24h response. We&rsquo;ll
            ping you with questions if needed.
          </Step>
          <Step n="3" title="Go live">
            Profile goes live in your city. We email you the moment a request
            lands. You have 14 minutes to accept.
          </Step>
        </ol>
      </section>

      <SiteFooter />
    </div>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="grad-sunset inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
        {icon}
      </div>
      <div className="mt-4 font-display text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-text-dim">{children}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <span className="font-mono text-xs tracking-[0.1em] text-text-muted">0{n}</span>
      <div className="mt-2 font-display text-lg font-semibold">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-text-dim">{children}</p>
    </div>
  );
}
