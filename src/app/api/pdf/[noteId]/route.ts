import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSignedPdfUrl } from "@/lib/cloudinary";
import { pdfRateLimiter } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = pdfRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { pdfPublicId: true, title: true, isFree: true, isPublished: true },
  });
  if (!note?.isPublished || !note.pdfPublicId) return NextResponse.json({ error: "PDF not available." }, { status: 404 });

  // Paid notes require a completed order; published free notes are immediately accessible.
  const order = note.isFree ? { id: "free" } : await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      items: { some: { noteId } },
    },
  });

  if (!order) return NextResponse.json({ error: "Access denied. Purchase this note first." }, { status: 403 });

  // Generate signed URL valid for 1 hour
  const signedUrl = await getSignedPdfUrl(note.pdfPublicId, 3600);

  // Update reading history access time
  await prisma.readingHistory.upsert({
    where: { userId_noteId: { userId: session.user.id, noteId } },
    update: { lastReadAt: new Date() },
    create: {
      userId: session.user.id,
      noteId,
      totalPages: 0,
      progress: 0,
    },
  });

  return NextResponse.json({ url: signedUrl, expiresIn: 3600 });
}
