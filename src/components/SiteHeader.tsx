import Link from "next/link";
import { Heart, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/MainNav";
import { UserMenu } from "@/components/UserMenu";
import { AuthMenu } from "@/components/AuthMenu";
import { YourStory } from "@/components/YourStory";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const session = await auth();

  // Show the Host link only for active locals. Cheap lookup (one indexed row)
  // and lets approved hosts jump back to their dashboard from any page.
  const localStatus =
    session?.user?.id
      ? (
          await prisma.localProfile.findUnique({
            where: { userId: session.user.id },
            select: { status: true },
          })
        )?.status ?? null
      : null;
  const isActiveLocal = localStatus === "active";

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="vibrancy-dark sticky top-0 z-10 flex items-center gap-8 border-b border-line px-14 py-4">
      <Logo />
      <MainNav />
      <div className="flex-1" />

      {/* Right-side actions — kept tight (gap-3) so the CTAs read as a group. */}
      <div className="flex items-center gap-3">
        {/* For approved locals, replace the "Become a local" CTA with a Host
            dashboard link — same prominent slot, but pointed at their own
            earnings + incoming requests. Keeps the header free of redundant
            CTAs once the user has already crossed that threshold. */}
        {isActiveLocal ? (
          <Link
            href="/host"
            className="hidden items-center gap-2 whitespace-nowrap rounded-full border border-coral/40 bg-surface px-4 py-2.5 text-sm font-semibold text-coral transition hover:border-coral sm:inline-flex"
          >
            <LayoutDashboard size={14} />
            Host
          </Link>
        ) : (
          <Link
            href="/become-a-local"
            className="grad-sunset hidden items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95 sm:inline-flex"
          >
            <Heart size={14} />
            Become a local
          </Link>
        )}
        {session?.user ? (
          <>
            <YourStory
              name={session.user.name ?? null}
              email={session.user.email ?? null}
              image={session.user.image ?? null}
            />
            <UserMenu
              name={session.user.name ?? null}
              email={session.user.email ?? null}
              image={session.user.image ?? null}
              isAdmin={session.user.isAdmin}
              signOutAction={signOutAction}
            />
          </>
        ) : (
          <AuthMenu />
        )}
      </div>
    </header>
  );
}
