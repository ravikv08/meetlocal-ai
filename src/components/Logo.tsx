import Image from "next/image";
import Link from "next/link";

// Brand mark + wordmark. Icon is the sunset-pin design (two figures meeting
// in front of a sunset, framed by a location pin). Wordmark uses the same
// grad-sunset gradient via grad-text + a subtle drop-shadow for a shiny,
// bright-orange/golden read on the dark surface.
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/meetlocal-icon.png"
        alt="meetlocal"
        width={36}
        height={36}
        priority
        className="h-9 w-9 shrink-0 rounded-lg shadow-[0_6px_24px_rgba(255,106,61,0.33)]"
      />
      <span
        className="grad-text font-display text-2xl font-extrabold tracking-tight"
        style={{
          // Brighter golden-sunset glow — reads as "shiny" against bg-bg
          // without bleeding so far it loses crispness.
          filter:
            "drop-shadow(0 0 10px rgba(255,184,77,0.55)) drop-shadow(0 0 22px rgba(255,106,61,0.22))",
        }}
      >
        meetlocal
      </span>
    </Link>
  );
}
