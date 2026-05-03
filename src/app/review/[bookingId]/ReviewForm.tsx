"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Star, X, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ReviewFormProps {
  bookingId: string;
  subjectId: string;
  subjectName: string;
  submittedAlready: boolean;
  ratePerHour: number;
  hours: number;
  reviewerKind: "traveler" | "local";
}

const TAGS_TRAVELER = [
  "Hidden spots",
  "Great food",
  "Safe vibe",
  "Local knowledge",
  "Photography",
  "Late-night",
];
const TAGS_LOCAL = [
  "Respectful",
  "On time",
  "Easy to host",
  "Good company",
  "Followed the plan",
];

// Faithful port of prototype's ReviewsScreen — 5-star rating + tag chips +
// textarea + sidebar with tip jar / trust info. Two-way: hidden until both
// sides have submitted (handled server-side in POST /api/reviews).
export function ReviewForm(props: ReviewFormProps) {
  const {
    bookingId,
    subjectId,
    subjectName,
    submittedAlready,
    ratePerHour,
    hours,
    reviewerKind,
  } = props;

  const [rating, setRating] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(submittedAlready);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tagOptions = reviewerKind === "traveler" ? TAGS_TRAVELER : TAGS_LOCAL;
  const subjectFirst = subjectName.split(" ")[0];

  const submit = () => {
    if (!rating) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bookingId,
          subjectId,
          rating,
          body: body.trim() || null,
          tags: picked,
        }),
      });
      if (!res.ok) {
        setError("Couldn't submit. Try again?");
        return;
      }
      setSubmitted(true);
    });
  };

  if (submitted) {
    const earned = ratePerHour * hours;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-10 py-20 text-center">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={28} className="fill-amber text-amber" />
          ))}
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight">
          Thanks, {reviewerKind === "traveler" ? "traveler" : "local"}.
        </h1>
        <p className="max-w-md text-lg leading-relaxed text-text-dim">
          {reviewerKind === "traveler"
            ? `${subjectFirst} earned ${formatPrice(earned)}. Your review helps the next traveler land with someone great.`
            : `Your feedback helps us keep the platform safe and the next traveler great to host.`}
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-text px-6 py-3 text-sm font-semibold text-bg"
        >
          {reviewerKind === "traveler" ? "Find your next local" : "Back to dashboard"}{" "}
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="flex items-center gap-3.5 border-b border-line px-10 py-5">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 bg-surface"
        >
          <X size={15} />
        </Link>
        <div className="font-mono text-xs uppercase tracking-wider text-text-dim">
          After meetup · Leave a review
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-10 py-14">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight">
              How was your time
              <br /> with <span className="grad-text">{subjectFirst}</span>?
            </h1>
            <p className="mt-3 text-base text-text-dim">
              {hours}h · {formatPrice(ratePerHour * hours)} total
            </p>

            <div className="mt-10">
              <Label>Overall</Label>
              <div className="mt-3.5 flex gap-2.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    onClick={() => setRating(i)}
                    className={
                      "p-1.5 transition " +
                      (rating >= i ? "text-amber" : "text-line-2 hover:text-amber")
                    }
                  >
                    <Star size={44} strokeWidth={1.6} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Label>What stood out?</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.map((tag) => {
                  const on = picked.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() =>
                        setPicked((p) =>
                          on ? p.filter((x) => x !== tag) : [...p, tag],
                        )
                      }
                      className={
                        "rounded-full border px-3.5 py-2.5 text-sm font-medium transition " +
                        (on
                          ? "border-text bg-text text-bg"
                          : "border-line-2 bg-surface text-text")
                      }
                    >
                      {on ? "✓ " : ""}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <Label>Tell future {reviewerKind === "traveler" ? "travelers" : "locals"}</Label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  reviewerKind === "traveler"
                    ? `${subjectFirst} took us to a tiny counter with 8 seats…`
                    : `Easy traveler, on time, respectful…`
                }
                rows={4}
                className="mt-3 w-full resize-y rounded-2xl border border-line-2 bg-surface p-4 text-sm outline-none transition focus:border-text-dim"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-magenta">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={!rating || isPending}
              className={
                "mt-7 inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-semibold transition " +
                (rating
                  ? "grad-sunset text-white shadow-[0_10px_30px_rgba(255,106,61,0.27)]"
                  : "cursor-not-allowed bg-surface-2 text-text-muted")
              }
            >
              {isPending ? "Publishing…" : "Publish review"} <ArrowRight size={15} />
            </button>
            <p className="mt-3 text-xs text-text-muted">
              Anonymous to {subjectFirst} until they also submit. Then both reviews go
              live at once.
            </p>
          </div>

          {/* Sidebar */}
          <aside className="space-y-3.5">
            <div className="rounded-3xl border border-line-2 bg-surface p-6">
              <Label>Trust</Label>
              <div className="mt-3 grid gap-3">
                {[
                  {
                    k: `Hidden from ${subjectFirst}`,
                    v: "Reviews publish only after both sides submit.",
                  },
                  {
                    k: "Earn $10 credit",
                    v: "Invite a friend who books their first trip.",
                  },
                  {
                    k: "Report a concern",
                    v: "24/7 human support · 2 min avg response.",
                  },
                ].map((it) => (
                  <div key={it.k} className="text-sm">
                    <div className="font-medium">{it.k}</div>
                    <div className="mt-1 text-xs text-text-dim">{it.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-dim">
      {children}
    </div>
  );
}
