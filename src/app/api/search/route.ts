import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRateLimiter } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = apiRateLimiter(ip);
  if (!allowed) return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });

  const q      = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const limit  = Math.min(20, Number(req.nextUrl.searchParams.get("limit") ?? 10));

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], query: q });
  }

  const sanitized = q.replace(/[%_\\]/g, "\\$&");

  const notes = await prisma.note.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: sanitized, mode: "insensitive" } },
        { description: { contains: sanitized, mode: "insensitive" } },
        { tags: { has: sanitized.toLowerCase() } },
      ],
    },
    take: limit,
    select: {
      id: true, title: true, slug: true, coverUrl: true, price: true, isFree: true,
      class: { select: { name: true } },
      subject: { select: { name: true, color: true } },
      chapter: { select: { number: true } },
    },
    orderBy: { purchaseCount: "desc" },
  });

  return NextResponse.json({ results: notes, query: q });
}
