import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const page  = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(20, Number(req.nextUrl.searchParams.get("limit") ?? 9));
  const cat   = req.nextUrl.searchParams.get("category");
  const tag   = req.nextUrl.searchParams.get("tag");

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (cat) where.category = { slug: cat };
  if (tag) where.tags = { has: tag };

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, slug: true, excerpt: true, coverUrl: true,
        tags: true, readingTime: true, publishedAt: true, viewCount: true,
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
  ]);

  return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) });
}
