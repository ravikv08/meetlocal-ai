"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  MessageSquare,
  Wallet,
  ShieldCheck,
  Heart,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
}

interface BottomNavProps {
  isAuthed: boolean;
  isAdmin: boolean;
}

// Floating glassmorphic dock — bigger pills with coral-tinted backgrounds so
// every item visually matches the gradient "Become a local" CTA at the end.
const ITEMS: NavItem[] = [
  { href: "/reels", label: "Reels", icon: Zap, match: (p) => p.startsWith("/reels") },
  {
    href: "/trips",
    label: "Chat",
    icon: MessageSquare,
    match: (p) => p.startsWith("/messages") || p === "/trips",
  },
  {
    // Book starts the discover → local → checkout flow on the home page
    href: "/",
    label: "Book",
    icon: Wallet,
    match: (p) => p.startsWith("/book") || p === "/",
  },
];

export function BottomNav({ isAuthed, isAdmin }: BottomNavProps) {
  const pathname = usePathname() ?? "/";

  // Hide on full-screen flows where a floating dock would compete with the
  // primary action (booking checkout, signin, chat thread, paper-themed flows).
  const HIDE_ON = [
    "/signin",
    "/book/",
    "/booking/",
    "/messages/",
    "/review/",
    "/become-a-local/apply",
  ];
  if (HIDE_ON.some((prefix) => pathname.startsWith(prefix))) return null;

  // Suppress on pages that already render SiteFooter — the footer's own nav
  // row covers the same destinations, so a floating dock would duplicate it.
  const HAS_FOOTER_NAV = [
    "/", // home
    "/how-it-works",
    "/safety",
    "/become-a-local", // also matches /become-a-local/apply, but apply is in HIDE_ON above
    "/trips",
    "/local/",
    "/host",
    "/concierge",
    "/pulse",
    "/plus",
  ];
  if (
    HAS_FOOTER_NAV.some((prefix) =>
      prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
    )
  ) {
    return null;
  }

  const itemBase =
    "flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition";

  return (
    <nav
      aria-label="primary"
      className="fixed bottom-5 left-1/2 z-40 flex max-w-[calc(100vw-32px)] -translate-x-1/2 flex-wrap items-center gap-1.5 rounded-full border border-coral/30 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_60px_rgba(255,106,61,0.15)] backdrop-blur-2xl"
      style={{ background: "rgba(28,18,12,0.94)" }}
    >
      {ITEMS.map((item, i) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={`${item.label}-${i}`}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? `${itemBase} grad-sunset text-white shadow-[0_8px_20px_rgba(255,106,61,0.35)]`
                : `${itemBase} border border-coral/25 bg-surface-2 text-text hover:border-coral/60 hover:text-coral`
            }
            style={
              active
                ? undefined
                : {
                    backgroundImage:
                      "linear-gradient(135deg, rgba(255,106,61,0.10), rgba(255,46,120,0.06))",
                  }
            }
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}

      {isAdmin && (
        <Link
          href="/admin"
          aria-current={pathname.startsWith("/admin") ? "page" : undefined}
          className={
            pathname.startsWith("/admin")
              ? `${itemBase} grad-sunset text-white shadow-[0_8px_20px_rgba(255,106,61,0.35)]`
              : `${itemBase} border border-coral/40 bg-surface-2 text-coral hover:border-coral`
          }
        >
          <ShieldCheck size={16} />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      )}

      <div className="mx-1 h-6 w-px bg-coral/25" />

      <Link
        href={isAuthed ? "/become-a-local" : "/become-a-local"}
        aria-current={pathname.startsWith("/become-a-local") ? "page" : undefined}
        className={`${itemBase} grad-sunset text-white shadow-[0_8px_20px_rgba(255,106,61,0.35)]`}
      >
        <Heart size={16} />
        <span className="hidden sm:inline">Become a local</span>
      </Link>
    </nav>
  );
}
