// Server-side Supabase client used by API routes to broadcast chat messages
// over Realtime after persisting them to Postgres via Prisma.
import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  // Service role key is never exposed to the browser — only used in API routes.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
