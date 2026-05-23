import Link from "next/link";
import { Heart, MessageSquare, Wallet, Zap } from "lucide-react";

interface SiteFooterProps {
  liveCount?: number;
}

const NAV_ITEMS = [
  { href: "/reels", label: "Reels", Icon: Zap },
  { href: "/trips", label: "Chat", Icon: MessageSquare },
  { href: "/", label: "Book", Icon: Wallet },
  { href: "/become-a-local", label: "Become a local", Icon: Heart },
];

const LEGAL_LINKS = [
  { href: "/safety", label: "Trust & safety" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/refund", label: "Refund policy" },
  { href: "/cookie-policy", label: "Cookies" },
  { href: "/ic-agreement", label: "Local agreement" },
];

export function SiteFooter({ liveCount }: SiteFooterProps) {
  return (
    <footer className="border-t border-line px-14 pb-4 pt-6">
      {/* Nav row — primary destinations */}
      <div className="flex flex-wrap items-center gap-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95"
          >
            <Icon size={15} />
            <span>{label}</span>
          </Link>
        ))}
        {typeof liveCount === "number" && (
          <div className="ml-auto flex items-center gap-2 font-mono text-xs text-text-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {liveCount} locals online now
          </div>
        )}
      </div>

      {/* Tight divider — just enough whitespace to read as two rows, not so
          much that the legal row floats off on its own. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4 text-sm text-text-dim">
        <span className="font-mono text-text-muted">© 2026 meetlocal.ai</span>
        {LEGAL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="transition hover:text-text">
            {l.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
