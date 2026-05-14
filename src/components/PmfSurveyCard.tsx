"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { submitPmfSurvey } from "@/lib/feedback-actions";

// Sean Ellis PMF survey ("How would you feel if meetlocal disappeared")
// Rendered in chat after a completed booking. Dismissible.
// Per GROWTH_PLAYBOOK § 1 — ≥40% "very" = strong PMF signal.

interface PmfSurveyCardProps {
  bookingId?: string;
}

type Answer = "very" | "somewhat" | "not";

export function PmfSurveyCard({ bookingId }: PmfSurveyCardProps) {
  const [hidden, setHidden] = useState(false);
  const [answered, setAnswered] = useState<Answer | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (hidden) return null;

  const submit = (answer: Answer) => {
    setError(null);
    setAnswered(answer);
    const fd = new FormData();
    fd.set("answer", answer);
    if (note.trim()) fd.set("note", note.trim());
    if (bookingId) fd.set("bookingId", bookingId);
    startTransition(async () => {
      const res = await submitPmfSurvey(fd);
      if (res?.error) {
        setError(res.error);
        setAnswered(null);
      }
    });
  };

  if (answered) {
    return (
      <div className="mx-4 my-3 rounded-2xl border border-good/40 bg-good/10 p-4 text-sm">
        <strong className="text-good">Thank you.</strong>{" "}
        <span className="text-text-dim">
          Your answer is the most useful signal a founder gets. We&apos;ll keep
          building accordingly.
        </span>
      </div>
    );
  }

  return (
    <div className="mx-4 my-3 rounded-2xl border border-coral/40 bg-coral/[0.06] p-4">
      <div className="flex items-start gap-3">
        <div className="grad-sunset flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-[0_4px_12px_rgba(255,106,61,0.35)]">
          <Heart size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] uppercase tracking-wider text-coral">
            Quick founder question · 5 sec
          </div>
          <p className="mt-1 text-sm font-semibold text-text">
            If meetlocal disappeared tomorrow, how would you feel?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                { id: "very", label: "Very disappointed" },
                { id: "somewhat", label: "Somewhat disappointed" },
                { id: "not", label: "Not disappointed" },
              ] as { id: Answer; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => submit(opt.id)}
                disabled={isPending}
                className="rounded-full border border-line-2 bg-surface px-3.5 py-1.5 text-xs font-medium text-text transition hover:border-coral/50 hover:bg-surface-2 disabled:opacity-50"
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setHidden(true)}
              className="rounded-full px-3.5 py-1.5 text-xs text-text-muted transition hover:text-text-dim"
            >
              Skip
            </button>
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="(optional) why?"
            className="mt-3 w-full rounded-xl border border-line bg-bg-2 px-3 py-2 text-xs text-text outline-none transition focus:border-coral/40"
          />
          {error && (
            <p className="mt-2 text-xs text-magenta">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
