"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { submitReportUser } from "@/lib/feedback-actions";

// Safety: report-a-user button surfaced in chat. Opens an inline modal,
// captures the reason, fires submitReportUser action which (a) records to
// the Feedback table and (b) immediately emails the safety inbox.

interface ReportUserButtonProps {
  reportedUserId: string;
  reportedUserName: string;
  bookingId?: string;
}

export function ReportUserButton({
  reportedUserId,
  reportedUserName,
  bookingId,
}: ReportUserButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("reportedUserId", reportedUserId);
    if (bookingId) fd.set("bookingId", bookingId);
    startTransition(async () => {
      const res = await submitReportUser(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
          setReason("");
        }, 2200);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Report this user"
        className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-xs text-text-dim transition hover:border-magenta/50 hover:text-magenta"
      >
        <AlertTriangle size={13} /> Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="vibrancy-dark relative w-full max-w-md rounded-2xl border border-line-2 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => !isPending && setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-text-muted transition hover:bg-surface-2 hover:text-text"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {!submitted ? (
              <form onSubmit={submit}>
                <div className="grad-sunset inline-flex h-9 w-9 items-center justify-center rounded-lg text-white">
                  <AlertTriangle size={16} />
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  Report {reportedUserName}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  Tell us what happened. The founder personally reads every
                  safety report and responds within hours. For imminent
                  danger, <strong className="text-text">dial 911 first</strong>.
                </p>
                <textarea
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  minLength={5}
                  maxLength={2000}
                  rows={5}
                  placeholder="What happened? Be specific."
                  className="mt-4 w-full rounded-xl border border-line-2 bg-bg-2 px-3 py-2.5 text-sm text-text outline-none transition focus:border-coral/50"
                />
                {error && (
                  <p className="mt-2 text-xs text-magenta">{error}</p>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => !isPending && setOpen(false)}
                    className="rounded-full border border-line-2 px-4 py-2 text-sm text-text-dim transition hover:text-text"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || reason.length < 5}
                    className="grad-sunset rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,106,61,0.30)] transition hover:opacity-95 disabled:opacity-60"
                  >
                    {isPending ? "Sending…" : "Send report"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center">
                <div className="grad-sunset mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(255,106,61,0.45)]">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                  Got it. We&apos;re on this.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-dim">
                  Founder has been alerted. You&apos;ll hear back within hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
