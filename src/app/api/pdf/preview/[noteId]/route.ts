import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/utils";

// Preview: returns the first N pages using Cloudinary's page parameter
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const note = await prisma.note.findFirst({
    where: { id: noteId, isPublished: true },
    select: { previewPublicId: true, previewPages: true, title: true },
  });

  if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });

  if (!note.previewPublicId) {
    return NextResponse.json({ pages: [], message: "Preview not available." });
  }

  // Generate preview image URLs using Cloudinary (pages as images)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const previewPages = Array.from({ length: note.previewPages }, (_, i) => ({
    page: i + 1,
    url: `https://res.cloudinary.com/${cloudName}/image/upload/pg_${i + 1},q_70,w_800,f_jpg/${note.previewPublicId}`,
  }));

  return NextResponse.json({ pages: previewPages, total: note.previewPages });
}
