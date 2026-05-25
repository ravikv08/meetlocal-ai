"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";

interface Props {
  localProfileId: string;
  label?: string;
}

// Starts the Stripe Identity hosted flow and redirects the user to it.
// Shown on the apply success state when the local hasn't completed ID
// verification yet. Webhook handles the success side (idVerified=true).
export function IdentityVerificationButton({
  localProfileId,
  label = "Verify your identity",
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/identity/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ localProfileId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className="grad-sunset inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(255,106,61,0.27)] transition hover:opacity-95 disabled:opacity-60"
      >
        <ShieldCheck size={15} />
        {pending ? "Opening Stripe…" : label}
        {!pending && <ArrowRight size={14} />}
      </button>
      <p className="max-w-sm text-center text-xs text-text-dim">
        We use Stripe Identity for ID verification (~2 min, all on
        stripe.com). Your photos never touch our servers.
      </p>
      {error && (
        <p className="text-xs text-magenta">Could not start verification: {error}</p>
      )}
    </div>
  );
}
