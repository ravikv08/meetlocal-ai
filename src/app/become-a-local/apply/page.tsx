import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { CITIES, CATEGORIES } from "@/lib/cities";
import { ApplyForm } from "./ApplyForm";

export default async function ApplyPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin?from=/become-a-local/apply");
  }

  const existing = await prisma.localProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true },
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
