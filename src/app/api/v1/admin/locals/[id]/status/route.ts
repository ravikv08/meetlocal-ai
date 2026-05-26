import { z } from "zod";
import { setLocalProfileStatus } from "@/lib/locals";
import { LOCAL_STATUS_VALUES } from "@/lib/schemas/local";
import { handleError, ok, parseJson, requireAdmin } from "@/lib/api/respond";

const Body = z.object({
  status: z.enum(LOCAL_STATUS_VALUES),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await ctx.params;
    const { status } = await parseJson(req, Body);
    await setLocalProfileStatus({
      input: { id, status },
      baseUrl: process.env.AUTH_URL ?? "http://localhost:3000",
    });
    return ok({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
