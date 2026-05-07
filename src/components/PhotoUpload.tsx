"use client";

import { useState } from "react";
import { FileTrigger, Button as AriaButton } from "react-aria-components";
import { Camera, Upload as UploadIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  name: string; // form field name used to surface the URL on submit
  initialUrl?: string | null;
  label?: string;
  /** Force light text/icon for use on dark backgrounds */
  variant?: "paper" | "dark";
}

const ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Photo upload built on Aria FileTrigger — proper button semantics, no hidden
// <input> click-shim. POSTs to /api/upload and stores the returned URL in a
// hidden field so it round-trips on form submit.
export function PhotoUpload({
  name,
  initialUrl,
  label = "Profile photo",
  variant = "paper",
}: PhotoUploadProps) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (files: FileList | null) => {
    const file = files?.[0];
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
    }
  };

  const isPaper = variant === "paper";
  const labelColor = isPaper ? "text-ink-muted" : "text-text-muted";
  const placeholderBg = isPaper
    ? "bg-paper border-hair-2"
    : "bg-surface border-line-2";
  const buttonBg = isPaper
    ? "bg-paper border-hair-2 text-ink data-[hovered]:bg-paper-bg"
    : "bg-surface border-line-2 text-text data-[hovered]:bg-surface-2";

  return (
    <div>
      <div
        className={cn(
          "font-mono text-[10px] uppercase tracking-wider",
          labelColor,
        )}
      >
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
            <AriaButton
              onPress={() => setUrl(null)}
              aria-label="Remove photo"
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-magenta text-white shadow-md outline-none"
            >
              <X size={12} />
            </AriaButton>
          </div>
        ) : (
          <div
            className={cn(
              "flex h-22 w-22 items-center justify-center rounded-2xl border border-dashed",
              placeholderBg,
            )}
            style={{ width: 88, height: 88 }}
          >
            <Camera
              size={22}
              className={isPaper ? "text-ink-muted" : "text-text-muted"}
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <FileTrigger
            acceptedFileTypes={[...ACCEPT]}
            onSelect={handleSelect}
          >
            <AriaButton
              isDisabled={uploading}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium outline-none transition data-[disabled]:opacity-60",
                buttonBg,
              )}
            >
              <UploadIcon size={14} />
              {uploading
                ? "Uploading…"
                : url
                  ? "Replace photo"
                  : "Upload photo"}
            </AriaButton>
          </FileTrigger>
          <p
            className={cn(
              "text-xs",
              isPaper ? "text-ink-muted" : "text-text-muted",
            )}
          >
            JPG / PNG / WebP. Max 8 MB.
          </p>
          {error && <p className="text-xs text-magenta">{error}</p>}
        </div>
      </div>
      {/* Hidden field carries the URL on form submit */}
      <input type="hidden" name={name} value={url ?? ""} />
    </div>
  );
}
