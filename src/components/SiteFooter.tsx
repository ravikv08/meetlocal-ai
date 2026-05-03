import Link from "next/link";

export function SiteFooter({ liveCount }: { liveCount?: number }) {
  return (
    <footer className="border-t border-line px-14 py-10">
      <div className="flex items-center gap-12 text-sm text-text-dim">
        <span className="font-mono text-text-muted">© 2026 meetlocal.ai</span>
        <Link href="/safety">Trust &amp; safety</Link>
        <Link href="/help">Help</Link>
        <Link href="/press">Press</Link>
        <Link href="/careers">Careers</Link>
        <div className="flex-1" />
        {typeof liveCount === "number" && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-good" />
            {liveCount} locals online now
          </div>
        )}
      </div>
    </footer>
  );
}
