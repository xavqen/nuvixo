import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiRateLimiter } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const note = await prisma.note.findFirst({
    where: { slug, isPublished: true },
    include: {
      class: true,
      subject: true,
      book: true,
      chapter: true,
      board: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });

  // Increment view count (fire-and-forget)
  prisma.note.update({ where: { id: note.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const session = await auth();
  let hasPurchased = false;

  if (session?.user?.id) {
    const order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
        items: { some: { noteId: note.id } },
      },
    });
    hasPurchased = !!order;
  }

  const avgRating =
    note.reviews.length > 0
      ? note.reviews.reduce((s, r) => s + r.rating, 0) / note.reviews.length
      : 0;

  // Never expose pdfSecureUrl or pdfPublicId to the client
  const { pdfSecureUrl: _, pdfPublicId: __, ...safeNote } = note;

  return NextResponse.json({
    note: { ...safeNote, avgRating: Math.round(avgRating * 10) / 10, reviewCount: note.reviews.length },
    hasPurchased,
  });
}
