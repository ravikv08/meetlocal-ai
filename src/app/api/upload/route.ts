import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadProfilePhoto } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 8 MB)" }, { status: 413 });
  }

  const buffer = await file.arrayBuffer();
  const url = await uploadProfilePhoto({
    userId: session.user.id,
    fileName: file.name,
    contentType: file.type,
    buffer,
  });
  return NextResponse.json({ url });
}
