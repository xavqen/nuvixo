import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Wishlist – Dashboard" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      note: {
        select: {
          id: true, title: true, slug: true, coverUrl: true, price: true, isFree: true,
          class: { select: { name: true } },
          subject: { select: { name: true, color: true, icon: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-8">Wishlist ({wishlist.length})</h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground text-sm mb-6">Save notes to buy later by clicking the heart icon.</p>
          <Button asChild><Link href="/notes">Browse Notes</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(({ note }) => (
            <div key={note.id} className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative aspect-[3/4] bg-muted">
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
              </div>
              <div className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{note.class.name} · {note.subject.name}</p>
                <Link href={`/notes/${note.slug}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors mb-3">{note.title}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-bold">{formatPrice(note.price)}</span>
                  <Button size="sm" asChild className="gap-1.5">
                    <Link href={`/notes/${note.slug}`}>
                      <ShoppingCart className="w-3.5 h-3.5" />Buy Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
