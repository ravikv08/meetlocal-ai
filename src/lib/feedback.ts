import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Pure feedback recording — server actions wrap these in feedback-actions.ts.
// Three kinds of feedback land in the same Feedback table, discriminated by
// `kind`: pmf_survey (Sean Ellis "very disappointed" %), report_user (safety),
// general (open-ended).

export type PmfAnswer = "very" | "somewhat" | "not";

const VALID_PMF: PmfAnswer[] = ["very", "somewhat", "not"];
export const isPmfAnswer = (s: string): s is PmfAnswer =>
  (VALID_PMF as string[]).includes(s);

export interface RecordPmfInput {
  userId: string;
  bookingId?: string | null;
  answer: PmfAnswer;
  note?: string | null;
}

export async function recordPmfSurvey(input: RecordPmfInput) {
  return prisma.feedback.create({
    data: {
      kind: "pmf_survey",
      userId: input.userId,
      bookingId: input.bookingId ?? null,
      data: {
        answer: input.answer,
        note: input.note ?? null,
      } satisfies Prisma.InputJsonValue,
    },
  });
}

export interface RecordReportUserInput {
  reporterId: string;
  reportedUserId: string;
  bookingId?: string | null;
  reason: string;
}

export async function recordReportUser(input: RecordReportUserInput) {
  return prisma.feedback.create({
    data: {
      kind: "report_user",
      userId: input.reporterId,
      bookingId: input.bookingId ?? null,
      data: {
        reportedUserId: input.reportedUserId,
        reason: input.reason,
      } satisfies Prisma.InputJsonValue,
    },
  });
}

// Has a given user already submitted the PMF survey? Used to suppress the
// nudge once they've answered.
export async function hasUserAnsweredPmf(userId: string): Promise<boolean> {
  const count = await prisma.feedback.count({
    where: { kind: "pmf_survey", userId },
  });
  return count > 0;
}
