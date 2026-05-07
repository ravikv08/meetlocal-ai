import Link from "next/link";
import { Globe } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MainNav } from "@/components/MainNav";
import { UserMenu } from "@/components/UserMenu";
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
      <div className="flex items-center gap-1.5 rounded-full border border-line-2 px-2.5 py-1.5 font-mono text-xs text-text-dim">
        <Globe size={14} /> EN · USD
      </div>
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
        <>
          <Link
            href="/signin"
            className="whitespace-nowrap rounded-full border border-line-2 px-4 py-2.5 text-sm font-medium transition hover:bg-surface"
          >
            Sign in
          </Link>
          <Link
            href="/signin?intent=signup"
            className="whitespace-nowrap rounded-full bg-text px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Get started
          </Link>
        </>
      )}
    </header>
  );
}
