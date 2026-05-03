"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";

interface YourStoryProps {
  name: string | null;
  email: string | null;
  image: string | null;
}

// Instagram-style "Your story" entry: circular avatar with a + badge in the
// bottom-right. Click → opens camera/gallery (mobile) or file dialog (desktop).
// Upload posts to /api/stories which both creates a Story row and refreshes
// user.image so the new photo shows up immediately across the app.
export function YourStory({ name, email, image }: YourStoryProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const display = name ?? email ?? "you";

  const onClick = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/stories", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "upload failed");
      }
      // Refresh server components so SiteHeader avatar + StoriesRow update.
      startTransition(() => router.refresh());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        title="Add to your story"
        className="relative block disabled:cursor-wait"
      >
        {/* Gradient ring for emphasis */}
        <span
          aria-hidden
          className="grad-sunset block rounded-full p-[2px] shadow-[0_0_18px_rgba(255,106,61,0.35)]"
        >
          <span className="block rounded-full bg-bg p-[2px]">
            <Avatar name={display} size={42} imageUrl={image} />
          </span>
        </span>

        {/* + badge */}
        <span
          className={
            "absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-bg text-[10px] font-bold shadow-md transition " +
            (busy ? "bg-text text-bg" : "grad-sunset text-white")
          }
        >
          {busy ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Plus size={12} strokeWidth={3} />
          )}
        </span>
      </button>
      {error && (
        <span className="max-w-[120px] text-center text-[10px] text-magenta">
          {error}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        // `capture` opens the rear camera by default on mobile when present.
        // Removing it (or omitting) lets the user pick from gallery instead —
        // mobile browsers usually offer both options when capture is set to env.
        capture="environment"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
