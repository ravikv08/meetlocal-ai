"use client";

import { useRef, useState } from "react";
import { Camera, Upload as UploadIcon, X } from "lucide-react";

interface PhotoUploadProps {
  name: string; // form field name used to surface the URL on submit
  initialUrl?: string | null;
  label?: string;
  /** Force light text/icon for use on dark backgrounds */
  variant?: "paper" | "dark";
}

// Simple controlled photo upload. POSTs to /api/upload, stores returned URL
// in a hidden input so it round-trips on form submit.
export function PhotoUpload({
  name,
  initialUrl,
  label = "Profile photo",
  variant = "paper",
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "upload failed");
      }
      const { url: newUrl } = (await res.json()) as { url: string };
      setUrl(newUrl);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      // reset input so picking the same file again works
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isPaper = variant === "paper";
  const labelColor = isPaper ? "text-ink-muted" : "text-text-muted";
  const placeholderBg = isPaper ? "bg-paper border-hair-2" : "bg-surface border-line-2";
  const buttonBg = isPaper
    ? "bg-paper border-hair-2 text-ink hover:bg-paper-bg"
    : "bg-surface border-line-2 text-text hover:bg-surface-2";

  return (
    <div>
      <div className={`font-mono text-[10px] uppercase tracking-wider ${labelColor}`}>
        {label}
      </div>
      <div className="mt-2 flex items-center gap-4">
        {url ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="upload preview"
              width={88}
              height={88}
              className="h-22 w-22 rounded-2xl object-cover"
              style={{ width: 88, height: 88 }}
            />
            <button
              type="button"
              onClick={() => setUrl(null)}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-magenta text-white shadow-md"
              title="Remove"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div
            className={`flex h-22 w-22 items-center justify-center rounded-2xl border border-dashed ${placeholderBg}`}
            style={{ width: 88, height: 88 }}
          >
            <Camera size={22} className={isPaper ? "text-ink-muted" : "text-text-muted"} />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onPick}
            disabled={uploading}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${buttonBg} disabled:opacity-60`}
          >
            <UploadIcon size={14} />
            {uploading ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
          </button>
          <p className={`text-xs ${isPaper ? "text-ink-muted" : "text-text-muted"}`}>
            JPG / PNG / WebP. Max 8 MB.
          </p>
          {error && <p className="text-xs text-magenta">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onChange}
      />
      {/* Hidden field carries the URL on form submit */}
      <input type="hidden" name={name} value={url ?? ""} />
    </div>
  );
}
