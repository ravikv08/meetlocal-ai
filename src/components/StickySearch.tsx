"use client";

import { useEffect, useRef, useState } from "react";

// Wraps the SearchBar in a sticky container that:
//   • Sticks just below the SiteHeader on scroll (Airbnb pattern)
//   • Adds a soft drop-shadow once you've scrolled past the hero
//   • Compresses the surrounding padding so the bar feels "anchored"
// Visual-only — the SearchBar logic is unchanged.

export function StickySearch({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // Trigger when the sentinel (placed above the search bar) leaves the
    // viewport from the top — meaning the user scrolled past the hero.
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { rootMargin: "-1px 0px 0px 0px", threshold: [0, 1] },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Sentinel — invisible row that the IO watches. When it scrolls out of
          view, we know the search bar is now at the top of the viewport. */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div
        className={
          "sticky top-[64px] z-[5] transition-all duration-300 px-14 " +
          // More breathable at rest, tightens on scroll for the floating-pill
          // feel (Airbnb does the same — relaxed at top, compressed when stuck).
          (scrolled ? "py-3 backdrop-blur-md" : "py-6")
        }
        style={{
          background: scrolled
            ? "linear-gradient(180deg, rgba(14,11,8,0.92), rgba(14,11,8,0.78))"
            : "transparent",
          boxShadow: scrolled
            ? "0 24px 60px rgba(0,0,0,0.45)"
            : "none",
        }}
      >
        {children}
      </div>
    </>
  );
}
