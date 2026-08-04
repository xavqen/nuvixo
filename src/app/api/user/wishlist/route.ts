import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { apiRateLimiter } from "@/lib/utils";

// GET /api/user/wishlist
export async function GET(req: NextRequest) {
  const { allowed } = apiRateLimiter(req.headers.get("x-forwarded-for") ?? "unknown");
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      note: {
        select: {
          id: true, title: true, slug: true, coverUrl: true,
          price: true, isFree: true,
          class: { select: { name: true } },
          subject: { select: { name: true, color: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

// POST /api/user/wishlist
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { noteId } = await req.json().catch(() => ({}));
  if (!noteId) return NextResponse.json({ error: "noteId required." }, { status: 400 });

  const existing = await prisma.wishlist.findUnique({
    where: { userId_noteId: { userId: session.user.id, noteId } },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ wishlisted: false });
  }

  await prisma.wishlist.create({ data: { userId: session.user.id, noteId } });
  return NextResponse.json({ wishlisted: true });
}
