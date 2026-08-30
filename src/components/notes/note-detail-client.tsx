"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, FileText, Globe, BookOpen, Share2, Heart, ShoppingCart,
  ChevronRight, Download, Eye, Crown, CheckCircle, Users,
  Calendar, Layers, Loader2, Copy, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PDFPreview } from "@/components/notes/pdf-preview";
import { PurchaseModal } from "@/components/notes/purchase-modal";
import { formatPrice, formatDate, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface NoteDetailClientProps {
  note: {
    id: string; title: string; slug: string; description: string;
    shortDescription: string | null; coverUrl: string | null;
    price: number; originalPrice: number | null; isFree: boolean;
    isPremium: boolean; isDownloadable: boolean; difficulty: string;
    totalPages: number | null; previewPages: number; language: string;
    tags: string[]; publishedAt: Date | null; updatedAt: Date;
    viewCount: number; purchaseCount: number;
    class: { name: string; slug: string };
    subject: { name: string; slug: string; color: string | null; icon: string | null };
    board: { name: string; slug: string };
    chapter: { number: number; title: string } | null;
    book: { title: string } | null;
    reviews: {
      id: string; rating: number; title: string | null; body: string | null;
      isVerified: boolean; createdAt: Date;
      user: { name: string | null; image: string | null };
    }[];
    pdfSecureUrl?: undefined;
    pdfPublicId?: undefined;
  };
  hasPurchased: boolean;
  isWishlisted: boolean;
  avgRating: number;
  userId?: string;
  breadcrumbs: { name: string; url: string }[];
}

export function NoteDetailClient({
  note, hasPurchased, isWishlisted: initialWishlisted, avgRating, userId, breadcrumbs,
}: NoteDetailClientProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  async function toggleWishlist() {
    if (!userId) { toast.error("Please login to add to wishlist"); return; }
    setWishlistLoading(true);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note.id }),
      });
      const data = await res.json();
      setWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  }

  const difficultyColors: Record<string, string> = {
    EASY: "text-green-600 bg-green-50 dark:bg-green-950/30",
    MEDIUM: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    HARD: "text-red-600 bg-red-50 dark:bg-red-950/30",
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30">
        <div className="container py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.url} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight className="w-3 h-3" />}
                {idx === breadcrumbs.length - 1 ? (
                  <span className="text-foreground font-medium line-clamp-1">{crumb.name}</span>
                ) : (
                  <Link href={crumb.url} className="hover:text-foreground transition-colors">{crumb.name}</Link>
                )}
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{note.class.name}</Badge>
                <Badge style={{ backgroundColor: `${note.subject.color ?? "#3b82f6"}20`, color: note.subject.color ?? "#3b82f6", border: "none" }}>
                  {note.subject.name}
                </Badge>
                <Badge variant="outline">{note.board.name}</Badge>
                {note.chapter && <Badge variant="outline">Chapter {note.chapter.number}</Badge>}
                <Badge className={cn("border-0", difficultyColors[note.difficulty])}>
                  {note.difficulty.charAt(0) + note.difficulty.slice(1).toLowerCase()}
                </Badge>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-3 text-balance">{note.title}</h1>

              {avgRating > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={cn("w-4 h-4", s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                    ))}
                  </div>
                  <span className="font-semibold text-sm">{avgRating}</span>
                  <span className="text-muted-foreground text-sm">({note.reviews.length} reviews)</span>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {note.totalPages && (
                  <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" />{note.totalPages} pages</span>
                )}
                <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" />{note.language.charAt(0) + note.language.slice(1).toLowerCase()}</span>
                <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{note.viewCount.toLocaleString()} views</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{note.purchaseCount.toLocaleString()} purchased</span>
                {note.publishedAt && (
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Updated {formatDate(note.updatedAt)}</span>
                )}
              </div>
            </div>

            {/* Cover + preview */}
            <div className="rounded-2xl overflow-hidden border border-border">
              {note.coverUrl ? (
                <div className="relative aspect-[16/9] bg-muted">
                  <Image src={note.coverUrl} alt={note.title} fill className="object-cover" priority />
                  {!hasPurchased && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                      <Button onClick={() => setPreviewOpen(true)} variant="secondary" className="gap-2">
                        <Eye className="w-4 h-4" />Preview First {note.previewPages} Pages
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="aspect-[16/9] flex flex-col items-center justify-center gap-4 bg-gradient-to-br"
                  style={{ background: `linear-gradient(135deg, ${note.subject.color ?? "#3b82f6"}15, ${note.subject.color ?? "#3b82f6"}30)` }}
                >
                  <span className="text-6xl">{note.subject.icon ?? "📚"}</span>
                  {!hasPurchased && (
                    <Button onClick={() => setPreviewOpen(true)} variant="secondary" className="gap-2">
                      <Eye className="w-4 h-4" />Preview First {note.previewPages} Pages
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-heading text-xl font-bold mb-4">About These Notes</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{note.description}</p>
              </div>
            </div>

            {/* Tags */}
            {note.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Layers className="w-4 h-4" />Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {note.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                      <Badge variant="secondary" className="hover:bg-primary hover:text-white cursor-pointer transition-colors">
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {note.reviews.length > 0 && (
              <div>
                <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />Student Reviews
                </h2>
                <div className="space-y-4">
                  {note.reviews.map((review) => (
                    <div key={review.id} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={review.user.image ?? undefined} />
                          <AvatarFallback className="bg-brand-100 text-brand-700 text-xs">
                            {getInitials(review.user.name ?? "U")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{review.user.name ?? "Student"}</span>
                            {review.isVerified && (
                              <Badge variant="secondary" className="text-xs py-0 gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />Verified Purchase
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">{formatDate(review.createdAt)}</span>
                          </div>
                          <div className="flex gap-0.5 my-1">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={cn("w-3.5 h-3.5", s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                            ))}
                          </div>
                          {review.title && <p className="font-medium text-sm mb-1">{review.title}</p>}
                          {review.body && <p className="text-sm text-muted-foreground">{review.body}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
                {note.coverUrl && (
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image src={note.coverUrl} alt={note.title} fill className="object-cover" />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">{formatPrice(note.price)}</span>
                    {note.originalPrice && note.originalPrice > note.price && (
                      <span className="text-muted-foreground line-through">{formatPrice(note.originalPrice)}</span>
                    )}
                    {note.isFree && <Badge className="bg-green-500 text-white border-0">Free</Badge>}
                  </div>

                  {hasPurchased ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />You own this note
                      </div>
                      <Button className="w-full gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white" asChild>
                        <Link href={`/reader/${note.id}`}>
                          <BookOpen className="w-4 h-4" />Read Now
                        </Link>
                      </Button>
                      {note.isDownloadable && (
                        <Button variant="outline" className="w-full gap-2" asChild>
                          <Link href={`/api/pdf/${note.id}/download`}>
                            <Download className="w-4 h-4" />Download PDF
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90"
                        onClick={() => setPurchaseOpen(true)}
                      >
                        {note.isFree ? (
                          <><BookOpen className="w-4 h-4" />Read for Free</>
                        ) : (
                          <><ShoppingCart className="w-4 h-4" />Buy for {formatPrice(note.price)}</>
                        )}
                      </Button>
                      <Button variant="outline" className="w-full gap-2" onClick={() => setPreviewOpen(true)}>
                        <Eye className="w-4 h-4" />Preview Free Pages
                      </Button>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Read online anytime</div>
                    {note.isDownloadable && <div className="flex items-center gap-2"><Download className="w-4 h-4" />Downloadable PDF</div>}
                    <div className="flex items-center gap-2"><Crown className="w-4 h-4" />Lifetime access</div>
                    <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />7-day refund guarantee</div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={toggleWishlist}
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className={cn("w-4 h-4", wishlisted && "fill-red-500 text-red-500")} />}
                      {wishlisted ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={copyLink}>
                      <Copy className="w-4 h-4" />Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewOpen && (
        <PDFPreview noteId={note.id} title={note.title} onClose={() => setPreviewOpen(false)} onPurchase={() => { setPreviewOpen(false); setPurchaseOpen(true); }} />
      )}

      {/* Purchase Modal */}
      {purchaseOpen && !hasPurchased && (
        <PurchaseModal note={note} onClose={() => setPurchaseOpen(false)} />
      )}
    </>
  );
}
