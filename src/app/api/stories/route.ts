import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadProfilePhoto } from "@/lib/storage";

const MAX_BYTES = 12 * 1024 * 1024; // 12 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/stories — multipart/form-data with `file` (and optional `caption`).
// Uploads the image to Supabase Storage, creates a Story row that expires
// 24h from now, and refreshes user.image so the avatar reflects the latest.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const caption = String(form.get("caption") ?? "").trim() || null;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "unsupported file type" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "file too large (max 12 MB)" },
      { status: 413 },
    );
  }

  const buffer = await file.arrayBuffer();
  const url = await uploadProfilePhoto({
    userId: session.user.id,
    fileName: file.name,
    contentType: file.type,
    buffer,
  });

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const [story] = await prisma.$transaction([
    prisma.story.create({
      data: {
        userId: session.user.id,
        imageUrl: url,
        caption,
        expiresAt,
      },
    }),
    // Refresh the user's avatar to the latest story so it shows everywhere.
    prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    }),
  ]);

  return NextResponse.json({
    id: story.id,
    imageUrl: story.imageUrl,
    caption: story.caption,
    expiresAt: story.expiresAt.toISOString(),
  });
}
