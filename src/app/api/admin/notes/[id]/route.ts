import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { deleteResource } from "@/lib/cloudinary";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  isDownloadable: z.boolean().optional(),
}).passthrough();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const note = await prisma.note.findUnique({
    where: { id },
    include: { class: true, subject: true, book: true, chapter: true, board: true },
  });
  if (!note) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json(note);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 422 });

  const note = await prisma.note.update({
    where: { id },
    data: {
      ...parsed.data,
      publishedAt: parsed.data.isPublished ? new Date() : undefined,
    },
  });
  return NextResponse.json(note);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error } = await requireAdmin();
  if (error) return error;

  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Clean up Cloudinary resources
  if (note.pdfPublicId) await deleteResource(note.pdfPublicId, "raw").catch(() => {});
  if (note.coverPublicId) await deleteResource(note.coverPublicId).catch(() => {});
  if (note.previewPublicId) await deleteResource(note.previewPublicId).catch(() => {});

  await prisma.note.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
