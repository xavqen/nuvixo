import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Notes – Admin" };
export const dynamic = "force-dynamic";

export default async function AdminNotesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const q = sp.q ?? "";
  const limit = 20;

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
      include: {
        class: { select: { name: true } },
        subject: { select: { name: true } },
        chapter: { select: { number: true } },
      },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Notes</h1>
          <p className="text-muted-foreground text-sm">{total} total notes</p>
        </div>
        <Button asChild className="gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white">
          <Link href="/admin/notes/upload"><Plus className="w-4 h-4" />Upload New</Link>
        </Button>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search notes..."
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Class</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Updated</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{note.title}</p>
                      <p className="text-xs text-muted-foreground">{note.slug}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {note.class.name} · {note.subject.name}
                    {note.chapter && <span className="ml-1">Ch.{note.chapter.number}</span>}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium">{formatPrice(note.price)}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      <Badge className={note.isPublished ? "bg-green-100 text-green-700 border-0 dark:bg-green-950 dark:text-green-400" : "bg-red-100 text-red-700 border-0 dark:bg-red-950 dark:text-red-400"}>
                        {note.isPublished ? "Published" : "Draft"}
                      </Badge>
                      {note.isFeatured && <Badge className="bg-violet-100 text-violet-700 border-0">Featured</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(note.updatedAt, { month: "short", day: "numeric" })}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/notes/${note.slug}`} target="_blank"><Eye className="w-3.5 h-3.5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link href={`/admin/notes/${note.id}/edit`}><Edit className="w-3.5 h-3.5" /></Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/notes?page=${page - 1}${q ? `&q=${q}` : ""}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              Previous
            </Link>
          )}
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / limit)}</span>
          {page < Math.ceil(total / limit) && (
            <Link href={`/admin/notes?page=${page + 1}${q ? `&q=${q}` : ""}`} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
