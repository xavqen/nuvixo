import { prisma } from "@/lib/prisma";
import { NoteUploadForm } from "@/components/admin/note-upload-form";

export const metadata = { title: "Upload Notes – Admin" };

export default async function AdminUploadPage() {
  const [classes, subjects, boards, chapters] = await Promise.all([
    prisma.class.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.board.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.chapter.findMany({ include: { book: { select: { title: true } } }, orderBy: [{ bookId: "asc" }, { number: "asc" }] }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Upload New Notes</h1>
      <NoteUploadForm
        classes={classes}
        subjects={subjects}
        boards={boards}
        chapters={chapters.map((ch) => ({ id: ch.id, title: ch.title, number: ch.number, bookId: ch.bookId }))}
      />
    </div>
  );
}
