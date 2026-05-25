// Resend wrapper — gracefully no-ops if RESEND_API_KEY isn't set so local dev
// doesn't fail when you haven't wired it up yet.

import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";

const FROM =
  process.env.RESEND_FROM ?? "meetlocal <onboarding@resend.dev>";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const isEmailConfigured = () => resend !== null;

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.warn(`[email] would send → ${to} · ${subject} (RESEND_API_KEY not set)`);
    return { skipped: true as const };
  }
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html, text });
    return { skipped: false as const, ...result };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email] send failed:", err);
    return { skipped: true as const, error: (err as Error).message };
  }
}

// ─────────────────────────────────────────────────────────────────────
// Templates — plain HTML for v1, swap for React Email later
// ─────────────────────────────────────────────────────────────────────

const baseUrl = () => process.env.AUTH_URL ?? "http://localhost:3000";

const wrap = (body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;max-width:560px;margin:40px auto;padding:0 24px;color:#0e0b08;line-height:1.55">
  <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:32px">
    <div style="width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,#ffb84d,#ff6a3d 45%,#ff2e78);display:inline-block"></div>
    <strong style="font-size:16px;letter-spacing:-0.3px">meetlocal<span style="color:#9a9289;font-weight:500">.ai</span></strong>
  </div>
  ${body}
  <hr style="border:none;border-top:1px solid #e8e5de;margin:40px 0 16px" />
  <div style="font-size:12px;color:#9a9289;font-family:ui-monospace,SF Mono,Menlo,monospace">
    meetlocal.ai · Real people. Real cities. Right now.
  </div>
</div>`;

export function bookingRequestedTemplate(args: {
  localName: string;
  travelerName: string;
  hours: number;
  totalCents: number;
  bookingId: string;
}) {
  const url = `${baseUrl()}/messages/${args.bookingId}`;
  return {
    subject: `${args.travelerName} wants to meet · ${args.hours}h · ${formatPrice(args.totalCents)}`,
    html: wrap(`
      <h1 style="font-size:28px;letter-spacing:-1px;margin:0 0 12px">Hi ${args.localName},</h1>
      <p style="font-size:16px;color:#6b655d;margin:0 0 18px">
        <strong style="color:#0e0b08">${args.travelerName}</strong> just requested a
        ${args.hours}-hour meetup. Total: <strong>${formatPrice(args.totalCents)}</strong>.
      </p>
      <p style="font-size:16px;color:#6b655d;margin:0 0 28px">
        You have <strong style="color:#0e0b08">30 minutes</strong> to accept before we
        re-route to the next local.
      </p>
      <a href="${url}" style="display:inline-block;background:#0e0b08;color:#fafaf7;padding:14px 22px;border-radius:14px;font-weight:600;text-decoration:none">Open the chat →</a>
    `),
    text: `${args.travelerName} requested a ${args.hours}-hour meetup. Open: ${url}`,
  };
}

export function bookingAcceptedTemplate(args: {
  travelerName: string;
  localName: string;
  bookingId: string;
}) {
  const url = `${baseUrl()}/messages/${args.bookingId}`;
  return {
    subject: `${args.localName} accepted your meetup`,
    html: wrap(`
      <h1 style="font-size:28px;letter-spacing:-1px;margin:0 0 12px">Hi ${args.travelerName},</h1>
      <p style="font-size:16px;color:#6b655d;margin:0 0 28px">
        <strong style="color:#0e0b08">${args.localName}</strong> just accepted your
        meetup. Time to plan the details.
      </p>
      <a href="${url}" style="display:inline-block;background:#0e0b08;color:#fafaf7;padding:14px 22px;border-radius:14px;font-weight:600;text-decoration:none">Open the chat →</a>
    `),
    text: `${args.localName} accepted your meetup. Open: ${url}`,
  };
}

export function applicationReceivedTemplate(args: { name: string }) {
  const url = `${baseUrl()}/admin/locals?status=pending`;
  return {
    subject: `${args.name} just applied to be a local`,
    html: wrap(`
      <h1 style="font-size:28px;letter-spacing:-1px;margin:0 0 12px">New local application</h1>
      <p style="font-size:16px;color:#6b655d;margin:0 0 28px">
        <strong style="color:#0e0b08">${args.name}</strong> filled out the
        Become-a-local form. Review and approve from the admin panel.
      </p>
      <a href="${url}" style="display:inline-block;background:#0e0b08;color:#fafaf7;padding:14px 22px;border-radius:14px;font-weight:600;text-decoration:none">Review applicants →</a>
    `),
    text: `New local application from ${args.name}. Review: ${url}`,
  };
}

export function magicLinkTemplate(args: { url: string }) {
  return {
    subject: "Your meetlocal sign-in link",
    html: wrap(`
      <h1 style="font-size:28px;letter-spacing:-1px;margin:0 0 12px">Tap to sign in</h1>
      <p style="font-size:16px;color:#6b655d;margin:0 0 28px">
        This link is good for one sign-in and expires in 24 hours. If you
        didn&rsquo;t request it, you can safely ignore this email.
      </p>
      <a href="${args.url}" style="display:inline-block;background:#0e0b08;color:#fafaf7;padding:14px 22px;border-radius:14px;font-weight:600;text-decoration:none">Sign in to meetlocal →</a>
      <p style="font-size:12px;color:#9a9289;margin:18px 0 0;font-family:ui-monospace,SF Mono,Menlo,monospace;word-break:break-all">${args.url}</p>
    `),
    text: `Sign in to meetlocal: ${args.url}`,
  };
}

export function applicationApprovedTemplate(args: {
  name: string;
  profileUrl: string;
}) {
  return {
    subject: "You're live on meetlocal.ai 🎉",
    html: wrap(`
      <h1 style="font-size:28px;letter-spacing:-1px;margin:0 0 12px">Hi ${args.name},</h1>
      <p style="font-size:16px;color:#6b655d;margin:0 0 18px">
        You're approved. Your profile is live and travelers can book you.
      </p>
      <p style="font-size:16px;color:#6b655d;margin:0 0 28px">
        We&rsquo;ll email you the moment a request comes in.
      </p>
      <a href="${args.profileUrl}" style="display:inline-block;background:#0e0b08;color:#fafaf7;padding:14px 22px;border-radius:14px;font-weight:600;text-decoration:none">View your profile →</a>
    `),
    text: `You're approved. View your profile: ${args.profileUrl}`,
  };
}
