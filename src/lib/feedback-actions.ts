"use server";

import { auth } from "@/auth";
import {
  recordPmfSurvey,
  recordReportUser,
  isPmfAnswer,
  type PmfAnswer,
} from "@/lib/feedback";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// PMF survey submission — Sean Ellis "How would you feel if meetlocal
// disappeared". Stores answer + optional note; emails founders for
// first-batch visibility. Idempotent at one-per-user via lib check.
export async function submitPmfSurvey(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const answer = String(formData.get("answer") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const bookingId = String(formData.get("bookingId") ?? "") || null;

  if (!isPmfAnswer(answer)) return { error: "Invalid answer." };

  await recordPmfSurvey({
    userId: session.user.id,
    bookingId,
    answer: answer as PmfAnswer,
    note,
  });

  // Email founders so the first 50 responses get a live signal
  for (const admin of ADMIN_EMAILS) {
    await sendEmail({
      to: admin,
      subject: `PMF survey: ${answer}${answer === "very" ? " 🎯" : ""}`,
      html: `<p>User <b>${session.user.email}</b> answered <b>${answer}</b>.</p>${
        note ? `<p><b>Note:</b> ${escapeHtml(note)}</p>` : ""
      }${bookingId ? `<p>Booking: ${bookingId}</p>` : ""}`,
      text: `User ${session.user.email} answered "${answer}"${
        note ? `\n\nNote: ${note}` : ""
      }${bookingId ? `\n\nBooking: ${bookingId}` : ""}`,
    });
  }

  return { ok: true };
}

// Safety report — emails safety inbox immediately (priority signal).
export async function submitReportUser(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Please sign in." };

  const reportedUserId = String(formData.get("reportedUserId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  const bookingId = String(formData.get("bookingId") ?? "") || null;

  if (!reportedUserId) return { error: "Missing user." };
  if (reason.length < 5) return { error: "Please describe the issue (5+ chars)." };

  await recordReportUser({
    reporterId: session.user.id,
    reportedUserId,
    bookingId,
    reason,
  });

  // Safety reports are highest-priority — email all admins now.
  const safetyInbox =
    process.env.SAFETY_EMAIL ?? ADMIN_EMAILS[0] ?? "safety@meetlocal.ai";
  await sendEmail({
    to: safetyInbox,
    subject: `[SAFETY] Report on booking ${bookingId ?? "(none)"}`,
    html: `<p><b>Reporter:</b> ${session.user.email}</p><p><b>Reported user ID:</b> ${reportedUserId}</p><p><b>Booking:</b> ${bookingId ?? "(none)"}</p><p><b>Reason:</b></p><pre>${escapeHtml(reason)}</pre>`,
    text: `Reporter: ${session.user.email}\nReported user: ${reportedUserId}\nBooking: ${bookingId ?? "(none)"}\n\nReason:\n${reason}`,
  });

  return { ok: true };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
