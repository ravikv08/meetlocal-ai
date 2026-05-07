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

const ITEMS: NavItem[] = [
  { href: "/", label: "Discover", match: (p) => p === "/" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/become-a-local", label: "Become a local" },
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
              "outline-none transition",
              isActive
                ? "font-medium text-text"
                : "hover:text-text",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
