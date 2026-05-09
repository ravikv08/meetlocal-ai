import { submitLocalApplication } from "@/lib/locals";
import { LocalApplicationSchema } from "@/lib/schemas/local";
import { handleError, ok, parseJson, requireUser } from "@/lib/api/respond";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const input = await parseJson(req, LocalApplicationSchema);
    const { profile } = await submitLocalApplication({
      userId: user.userId,
      userName: user.name,
      userEmail: user.email,
      adminEmails: ADMIN_EMAILS,
      input,
    });
    return ok({ profile }, 201);
  } catch (err) {
    return handleError(err);
  }
}
