"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ReferralLinkProps {
  link: string;
  firstName: string;
}

// The actual "copy your referral link" UI. Two actions: copy to clipboard
// + native-share (mobile). Native share handles SMS / WhatsApp / etc. for
// free where supported; falls back to clipboard everywhere else.

export function ReferralLink({ link, firstName }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${firstName} just sent you $15 toward a meetlocal local — vetted humans who show you the real version of a new city. ${link}`;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Older browsers — select + copy fallback
      const sel = document.createElement("textarea");
      sel.value = link;
      document.body.appendChild(sel);
      sel.select();
      document.execCommand("copy");
      document.body.removeChild(sel);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const onShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "meetlocal.ai",
          text: shareText,
          url: link,
        });
      } catch {
        // user cancelled — no-op
      }
    } else {
      // Desktop fallback — just copy the share text
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        /* no-op */
      }
    }
  };

  return (
    <div className="rounded-2xl border border-line-2 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 truncate rounded-xl border border-line bg-bg-2 px-4 py-3 font-mono text-xs text-text-dim">
          {link}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={
            "inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition " +
            (copied
              ? "bg-good text-bg"
              : "grad-sunset text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] hover:opacity-95")
          }
        >
          {copied ? (
            <>
              <Check size={14} /> Copied
            </>
          ) : (
            <>
              <Copy size={14} /> Copy link
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-4 py-2.5 text-sm font-medium text-text transition hover:bg-surface-2"
        >
          <Share2 size={14} /> Share
        </button>
      </div>
    </div>
  );
}
