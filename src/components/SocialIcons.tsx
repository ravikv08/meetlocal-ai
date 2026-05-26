// Inline brand SVGs — lucide-react v1 dropped trademarked logos so we ship our
// own minimal monochrome glyphs. All paths use currentColor so we can tint via
// CSS instead of hardcoding fills per icon.

interface SocialLink {
  href: string;
  label: string;
  Icon: (props: { size: number }) => React.JSX.Element;
  color: string;
}

interface SocialIconsProps {
  instagramHandle?: string | null;
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  twitterHandle?: string | null;
  snapchatHandle?: string | null;
  lumaUrl?: string | null;
  websiteUrl?: string | null;
  size?: "sm" | "md";
}

export function SocialIcons({
  instagramHandle,
  linkedinUrl,
  facebookUrl,
  twitterHandle,
  snapchatHandle,
  lumaUrl,
  websiteUrl,
  size = "md",
}: SocialIconsProps) {
  const links: SocialLink[] = [];

  // Backwards-compat: instagramHandle / twitterHandle / snapchatHandle used to
  // be just the handle ("@you"); the apply form now collects full URLs. If
  // the stored value starts with http we treat it as a URL, else as a handle.
  const asUrl = (value: string, prefix: string) =>
    /^https?:\/\//i.test(value)
      ? value
      : `${prefix}${value.replace(/^@/, "")}`;

  if (instagramHandle) {
    links.push({
      href: asUrl(instagramHandle, "https://instagram.com/"),
      label: "Instagram",
      Icon: InstagramGlyph,
      color: "#E1306C",
    });
  }
  if (linkedinUrl) {
    links.push({
      href: linkedinUrl,
      label: "LinkedIn",
      Icon: LinkedinGlyph,
      color: "#0A66C2",
    });
  }
  if (facebookUrl) {
    links.push({
      href: facebookUrl,
      label: "Facebook",
      Icon: FacebookGlyph,
      color: "#1877F2",
    });
  }
  if (twitterHandle) {
    links.push({
      href: asUrl(twitterHandle, "https://x.com/"),
      label: "X",
      Icon: XGlyph,
      color: "#FFFFFF",
    });
  }
  if (snapchatHandle) {
    links.push({
      href: asUrl(snapchatHandle, "https://www.snapchat.com/add/"),
      label: "Snapchat",
      Icon: SnapchatGlyph,
      color: "#FFFC00",
    });
  }
  if (lumaUrl) {
    links.push({
      href: lumaUrl,
      label: "Luma",
      Icon: LumaGlyph,
      color: "#8B5CF6",
    });
  }
  if (websiteUrl) {
    links.push({
      href: websiteUrl,
      label: "Website",
      Icon: GlobeGlyph,
      color: "#FFB84D",
    });
  }

  if (links.length === 0) return null;

  const dims = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const iconPx = size === "sm" ? 14 : 17;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {links.map((l) => {
        const Icon = l.Icon;
        return (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`${l.label} →`}
            className={`${dims} group relative inline-flex items-center justify-center rounded-full border border-line-2 bg-bg-2 text-text-dim transition hover:-translate-y-0.5 hover:border-coral/60 hover:text-text`}
          >
            <Icon size={iconPx} />
            <span
              className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition group-hover:opacity-25"
              style={{ background: l.color }}
            />
          </a>
        );
      })}
    </div>
  );
}

// ─── Brand glyphs ──────────────────────────────────────────────────────

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
  // Stylized "lu" mark — placeholder until we get an official asset
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
