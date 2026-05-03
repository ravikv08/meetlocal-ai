// Browser-side Supabase client used only for Realtime channel subscriptions
// in the chat UI. Anon key is safe to expose; we never use it for DB writes —
// those go through Next.js API routes that authenticate via NextAuth.
import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export const channelForBooking = (bookingId: string) => `booking:${bookingId}`;
