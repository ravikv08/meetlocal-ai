"use client";

import { useEffect, useState } from "react";
import { Play, Volume2 } from "lucide-react";

interface HeroStoryVideoProps {
  /**
   * When you have the real cut, pass the MP4/WebM URL here. The placeholder
   * cycler is replaced by a muted-autoplay-loop <video>. Drop a poster image
   * via posterUrl for first-frame quality.
   */
  src?: string;
  posterUrl?: string;
  className?: string;
  /** Show the small "Watch with sound" affordance. */
  showSoundCta?: boolean;
}

// Vignettes are intentionally short, sensory, and on-brand. Each one paints
// a single moment a real meetup might generate. When the real video lands,
// these get hidden — the data model only exists to make the placeholder
// feel deliberate rather than empty.
const VIGNETTES = [
  {
    city: "Roma Norte · Mexico City",
    moment: "Tacos al pastor at 1am",
    pair: "Sarah · Ana",
    accent: "linear-gradient(135deg, #ff6a3d 0%, #ff2e78 100%)",
    glow: "rgba(255,46,120,0.35)",
  },
  {
    city: "Wynwood · Miami",
    moment: "Cuban coffee, six floors up",
    pair: "James · Marcus",
    accent: "linear-gradient(135deg, #ffb84d 0%, #ff6a3d 100%)",
    glow: "rgba(255,184,77,0.32)",
  },
  {
    city: "Ybor · Tampa",
    moment: "Domino park, Saturday",
    pair: "Emma · Luis",
    accent: "linear-gradient(135deg, #ff2e78 0%, #8b5cf6 100%)",
    glow: "rgba(139,92,246,0.30)",
  },
  {
    city: "Mission · San Francisco",
    moment: "Burritos & murals after dusk",
    pair: "David · Sofia",
    accent: "linear-gradient(135deg, #4ade80 0%, #ff6a3d 100%)",
    glow: "rgba(74,222,128,0.28)",
  },
  {
    city: "Chinatown · New York",
    moment: "Dim sum, Mott St, 11am",
    pair: "Riley · Lena",
    accent: "linear-gradient(135deg, #ffb84d 0%, #ff2e78 100%)",
    glow: "rgba(255,46,120,0.30)",
  },
];

const VIGNETTE_MS = 3800;

export function HeroStoryVideo({
  src,
  posterUrl,
  className,
  showSoundCta = true,
}: HeroStoryVideoProps) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (src) return; // real video plays — no cycling needed
    const id = setInterval(
      () => setI((prev) => (prev + 1) % VIGNETTES.length),
      VIGNETTE_MS,
    );
    return () => clearInterval(id);
  }, [src]);

  return (
    <div
      className={
        "relative isolate overflow-hidden rounded-3xl border border-line-2 bg-bg-2 shadow-[0_30px_80px_rgba(0,0,0,0.5)] " +
        (className ?? "")
      }
    >
      {/* Real video path (drop in `src` to activate) */}
      {src && (
        <video
          src={src}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* Placeholder cycler */}
      {!src && (
        <>
          {VIGNETTES.map((v, idx) => (
            <div
              key={v.city}
              className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
              style={{ opacity: idx === i ? 1 : 0 }}
              aria-hidden={idx !== i}
            >
              {/* Layered backdrop: branded gradient + soft noise via radial */}
              <div
                className="absolute inset-0"
                style={{ background: v.accent, opacity: 0.55 }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(900px 600px at 30% 20%, rgba(255,255,255,0.12), transparent 55%), radial-gradient(700px 500px at 80% 90%, rgba(0,0,0,0.55), transparent 60%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(14,11,8,0.05) 0%, rgba(14,11,8,0.65) 100%)",
                }}
              />

              {/* Glow accent — drifts subtly */}
              <div
                className="ml-floater absolute -left-12 top-12 h-48 w-48 rounded-full blur-3xl"
                style={{ background: v.glow }}
              />

              {/* Vignette content */}
              <div className="relative flex h-full flex-col justify-end p-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
                  {v.city}
                </div>
                <div className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.4)] sm:text-4xl">
                  {v.moment}
                </div>
                <div className="mt-3 inline-flex items-center gap-2 self-start rounded-full border border-white/20 bg-black/30 px-3 py-1 font-mono text-[11px] text-white/85 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                  {v.pair}
                </div>
              </div>
            </div>
          ))}

          {/* Vignette progress dots */}
          <div className="absolute right-4 top-4 flex gap-1">
            {VIGNETTES.map((_, idx) => (
              <span
                key={idx}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: idx === i ? 18 : 6,
                  background: idx === i ? "#fff" : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>

          {/* Branding chip — top-left */}
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-white/85 backdrop-blur">
            <span className="grad-sunset h-1.5 w-1.5 rounded-full" />
            Real meetups · Real cities
          </div>
        </>
      )}

      {showSoundCta && !src && (
        <button
          type="button"
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/45 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-white backdrop-blur transition hover:bg-black/65"
          // No-op until the real cut lands; kept here so you can wire a modal
          // player later without a layout shift.
          onClick={(e) => e.preventDefault()}
        >
          <span className="grad-sunset flex h-5 w-5 items-center justify-center rounded-full">
            <Play size={10} className="text-white" fill="currentColor" />
          </span>
          Watch the story
          <Volume2 size={11} />
        </button>
      )}

      <style>{`
        @keyframes ml-float {
          0%, 100% { transform: translate3d(0, 0, 0) }
          50% { transform: translate3d(20px, -12px, 0) }
        }
        .ml-floater { animation: ml-float 9s ease-in-out infinite }
      `}</style>
    </div>
  );
}
