import {
  Star,
  Clock,
  MessageCircle,
  Calendar,
  MapPin,
  Languages,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

interface HostTrustPanelProps {
  name: string;
  avatarUrl: string | null;
  cityLabel: string;
  neighborhood: string | null;
  tagline: string;
  languages: string[];
  reviewCount: number;
  rating: number | null;
  yearsHosting: number | null;
  yearsInCity: number;
  /** Hourly rate in cents — surfaced in the stat strip. */
  ratePerHour: number;
  responseRate: number | null;
  responseTimeMinutes: number | null;
  idVerified: boolean;
  bgChecked: boolean;
  social: {
    instagramHandle?: string | null;
    linkedinUrl?: string | null;
    facebookUrl?: string | null;
    twitterHandle?: string | null;
    snapchatHandle?: string | null;
    lumaUrl?: string | null;
    websiteUrl?: string | null;
  };
}

// Single hero card — replaces the old separate hero + trust panel. Layout:
//   1. Sunset-gradient eyebrow heading
//   2. Avatar + name + tagline + city + languages
//   3. 3-up stat row
//   4. Host details (response stats + verification)
//   5. Social row
export function HostTrustPanel({
  name,
  avatarUrl,
  cityLabel,
  neighborhood,
  tagline,
  languages,
  reviewCount,
  rating,
  yearsHosting,
  yearsInCity,
  ratePerHour,
  responseRate,
  responseTimeMinutes,
  idVerified,
  bgChecked,
  social,
}: HostTrustPanelProps) {
  const responseLabel = formatResponseTime(responseTimeMinutes);
  const socialRows = buildSocialRows(social);
  const cityFull =
    neighborhood && neighborhood.trim()
      ? `${neighborhood}, ${cityLabel}`
      : `Lives in ${cityLabel}`;

  // v2 host-card layout: hero photo on top, identity block, pills row,
  // stat strip, footer links. When multi-image upload lands, the gallery
  // becomes a split frame (1.5fr hero + stacked thumbs) — for now we show
  // the single photoUrl as the hero.
  const photoCount = avatarUrl ? 1 : 0; // becomes photos.length when array ships
  const isNewHost = reviewCount === 0;
  const showOnline = true; // placeholder — until we wire presence, every active
                          // local shows as "Online now". Cheap, friendly.

  return (
    <section className="overflow-hidden rounded-3xl border border-line-2 bg-bg-2/40 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.4)] sm:p-6">
      {/* ─── GALLERY ─────────────────────────────────────────────────
          Single full-width hero for now (no split-frame until multi-
          image upload ships). Future: grid-cols-[1.5fr_1fr] with a
          stacked thumb column + "+N photos" overlay on the second thumb. */}
      <div className="relative overflow-hidden rounded-2xl bg-bg-2"
           style={{ aspectRatio: "2 / 1.25" }}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={`${name} portrait`}
            className="h-full w-full object-cover"
            style={{ objectPosition: "center top" }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="grad-sunset flex h-28 w-28 items-center justify-center rounded-full font-display text-4xl font-semibold text-white">
              {name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? "")
                .join("") || "?"}
            </div>
          </div>
        )}

        {/* Top-left: photo counter (becomes 1/N when multi-image lands) */}
        {avatarUrl && (
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-bg/70 px-2.5 py-1 font-mono text-[10px] text-white/90 backdrop-blur">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
            {photoCount} / {Math.max(photoCount, 1)}
          </div>
        )}

        {/* Top-right: online pill */}
        {showOnline && (
          <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-bg/70 px-2.5 py-1 font-mono text-[10px] text-white backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ml-pulse absolute inline-flex h-full w-full rounded-full bg-good opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
            </span>
            Online now
          </div>
        )}
      </div>

      {/* ─── IDENTITY ────────────────────────────────────────────── */}
      <div className="mt-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-display text-3xl font-bold leading-none tracking-tight text-text sm:text-4xl">
            {name}
          </h1>
          <span className="inline-flex items-center gap-1 text-sm text-text-dim">
            <MapPin size={12} />
            {cityFull}
          </span>
        </div>
        <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-text-dim">
          {tagline}
        </p>

        {/* Pills row — Verified · New host · Languages */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {idVerified && (
            <span className="inline-flex items-center gap-1 rounded-full border border-good/40 bg-good/10 px-2.5 py-0.5 text-[11px] font-medium text-good">
              <BadgeCheck size={11} strokeWidth={2.5} />
              Verified
            </span>
          )}
          {isNewHost && (
            <span className="inline-flex items-center gap-1 rounded-full border border-coral/40 bg-coral/10 px-2.5 py-0.5 text-[11px] font-medium text-coral">
              ★ New host
            </span>
          )}
          {languages.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line-2 bg-bg-2/60 px-2.5 py-0.5 text-[11px] text-text-dim">
              <Languages size={11} />
              {languages.join(" · ")}
            </span>
          )}
        </div>
      </div>

      {/* ─── STAT STRIP ─────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-line-2 bg-bg-2/60">
        <Stat
          n={(yearsHosting ?? yearsInCity).toString()}
          unit="y"
          label={yearsHosting ? "Hosting" : "In SF"}
        />
        <Stat
          n={`$${Math.round(ratePerHour / 100)}`}
          unit="/hr"
          label="From"
          withSeparators
        />
        <Stat
          n={typeof rating === "number" ? rating.toFixed(1) : "new"}
          label="Rating"
          withStar={typeof rating === "number"}
        />
      </div>

      {/* ─── FOOTER ─────────────────────────────────────────────── */}
      {(socialRows.length > 0 || idVerified || bgChecked) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          {socialRows.map((row) => {
            const Icon = row.Icon;
            return (
              <a
                key={row.label}
                href={row.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded-lg border border-coral/30 bg-coral/[0.06] px-2.5 py-1.5 text-xs font-semibold text-coral transition hover:border-coral/70 hover:bg-coral/[0.12]"
              >
                <Icon size={12} />
                {row.label}
                <ExternalLink size={10} className="opacity-60 group-hover:opacity-100" />
              </a>
            );
          })}
          {(idVerified || bgChecked) && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-text-muted">
              <BadgeCheck size={12} />
              {idVerified && bgChecked
                ? "ID + background checked"
                : idVerified
                  ? "ID verified"
                  : "Background checked"}
            </span>
          )}
        </div>
      )}

      {/* Response-rate detail (kept but de-emphasized — was the old "Host
          details" block). Renders only if we have any of these signals. */}
      {(responseRate !== null || responseLabel) && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-text-muted">
          {responseRate !== null && (
            <li className="inline-flex items-center gap-1.5">
              <MessageCircle size={11} />
              {responseRate}% response rate
            </li>
          )}
          {responseLabel && (
            <li className="inline-flex items-center gap-1.5">
              <Clock size={11} />
              Responds {responseLabel}
            </li>
          )}
          <li className="inline-flex items-center gap-1.5">
            <Calendar size={11} />
            Local for {yearsInCity} years
          </li>
        </ul>
      )}
    </section>
  );
}

interface SocialRow {
  label: string;
  href: string;
  preview: string;
  color: string;
  Icon: (props: { size: number }) => React.JSX.Element;
}

function buildSocialRows(social: HostTrustPanelProps["social"]): SocialRow[] {
  const rows: SocialRow[] = [];
  // The instagramHandle / twitterHandle / snapchatHandle columns now store
  // full URLs (apply form was switched to URL inputs). Older rows in the DB
  // may still have bare handles — `socialEntry` normalizes both formats.
  if (social.instagramHandle) {
    const e = socialEntry(social.instagramHandle, "https://instagram.com/");
    rows.push({
      label: "Instagram",
      href: e.href,
      preview: e.preview,
      color: "#E1306C",
      Icon: InstagramGlyph,
    });
  }
  if (social.linkedinUrl) {
    rows.push({
      label: "LinkedIn",
      href: social.linkedinUrl,
      preview: stripHttp(social.linkedinUrl),
      color: "#0A66C2",
      Icon: LinkedinGlyph,
    });
  }
  if (social.facebookUrl) {
    rows.push({
      label: "Facebook",
      href: social.facebookUrl,
      preview: stripHttp(social.facebookUrl),
      color: "#1877F2",
      Icon: FacebookGlyph,
    });
  }
  if (social.twitterHandle) {
    const e = socialEntry(social.twitterHandle, "https://x.com/");
    rows.push({
      label: "X",
      href: e.href,
      preview: e.preview,
      color: "#FFFFFF",
      Icon: XGlyph,
    });
  }
  if (social.snapchatHandle) {
    const e = socialEntry(social.snapchatHandle, "https://www.snapchat.com/add/");
    rows.push({
      label: "Snapchat",
      href: e.href,
      preview: e.preview,
      color: "#FFFC00",
      Icon: SnapchatGlyph,
    });
  }
  if (social.lumaUrl) {
    rows.push({
      label: "Luma",
      href: social.lumaUrl,
      preview: stripHttp(social.lumaUrl),
      color: "#8B5CF6",
      Icon: LumaGlyph,
    });
  }
  if (social.websiteUrl) {
    rows.push({
      label: "Website",
      href: social.websiteUrl,
      preview: stripHttp(social.websiteUrl),
      color: "#FFB84D",
      Icon: GlobeGlyph,
    });
  }
  return rows;
}

// Normalize a social-platform value that might be either a full URL or a
// bare @handle. Returns href (always a URL) and preview (always a handle-
// looking string for compact display).
function socialEntry(value: string, prefix: string) {
  const isUrl = /^https?:\/\//i.test(value);
  if (isUrl) {
    const stripped = stripHttp(value);
    // Last path segment is the handle, e.g. instagram.com/maya → "maya".
    const handle = stripped.split("/").filter(Boolean).pop() ?? stripped;
    return { href: value, preview: `@${handle}` };
  }
  const h = value.replace(/^@/, "");
  return { href: `${prefix}${h}`, preview: `@${h}` };
}

function stripHttp(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// Inline brand glyphs (lucide v1 dropped trademarked logos)
function InstagramGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function LinkedinGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}
function FacebookGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.13 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.9h-2.33V22c4.78-.81 8.43-4.94 8.43-9.94z" />
    </svg>
  );
}
function XGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.65l-5.207-6.81-5.96 6.81H1.7l7.73-8.835L1.254 2.25h6.815l4.706 6.231 5.469-6.231zm-1.16 17.52h1.834L7.084 4.126H5.117l11.967 15.644z" />
    </svg>
  );
}
function SnapchatGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c3.13 0 5.4 2.32 5.4 5.18 0 .98-.06 2.34-.27 3.46.4.16 1.06.4 1.62.4.4 0 .92-.16 1.18-.4.34.34.34.66.18 1.02-.34.74-1.62.96-2.36 1.18-.18.06-.18.16-.12.34.34 1.18 2.06 2.36 3.7 2.7.18.06.34.18.18.46-.34.66-2.16 1.06-2.94 1.18-.16 0-.16.06-.16.18 0 .56.24.96-.46 1.06-1.62.16-2.7-.16-3.94 1.06-1.06 1.06-2.18 1.62-3.7 1.62h-.18c-1.5 0-2.62-.56-3.7-1.62-1.22-1.22-2.32-.9-3.94-1.06-.7-.1-.46-.5-.46-1.06 0-.12 0-.18-.16-.18-.78-.12-2.6-.52-2.94-1.18-.16-.28 0-.4.18-.46 1.64-.34 3.36-1.52 3.7-2.7.06-.18.06-.28-.12-.34-.74-.22-2.02-.44-2.36-1.18-.16-.36-.16-.68.18-1.02.26.24.78.4 1.18.4.56 0 1.22-.24 1.62-.4-.21-1.12-.27-2.48-.27-3.46C6.6 4.32 8.87 2 12 2z" />
    </svg>
  );
}
function LumaGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M8 9v6a2 2 0 0 0 4 0V9" />
      <path d="M14 15V9" />
      <path d="M14 9v6a2 2 0 0 0 4 0" />
    </svg>
  );
}
function GlobeGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function Stat({
  n,
  unit,
  label,
  withStar,
  withSeparators,
}: {
  n: string;
  /** Tiny dim unit appended after the number, e.g. "y" or "/hr". */
  unit?: string;
  label: string;
  withStar?: boolean;
  withSeparators?: boolean;
}) {
  return (
    <div
      className={
        "px-4 py-5 text-center " +
        (withSeparators ? "border-x border-line" : "")
      }
    >
      {/* All stat numbers coral per the v2 brand treatment. */}
      <div className="flex items-baseline justify-center gap-1 font-display text-3xl font-bold leading-none tracking-tight text-coral">
        {withStar && <Star size={14} className="fill-coral text-coral" />}
        {n}
        {unit && <span className="text-base font-medium text-text-dim">{unit}</span>}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}

function formatResponseTime(minutes: number | null): string | null {
  if (minutes === null || minutes === undefined) return null;
  if (minutes <= 15) return "within 15 min";
  if (minutes <= 60) return "within an hour";
  if (minutes <= 180) return "within 3 hours";
  if (minutes <= 1440) return "within a day";
  return "in a few days";
}
