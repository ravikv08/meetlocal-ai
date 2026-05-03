import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { CITIES, CATEGORIES } from "@/lib/cities";
import { NewLocalForm } from "./NewLocalForm";

export default async function AdminNewLocalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin?from=/admin/locals/new");
  if (!session.user.isAdmin) redirect("/");

  // Pull existing users without a LocalProfile so the founder can promote
  // someone who's already signed up rather than creating a placeholder.
  const candidateUsers = await prisma.user.findMany({
    where: { localProfile: null },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-paper-bg text-ink">
      <div className="sticky top-0 z-20 flex items-center gap-4 border-b border-hair bg-paper-bg px-10 py-4 backdrop-blur">
        <Link
          href="/admin/locals"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hair-2 transition hover:bg-paper"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3 text-sm text-ink-dim">
          <Logo />
          <span className="h-3.5 w-px bg-hair-2" />
          <span className="font-mono text-xs">Add a local</span>
        </div>
      </div>

      <NewLocalForm
        cities={CITIES.map((c) => ({ slug: c.slug, name: `${c.name}, ${c.state}` }))}
        categories={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
        candidateUsers={candidateUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }))}
      />
    </div>
  );
}
