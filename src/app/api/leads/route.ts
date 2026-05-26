import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// POST /api/leads — capture an email lead from the homepage exit-intent
// modal (or any other waitlist surface). Idempotent at the DB layer:
// duplicates create new rows so we can see frequency / repeat interest.
// No auth; CSRF risk is bounded because we only store an email + label.

const LeadSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email."),
  source: z.string().max(120).optional(),
  city: z.string().max(40).optional(),
  utmSource: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid input" },
      { status: 400 },
    );
  }

  await prisma.lead.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
