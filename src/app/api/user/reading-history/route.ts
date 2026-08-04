import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const history = await prisma.readingHistory.findMany({
    where: { userId: session.user.id },
    include: {
      note: {
        select: {
          id: true, title: true, slug: true, coverUrl: true, totalPages: true,
          class: { select: { name: true } },
          subject: { select: { name: true, color: true } },
        },
      },
    },
    orderBy: { lastReadAt: "desc" },
    take: 50,
  });

  return NextResponse.json(history);
}

const progressSchema = z.object({
  noteId: z.string(),
  currentPage: z.number().min(1),
  totalPages: z.number().optional(),
  progress: z.number().min(0).max(100),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 422 });

  const { noteId, currentPage, totalPages, progress } = parsed.data;

  const record = await prisma.readingHistory.upsert({
    where: { userId_noteId: { userId: session.user.id, noteId } },
    update: {
      currentPage,
      ...(totalPages && { totalPages }),
      progress,
      lastReadAt: new Date(),
      ...(progress >= 100 && { completedAt: new Date() }),
    },
    create: {
      userId: session.user.id,
      noteId,
      currentPage,
      totalPages,
      progress,
      ...(progress >= 100 && { completedAt: new Date() }),
    },
  });

  return NextResponse.json(record);
}
