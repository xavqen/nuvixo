import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { NoteEditForm } from "@/components/admin/note-edit-form";

interface Props { params: Promise<{ id: string }> }

export default async function AdminNoteEditPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const note = await prisma.note.findUnique({
    where: { id },
    include: { class: true, subject: true, board: true, chapter: true, book: true },
  });
  if (!note) redirect("/admin/notes");

  const [classes, subjects, boards, chapters] = await Promise.all([
    prisma.class.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.board.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.chapter.findMany({ orderBy: [{ bookId: "asc" }, { number: "asc" }] }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Edit Note</h1>
      <NoteEditForm
        note={note}
        classes={classes}
        subjects={subjects}
        boards={boards}
        chapters={chapters}
      />
    </div>
  );
}
