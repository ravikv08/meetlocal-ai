"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, ArrowRight } from "lucide-react";

// Desktop-only exit-intent modal. Triggers when the cursor leaves the
// viewport from the top edge (Meta's classic "mouse heading for the close
// button" signal). Fires at most once per session — we set sessionStorage
// flag so a user can't be re-prompted on the same visit.
//
// Mobile: skipped entirely (no analogous gesture; intrusive on touch UX).

interface Props {
  /** Free-text source label so we can A/B which surfaces work. */
  source: string;
  /** Pre-fill if known (e.g. derived from CITIES on a single-city site). */
  city?: string;
}

const SESSION_KEY = "ml-exit-intent-shown";

export function ExitIntentEmailCapture({ source, city }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already shown this session — don't re-trigger.
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    // Skip on touch devices — exit-intent is a pointer gesture.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseOut = (e: MouseEvent) => {
      if (fired.current) return;
      // Cursor leaves top of viewport AND has moved into the chrome area.
      if (e.clientY <= 0 && !e.relatedTarget) {
        fired.current = true;
        sessionStorage.setItem(SESSION_KEY, "1");
        setOpen(true);
      }
    };
    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, []);

  const close = () => setOpen(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("submitting");
    setErrMsg(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source, city }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setStatus("ok");
      setTimeout(close, 2500);
    } catch (err) {
      setStatus("error");
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(14,11,8,0.78)", backdropFilter: "blur(8px)" }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-line-2 bg-surface p-7 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
        style={{
          backgroundImage:
            "linear-gradient(160deg, rgba(255,106,61,0.10), rgba(255,46,120,0.06) 60%, rgba(28,23,19,1) 100%)",
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-bg-2 text-text-dim transition hover:text-text"
        >
          <X size={14} />
        </button>

        {status === "ok" ? (
          <div className="py-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-good/15 text-good">
              <Mail size={20} />
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              You&rsquo;re on the list.
            </h2>
            <p className="mt-2 text-sm text-text-dim">
              We&rsquo;ll email you the moment a Bay Area local in your vibe
              goes live.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-coral">
              <span className="h-1.5 w-1.5 animate-ml-pulse rounded-full bg-coral" />
              Wait — one thing
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
              First Bay Area locals
              <br />
              go live this week.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-dim">
              We&rsquo;ll email you the second one matches your vibe. No spam,
              one email when it&rsquo;s your moment.
            </p>

            <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                disabled={status === "submitting"}
                className="w-full rounded-xl border border-line-2 bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted outline-none focus:border-coral"
              />
              <button
                type="submit"
                disabled={status === "submitting" || !email.trim()}
                className="grad-sunset inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.32)] transition hover:opacity-95 disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Notify me"}
                {status !== "submitting" && <ArrowRight size={14} />}
              </button>
              {errMsg && <p className="text-xs text-magenta">{errMsg}</p>}
            </form>

            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Or close — no hard feelings
            </p>
          </>
        )}
      </div>
    </div>
  );
}
