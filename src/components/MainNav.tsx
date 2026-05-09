"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  /** Custom predicate; defaults to exact match for "/" and prefix match for others. */
  match?: (pathname: string) => boolean;
}

// "Become a local" is intentionally NOT here — it has its own coral CTA
// in the top-right of SiteHeader. Three entry points (header CTA + footer
// pill + AuthMenu dropdown) is enough; six was overkill.
const ITEMS: NavItem[] = [
  { href: "/", label: "Discover", match: (p) => p === "/" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/safety", label: "Safety" },
];

export function MainNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav
      aria-label="Primary"
      className="flex items-center gap-7 text-sm text-text-dim"
    >
      {ITEMS.map((item) => {
        const isActive = item.match
          ? item.match(pathname)
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              // Coral hover/active matches the grad-sunset CTAs in the header
              // so the whole interactive surface feels brand-consistent. The
              // active item gets a small glowing coral dot below as a subtle
              // anchor without competing with the CTA buttons.
              "relative outline-none transition",
              isActive
                ? "font-medium text-coral after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:mx-auto after:h-1 after:w-1 after:rounded-full after:bg-coral after:shadow-[0_0_8px_rgba(255,106,61,0.7)]"
                : "hover:text-coral",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
