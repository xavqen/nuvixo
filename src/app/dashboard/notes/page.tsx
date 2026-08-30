import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "My Notes – Dashboard" };

export default async function DashboardNotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: {
      items: {
        include: {
          note: {
            select: {
              id: true, title: true, slug: true, coverUrl: true,
              totalPages: true, subject: { select: { name: true, color: true, icon: true } },
              class: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const history = await prisma.readingHistory.findMany({
    where: { userId: session.user.id },
    select: { noteId: true, progress: true, currentPage: true, lastReadAt: true },
  });
  const historyMap = new Map(history.map((h) => [h.noteId, h]));

  const purchasedNotes = orders.flatMap((o) => o.items.map((i) => i.note));
  const uniqueNotes = Array.from(new Map(purchasedNotes.map((n) => [n.id, n])).values());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">My Notes</h1>
          <p className="text-muted-foreground text-sm mt-1">{uniqueNotes.length} notes purchased</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-brand-600 to-violet-600 text-white">
          <Link href="/notes">Browse More</Link>
        </Button>
      </div>

      {uniqueNotes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">No notes yet</h2>
          <p className="text-muted-foreground text-sm mb-6">Browse and purchase premium NCERT notes to get started.</p>
          <Button asChild>
            <Link href="/notes">Browse Notes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueNotes.map((note) => {
            const prog = historyMap.get(note.id);
            const progress = prog?.progress ?? 0;

            return (
              <div key={note.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-[16/9] bg-muted">
                  {note.coverUrl ? (
                    <Image src={note.coverUrl} alt={note.title} fill className="object-cover" />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-4xl"
                      style={{ background: `${note.subject.color ?? "#3b82f6"}15` }}
                    >
                      {note.subject.icon ?? "📚"}
                    </div>
                  )}
                  {progress >= 100 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white border-0 gap-1">
                        <CheckCircle className="w-3 h-3" />Completed
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{note.class.name} · {note.subject.name}</p>
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-3">{note.title}</h3>

                  {progress > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}

                  {prog?.lastReadAt && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <Clock className="w-3 h-3" />Last read {formatDate(prog.lastReadAt, { month: "short", day: "numeric" })}
                    </p>
                  )}

                  <Button size="sm" className="w-full gap-2" asChild>
                    <Link href={`/reader/${note.id}`}>
                      <BookOpen className="w-4 h-4" />
                      {progress > 0 && progress < 100 ? "Continue Reading" : progress >= 100 ? "Read Again" : "Start Reading"}
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
