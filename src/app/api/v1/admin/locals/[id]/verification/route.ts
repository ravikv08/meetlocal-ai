import { z } from "zod";
import { setLocalVerificationFlag } from "@/lib/locals";
import { VERIFICATION_FLAG_VALUES } from "@/lib/schemas/local";
import { handleError, ok, parseJson, requireAdmin } from "@/lib/api/respond";

const Body = z.object({
  flag: z.enum(VERIFICATION_FLAG_VALUES),
  value: z.boolean(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const { flag, value } = await parseJson(req, Body);
    await setLocalVerificationFlag({ id, flag, value });
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
