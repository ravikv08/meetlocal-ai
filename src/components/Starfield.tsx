// Static SVG starfield. Deterministic positions so SSR + hydration match
// exactly (no Math.random in render). No animation, no canvas, no JS — just
// a pure-decoration background that gives the "connected city" / "constellation"
// vibe without any of the perf or accessibility risk of an animated canvas.
//
// Phase 2 (post-launch): layer in subtle twinkle via CSS animation-delay per
// star, and draw faint connecting lines between near-neighbors.

interface StarfieldProps {
  /** Total star count. Default 120 balances density vs. visual noise. */
  count?: number;
  /** Restrict to viewport-fill only, or let it bleed past the section. */
  className?: string;
}

export function Starfield({ count = 120, className }: StarfieldProps) {
  // Cheap deterministic pseudo-random — multiply primes mod 100 to get a
  // spread across the 0-100 viewport-percent space. The visual sweet spot
  // is small stars (r 0.4-1.2) with widely-varied opacity (0.15-0.85).
  const stars = Array.from({ length: count }, (_, i) => ({
    x: (i * 37 + 13) % 100,
    y: (i * 53 + 29) % 100,
    r: 0.4 + ((i * 7) % 9) / 10,
    o: 0.15 + ((i * 11) % 70) / 100,
  }));

  return (
    <svg
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </svg>
  );
}
