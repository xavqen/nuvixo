import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { apiRateLimiter } from "@/lib/utils";

const reviewSchema = z.object({
  noteId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 });

  const { noteId, rating, title, body: reviewBody } = parsed.data;

  // Check purchase
  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      items: { some: { noteId } },
    },
  });
  if (!hasPurchased) {
    return NextResponse.json({ error: "Purchase this note first to leave a review." }, { status: 403 });
  }

  const review = await prisma.review.upsert({
    where: { userId_noteId: { userId: session.user.id, noteId } },
    update: { rating, title, body: reviewBody, isApproved: false },
    create: {
      userId: session.user.id,
      noteId,
      rating,
      title,
      body: reviewBody,
      isVerified: true,
      isApproved: false,
    },
  });

  return NextResponse.json(review);
}
