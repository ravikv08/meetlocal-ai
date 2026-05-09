import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

// Renders a markdown file from /legal as a styled public-facing page.
// One server component used by every /terms /privacy /refund /etc route.
// If the markdown still has unfilled [BRACKETS] we surface a draft banner
// so the page is obviously pre-launch until the lawyer review lands.

interface LegalDocProps {
  filename: string;
  title: string;
}

export async function LegalDoc({ filename, title }: LegalDocProps) {
  const fullPath = path.join(process.cwd(), "legal", filename);
  let raw: string;
  try {
    raw = await fs.readFile(fullPath, "utf8");
  } catch {
    notFound();
  }

  // Strip the internal "first draft" admonition + lawyer-only header so it
  // doesn't confuse public readers; we replace it with a small disclaimer.
  // Using [\s\S] instead of `s` flag for older TS targets.
  const stripped = raw
    .replace(/^>\s+⚠️\s+\*\*First draft[\s\S]*?(?=\n\n|\n#|$)/gm, "")
    .replace(/^>\s+⚠️\s+\*\*NOT LEGAL ADVICE[\s\S]*?(?=\n\n|\n#|$)/gm, "");

  // Detect unfilled placeholders to render the draft banner.
  const placeholders = (raw.match(/\[[A-Z][A-Z0-9 _,/().'-]*\]/g) ?? []).filter(
    // Filter out things like [DATE] which are common but expected to remain
    // as instructions until the file is finalized.
    () => true,
  );
  const isDraft = placeholders.length > 0;

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <div className="font-mono text-xs uppercase tracking-[0.14em] text-coral">
          ● Legal · meetlocal.ai
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>

        {isDraft && (
          <div className="mt-6 rounded-2xl border border-amber/40 bg-amber/5 px-5 py-4 text-sm text-text-dim">
            <strong className="text-amber">Draft — pending finalization.</strong>{" "}
            This document is in lawyer review before public launch. Specific
            legal entity name, addresses, and effective dates will be filled in
            before this becomes binding.
          </div>
        )}

        <article
          className="mt-10 space-y-5 leading-relaxed text-text-dim
            [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-text [&_h2]:tracking-tight
            [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text
            [&_h4]:mt-6 [&_h4]:font-semibold [&_h4]:text-text
            [&_p]:text-text-dim
            [&_strong]:text-text
            [&_a]:text-coral [&_a]:underline [&_a]:underline-offset-2
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul>li]:mt-1.5
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:mt-1.5
            [&_li]:text-text-dim
            [&_table]:my-6 [&_table]:w-full [&_table]:text-sm
            [&_thead]:border-b [&_thead]:border-line-2 [&_thead]:text-left
            [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-text
            [&_td]:border-b [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_td]:align-top
            [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_code]:text-amber
            [&_hr]:my-10 [&_hr]:border-line"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripped}</ReactMarkdown>
        </article>

        <div className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-text-dim">
          <span className="font-mono text-text-muted">All legal:</span>
          <Link href="/terms" className="hover:text-text">Terms</Link>
          <Link href="/privacy" className="hover:text-text">Privacy</Link>
          <Link href="/refund" className="hover:text-text">Refund &amp; cancellation</Link>
          <Link href="/cookie-policy" className="hover:text-text">Cookies</Link>
          <Link href="/acceptable-use" className="hover:text-text">Acceptable use</Link>
          <Link href="/ic-agreement" className="hover:text-text">Local agreement</Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
