import Link from "next/link";
import Image from "next/image";
import { Star, FileText } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface RelatedNote {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  price: number;
  isFree: boolean;
  difficulty: string;
  totalPages: number | null;
  class: { name: string; slug: string };
  subject: { name: string; slug: string; color: string | null; icon: string | null };
  reviews: { rating: number }[];
}

export function RelatedNotes({ notes }: { notes: RelatedNote[] }) {
  if (notes.length === 0) return null;

  return (
    <section className="py-12 bg-muted/20 border-t border-border">
      <div className="container">
        <h2 className="font-heading text-2xl font-bold mb-6">Related Notes</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((note) => {
            const avgRating =
              note.reviews.length > 0
                ? note.reviews.reduce((s, r) => s + r.rating, 0) / note.reviews.length
                : 0;
            return (
              <Link
                key={note.id}
                href={`/notes/${note.slug}`}
                className="group p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted mb-3">
                  {note.coverUrl ? (
                    <Image src={note.coverUrl} alt={note.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center text-3xl"
                      style={{ background: `${note.subject.color ?? "#3b82f6"}20` }}
                    >
                      {note.subject.icon ?? "📚"}
                    </div>
                  )}
                </div>
                <h3 className="text-xs font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                  {note.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{formatPrice(note.price)}</span>
                  {avgRating > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{avgRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
