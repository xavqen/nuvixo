import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const { searchParams } = req.nextUrl;
  const page      = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit     = Math.min(48, Math.max(1, Number(searchParams.get("limit") ?? 12)));
  const classSlug = searchParams.get("class");
  const subject   = searchParams.get("subject");
  const board     = searchParams.get("board");
  const language  = searchParams.get("language");
  const minPrice  = searchParams.get("minPrice");
  const maxPrice  = searchParams.get("maxPrice");
  const isFree    = searchParams.get("free");
  const featured  = searchParams.get("featured");
  const trending  = searchParams.get("trending");
  const sortBy    = searchParams.get("sort") ?? "newest";

  const where: Record<string, unknown> = { isPublished: true };

  if (classSlug) where.class = { slug: classSlug };
  if (subject)   where.subject = { slug: subject };
  if (board)     where.board = { slug: board };
  if (language)  where.language = language.toUpperCase();
  if (isFree === "true") where.isFree = true;
  if (featured === "true") where.isFeatured = true;
  if (trending === "true") where.isTrending = true;

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
  }

  const orderBy: Record<string, string> =
    sortBy === "price_asc"   ? { price: "asc" }
    : sortBy === "price_desc" ? { price: "desc" }
    : sortBy === "popular"    ? { purchaseCount: "desc" }
    : sortBy === "rating"     ? { purchaseCount: "desc" }
    : sortBy === "az"         ? { title: "asc" }
    : { createdAt: "desc" };

  const [total, notes] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, slug: true, shortDescription: true,
        coverUrl: true, price: true, originalPrice: true, isFree: true,
        isPremium: true, difficulty: true, totalPages: true, language: true,
        isFeatured: true, isTrending: true, isNew: true,
        viewCount: true, purchaseCount: true, tags: true,
        class: { select: { name: true, slug: true } },
        subject: { select: { name: true, slug: true, color: true, icon: true } },
        chapter: { select: { number: true, title: true } },
        board: { select: { name: true, slug: true } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
        createdAt: true, publishedAt: true,
      },
    }),
  ]);

  const notesWithRating = notes.map((note) => {
    const avgRating =
      note.reviews.length > 0
        ? note.reviews.reduce((sum, r) => sum + r.rating, 0) / note.reviews.length
        : 0;
    const { reviews: _, ...rest } = note;
    return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: note.reviews.length };
  });

  return NextResponse.json({
    notes: notesWithRating,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
