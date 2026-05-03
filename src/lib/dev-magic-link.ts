// Dev-only: persist the most recent magic link to a tiny file in the OS temp
// dir so the /signin/check-email page can render a one-click sign-in button
// without requiring a real email provider. Skipped entirely in production.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const DIR = join(tmpdir(), "meetlocal");
const FILE = join(DIR, "dev-magic-link.json");
const MAX_AGE_MS = 10 * 60 * 1000;

interface DevLinkPayload {
  identifier: string;
  url: string;
  ts: number;
}

export function isDevMagicLinkMode() {
  return process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY;
}

export function writeDevMagicLink(payload: Omit<DevLinkPayload, "ts">) {
  if (!isDevMagicLinkMode()) return;
  try {
    if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
    const full: DevLinkPayload = { ...payload, ts: Date.now() };
    writeFileSync(FILE, JSON.stringify(full));
  } catch {
    // best-effort; the user can always copy-paste from the console.
  }
}

export function readDevMagicLink(): DevLinkPayload | null {
  if (!isDevMagicLinkMode()) return null;
  try {
    const raw = readFileSync(FILE, "utf-8");
    const parsed = JSON.parse(raw) as DevLinkPayload;
    if (Date.now() - parsed.ts > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}
