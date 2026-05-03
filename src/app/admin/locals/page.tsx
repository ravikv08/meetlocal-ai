import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { Avatar } from "@/components/Avatar";
import { CITIES } from "@/lib/cities";
import { formatPrice } from "@/lib/utils";
import { setLocalStatus } from "./actions";

interface LocalsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminLocalsPage({ searchParams }: LocalsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/signin?from=/admin/locals");
  if (!session.user.isAdmin) redirect("/");

  const sp = await searchParams;
  const status = sp.status as
    | "pending"
    | "active"
    | "paused"
    | "removed"
    | undefined;

  const locals = await prisma.localProfile.findMany({
    where: status ? { status } : undefined,
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: { user: { select: { name: true, email: true, image: true } } },
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-14 py-10">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.12em] text-text-muted">
              Admin · Locals
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              {status ? `${status[0].toUpperCase()}${status.slice(1)} locals` : "All locals"}
            </h1>
          </div>
          <div className="flex gap-2">
            {[
              { id: "", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "active", label: "Active" },
              { id: "paused", label: "Paused" },
            ].map((f) => {
              const active = (status ?? "") === f.id;
              return (
                <Link
                  key={f.id || "all"}
                  href={f.id ? `/admin/locals?status=${f.id}` : "/admin/locals"}
                  className={
                    active
                      ? "rounded-full bg-text px-3 py-1.5 text-sm font-medium text-bg"
                      : "rounded-full border border-line-2 px-3 py-1.5 text-sm text-text-dim transition hover:text-text"
                  }
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        {locals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-2 bg-surface px-6 py-12 text-center text-text-dim">
            No locals match this filter.
          </div>
        ) : (
          <div className="grid gap-3">
            {locals.map((l) => {
              const cityName =
                CITIES.find((c) => c.slug === l.city)?.name ?? l.city;
              const idSubmitted = Boolean(l.governmentIdUrl);
              const selfieSubmitted = Boolean(l.selfieUrl);
              const verifyPending =
                (idSubmitted || selfieSubmitted) && !l.idVerified;
              return (
                <div
                  key={l.id}
                  className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4"
                >
                  <Avatar name={l.user.name ?? "?"} size={48} imageUrl={l.user.image} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-semibold">
                        {l.user.name ?? l.user.email}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                        {l.status}
                      </span>
                      {l.idVerified && (
                        <span className="grad-sunset rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white">
                          ID ✓
                        </span>
                      )}
                      {verifyPending && (
                        <span className="rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber">
                          Verify pending
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-dim">
                      {l.tagline}{" "}
                      <span className="text-text-muted">
                        · {cityName}
                        {l.neighborhood ? `, ${l.neighborhood}` : ""}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] tracking-wider text-text-muted">
                      {formatPrice(l.ratePerHour)}/hr · {l.languages.join(" · ")} ·{" "}
                      {l.tags.join(", ")}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/admin/locals/${l.id}`}
                      className={
                        verifyPending
                          ? "grad-sunset rounded-full px-3 py-1.5 text-sm font-semibold text-white"
                          : "rounded-full border border-line-2 px-3 py-1.5 text-sm"
                      }
                    >
                      Review
                    </Link>
                    {l.status !== "active" && (
                      <form action={setLocalStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value="active" />
                        <button className="rounded-full bg-good px-3 py-1.5 text-sm font-semibold text-bg transition hover:opacity-90">
                          Approve
                        </button>
                      </form>
                    )}
                    {l.status === "active" && (
                      <form action={setLocalStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value="paused" />
                        <button className="rounded-full border border-line-2 px-3 py-1.5 text-sm">
                          Pause
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
