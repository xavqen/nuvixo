import { NextRequest, NextResponse } from "next/server";
import { Language } from "@prisma/client";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noteSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  shortDescription: z.string().max(300).optional(),
  classId: z.string(),
  subjectId: z.string(),
  bookId: z.string().optional(),
  chapterId: z.string().optional(),
  boardId: z.string(),
  language: z.nativeEnum(Language),
  price: z.number().min(0),
  originalPrice: z.number().optional(),
  isFree: z.boolean(),
  isPremium: z.boolean(),
  isDownloadable: z.boolean(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string()),
  keywords: z.array(z.string()),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  totalPages: z.number().optional(),
  previewPages: z.number().min(1).max(10).default(4),
  pdfPublicId: z.string().optional(),
  previewPublicId: z.string().optional(),
  coverPublicId: z.string().optional(),
  coverUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const page  = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1));
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));
  const q     = req.nextUrl.searchParams.get("q");

  const where = q ? {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { slug:  { contains: q, mode: "insensitive" as const } },
    ],
  } : {};

  const [total, notes] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { class: true, subject: true, chapter: true, board: true },
    }),
  ]);

  return NextResponse.json({ notes, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 });

  const existing = await prisma.note.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return NextResponse.json({ error: "Slug already in use." }, { status: 409 });

  const note = await prisma.note.create({
    data: {
      ...parsed.data,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
