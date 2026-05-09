import Link from "next/link";
import { Heart } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/MainNav";
import { UserMenu } from "@/components/UserMenu";
import { AuthMenu } from "@/components/AuthMenu";
import { YourStory } from "@/components/YourStory";
import { auth, signOut } from "@/auth";

export async function SiteHeader() {
  const session = await auth();

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
        {/* Become-a-local CTA — Airbnb's "Become a host" pattern. Always visible
            (the destination handles the case where the user is already a local). */}
        <Link
          href="/become-a-local"
          className="grad-sunset hidden items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95 sm:inline-flex"
        >
          <Heart size={14} />
          Become a local
        </Link>
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
