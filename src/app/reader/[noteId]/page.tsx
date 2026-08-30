import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PDFReaderClient } from "@/components/reader/pdf-reader-client";
import { prisma } from "@/lib/prisma";
import { hasUserPurchasedNote } from "@/lib/auth-helpers";

interface Props {
  params: Promise<{ noteId: string }>;
}

export default async function ReaderPage({ params }: Props) {
  const { noteId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/reader/${noteId}`);
  }

  const hasPurchased = await hasUserPurchasedNote(session.user.id, noteId);
  if (!hasPurchased) {
    const note = await prisma.note.findUnique({ where: { id: noteId }, select: { slug: true } });
    redirect(note ? `/notes/${note.slug}` : "/notes");
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: {
      id: true, title: true, totalPages: true, isDownloadable: true,
      subject: { select: { name: true } },
      class: { select: { name: true } },
    },
  });

  if (!note) redirect("/dashboard/notes");

  const history = await prisma.readingHistory.findUnique({
    where: { userId_noteId: { userId: session.user.id, noteId } },
    select: { currentPage: true, progress: true },
  });

  return (
    <PDFReaderClient
      noteId={noteId}
      title={note.title}
      totalPages={note.totalPages}
      isDownloadable={note.isDownloadable}
      initialPage={history?.currentPage ?? 1}
      initialProgress={history?.progress ?? 0}
    />
  );
}
