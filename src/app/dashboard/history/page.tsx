import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Reading History – Dashboard" };

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const history = await prisma.readingHistory.findMany({
    where: { userId: session.user.id },
    include: {
      note: {
        select: {
          id: true, title: true, slug: true, coverUrl: true, totalPages: true,
          subject: { select: { name: true, color: true, icon: true } },
          class: { select: { name: true } },
        },
      },
    },
    orderBy: { lastReadAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Reading History</h1>

      {history.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">No reading history</h2>
          <p className="text-muted-foreground text-sm mb-6">Start reading notes to track your progress.</p>
          <Button asChild><Link href="/dashboard/notes">My Notes</Link></Button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-sm transition-shadow">
              <div className="w-12 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {h.note.coverUrl ? (
                  <Image src={h.note.coverUrl} alt={h.note.title} width={48} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">{h.note.subject.icon ?? "📚"}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{h.note.title}</p>
                <p className="text-xs text-muted-foreground mb-2">{h.note.class.name} · {h.note.subject.name}</p>
                <div className="flex items-center gap-3">
                  <Progress value={h.progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground flex-shrink-0">{Math.round(h.progress)}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Page {h.currentPage}{h.totalPages ? ` of ${h.totalPages}` : ""} · Last read {formatDate(h.lastReadAt, { month: "short", day: "numeric" })}
                </p>
              </div>
              <Button size="sm" asChild>
                <Link href={`/reader/${h.note.id}`}>
                  <BookOpen className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
