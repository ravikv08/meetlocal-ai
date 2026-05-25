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
import { Avatar } from "@/components/Avatar";

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

  return (
    <section>
      <h2 className="grad-text font-display text-3xl font-bold tracking-tight">
        Meet your Local
      </h2>

      <div className="mt-5 overflow-hidden rounded-3xl border border-line-2 bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
        {/* Identity row */}
        <div className="flex flex-wrap items-start gap-6 p-7 sm:flex-nowrap">
          <div className="relative shrink-0">
            <Avatar name={name} size={108} imageUrl={avatarUrl} />
            {idVerified && (
              <span
                title="ID verified"
                className="grad-sunset absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-white shadow-md"
              >
                <BadgeCheck size={14} strokeWidth={2.5} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-3xl font-bold tracking-tight">
              {name}
            </div>
            <p className="mt-1.5 max-w-xl text-base leading-relaxed text-text">
              {tagline}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-3 text-sm text-text-dim">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={14} className="text-coral/70" />
                {cityFull}
              </span>
              {languages.length > 0 && (
                <>
                  <span className="text-text-muted">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Languages size={14} className="text-coral/70" />
                    {languages.join(" · ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 border-t border-line">
          <Stat n={reviewCount.toString()} label="Reviews" />
          <Stat
            n={typeof rating === "number" ? rating.toFixed(1) : "—"}
            label="Rating"
            accent
            withSeparators
          />
          <Stat
            n={(yearsHosting ?? yearsInCity).toString()}
            label={yearsHosting ? "Years hosting" : "Years local"}
          />
        </div>

        {/* Host details */}
        <div className="border-t border-line p-7">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Host details
          </div>
          <ul className="mt-3 grid gap-3 text-sm text-text-dim sm:grid-cols-2">
            {responseRate !== null && (
              <DetailItem icon={<MessageCircle size={13} />}>
                Response rate:{" "}
                <strong className="text-text">{responseRate}%</strong>
              </DetailItem>
            )}
            {responseLabel && (
              <DetailItem icon={<Clock size={13} />}>
                Responds <strong className="text-text">{responseLabel}</strong>
              </DetailItem>
            )}
            <DetailItem icon={<Calendar size={13} />}>
              Local for{" "}
              <strong className="text-text">{yearsInCity} years</strong>
            </DetailItem>
            {(idVerified || bgChecked) && (
              <DetailItem icon={<Star size={13} />}>
                {idVerified && bgChecked
                  ? "ID verified · Background checked"
                  : idVerified
                  ? "ID verified"
                  : "Background checked"}
              </DetailItem>
            )}
          </ul>

          {/* Social profiles — clickable rows that open in a new tab */}
          {socialRows.length > 0 && (
            <>
              <div className="mt-6 flex items-baseline justify-between">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  Verify on the open web
                </div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Tap to open
                </div>
              </div>
              <ul className="mt-3 grid gap-2">
                {socialRows.map((row) => {
                  const Icon = row.Icon;
                  return (
                    <li key={row.label}>
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5 transition hover:border-coral/50 hover:bg-surface-2"
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text"
                          style={{
                            background: `linear-gradient(135deg, ${row.color}33, ${row.color}1a)`,
                            color: row.color,
                          }}
                        >
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-text">
                            {row.label}
                          </div>
                          <div className="truncate font-mono text-xs text-text-dim">
                            {row.preview}
                          </div>
                        </div>
                        <ExternalLink
                          size={14}
                          className="shrink-0 text-text-muted transition group-hover:text-coral"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
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
  label,
  accent,
  withSeparators,
}: {
  n: string;
  label: string;
  accent?: boolean;
  withSeparators?: boolean;
}) {
  return (
    <div
      className={
        "px-4 py-5 text-center " +
        (withSeparators ? "border-x border-line" : "")
      }
    >
      <div
        className={
          "flex items-baseline justify-center gap-1 font-display text-3xl font-bold leading-none tracking-tight " +
          (accent ? "grad-text" : "text-text")
        }
      >
        {n}
        {accent && <Star size={14} className="fill-amber text-amber" />}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span className="grad-sunset flex h-7 w-7 items-center justify-center rounded-full text-white">
        {icon}
      </span>
      <span>{children}</span>
    </li>
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
