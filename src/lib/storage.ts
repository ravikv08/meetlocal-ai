// Supabase Storage helpers. Uploads happen via API routes (server-side) using
// the service role key so we never need to expose write privileges to the
// browser. Clients receive the public URL after a successful upload.
import { getSupabaseServer } from "@/lib/supabase-server";

export const PROFILE_BUCKET = "profile-photos";

export async function uploadProfilePhoto(args: {
  userId: string;
  fileName: string;
  contentType: string;
  buffer: ArrayBuffer;
}): Promise<string> {
  const supabase = getSupabaseServer();
  const ext = args.fileName.includes(".")
    ? args.fileName.split(".").pop()
    : "jpg";
  const path = `${args.userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(PROFILE_BUCKET)
    .upload(path, args.buffer, {
      contentType: args.contentType,
      upsert: true,
    });
  if (error) throw new Error(`upload failed: ${error.message}`);

  const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
