"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, ShieldCheck, X } from "lucide-react";

interface LiveSelfieCaptureProps {
  /** Hidden form field name that round-trips the uploaded URL on submit. */
  name: string;
  initialUrl?: string | null;
}

type Phase = "idle" | "starting" | "live" | "captured" | "uploading" | "done" | "error";

// Forces real-time capture: no file input is exposed, so a previously-saved
// photo cannot be substituted. We grab a frame from the front-facing webcam
// stream and upload the JPEG to /api/upload, then surface the URL via a
// hidden field so the existing FormData submit picks it up.
export function LiveSelfieCapture({ name, initialUrl }: LiveSelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<Phase>(initialUrl ? "done" : "idle");
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [snapshot, setSnapshot] = useState<string | null>(null); // data URL preview
  const [error, setError] = useState<string | null>(null);

  // Stop the camera when the component unmounts or we leave a live phase
  useEffect(() => {
    return () => stopStream();
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera() {
    setError(null);
    setPhase("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("live");
    } catch (err) {
      setError(
        (err as Error).name === "NotAllowedError"
          ? "Camera permission denied. Allow camera access and try again."
          : "Couldn't open the camera on this device.",
      );
      setPhase("error");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror back to natural orientation (preview is mirrored for UX)
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSnapshot(dataUrl);
    setPhase("captured");
    stopStream();
  }

  async function confirm() {
    if (!snapshot) return;
    setPhase("uploading");
    setError(null);
    try {
      const blob = await (await fetch(snapshot)).blob();
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "upload failed");
      }
      const { url: newUrl } = (await res.json()) as { url: string };
      setUrl(newUrl);
      setSnapshot(null);
      setPhase("done");
    } catch (err) {
      setError((err as Error).message);
      setPhase("captured");
    }
  }

  function retake() {
    setSnapshot(null);
    setUrl(null);
    setPhase("idle");
  }

  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        Live selfie verification
      </div>

      <div className="mt-3 overflow-hidden rounded-2xl border border-line-2 bg-bg-2">
        <div className="relative aspect-square w-full max-w-sm">
          {phase === "done" && url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="selfie" className="h-full w-full object-cover" />
          )}

          {phase === "captured" && snapshot && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={snapshot} alt="selfie preview" className="h-full w-full object-cover" />
          )}

          {(phase === "starting" || phase === "live") && (
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
          )}

          {(phase === "idle" || phase === "error") && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="grad-sunset flex h-12 w-12 items-center justify-center rounded-full text-white">
                <Camera size={20} />
              </span>
              <p className="text-sm text-text-dim">
                Take a real-time photo of yourself. Your phone&rsquo;s gallery
                isn&rsquo;t allowed — it has to be live, like Uber.
              </p>
            </div>
          )}

          {phase === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/70 text-sm text-text">
              Uploading…
            </div>
          )}

          {phase === "done" && (
            <span className="grad-sunset absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              <ShieldCheck size={11} /> Captured
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {phase === "idle" && (
          <button
            type="button"
            onClick={startCamera}
            className="grad-sunset inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            <Camera size={14} /> Start camera
          </button>
        )}
        {phase === "starting" && (
          <span className="text-xs text-text-dim">Opening camera…</span>
        )}
        {phase === "live" && (
          <>
            <button
              type="button"
              onClick={capture}
              className="grad-sunset inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              <Camera size={14} /> Take photo
            </button>
            <button
              type="button"
              onClick={() => {
                stopStream();
                setPhase("idle");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm text-text hover:bg-surface-2"
            >
              <X size={14} /> Cancel
            </button>
          </>
        )}
        {phase === "captured" && (
          <>
            <button
              type="button"
              onClick={confirm}
              className="grad-sunset inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            >
              <ShieldCheck size={14} /> Use this photo
            </button>
            <button
              type="button"
              onClick={async () => {
                setSnapshot(null);
                await startCamera();
              }}
              className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm text-text hover:bg-surface-2"
            >
              <RefreshCw size={14} /> Retake
            </button>
          </>
        )}
        {phase === "uploading" && (
          <span className="text-xs text-text-dim">Uploading selfie…</span>
        )}
        {phase === "done" && (
          <button
            type="button"
            onClick={retake}
            className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm text-text hover:bg-surface-2"
          >
            <RefreshCw size={14} /> Retake
          </button>
        )}
        {phase === "error" && (
          <button
            type="button"
            onClick={startCamera}
            className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-4 py-2 text-sm text-text hover:bg-surface-2"
          >
            <RefreshCw size={14} /> Try again
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-text-muted">
        We compare this against your ID. Your selfie is stored privately and
        never shown on your public profile.
      </p>
      {error && <p className="mt-2 text-xs text-magenta">{error}</p>}

      <input type="hidden" name={name} value={url ?? ""} />
    </div>
  );
}
