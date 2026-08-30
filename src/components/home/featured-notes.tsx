"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, BookOpen, FileText, ArrowRight, Crown, Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  coverUrl: string | null;
  price: number;
  originalPrice: number | null;
  isFree: boolean;
  difficulty: string;
  totalPages: number | null;
  language: string;
  isTrending: boolean;
  isNew: boolean;
  avgRating: number;
  reviewCount: number;
  class: { name: string; slug: string };
  subject: { name: string; slug: string; color: string | null; icon: string | null };
  chapter: { number: number } | null;
}

export function NoteCard({ note, className }: { note: Note; className?: string }) {
  const discount = note.originalPrice ? getDiscountPercentage(note.originalPrice, note.price) : 0;

  return (
    <div className={cn("group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300", className)}>
      {/* Cover image */}
      <Link href={`/notes/${note.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-muted">
        {note.coverUrl ? (
          <Image
            src={note.coverUrl}
            alt={note.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${note.subject.color ?? "#3b82f6"}20, ${note.subject.color ?? "#3b82f6"}50)` }}
          >
            <span className="text-5xl mb-2">{note.subject.icon ?? "📚"}</span>
            <span className="text-xs font-medium text-muted-foreground px-4 text-center">{note.title}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {note.isNew && (
            <Badge className="bg-green-500 text-white border-0 text-xs py-0.5">
              <Sparkles className="w-3 h-3 mr-1" />New
            </Badge>
          )}
          {note.isTrending && (
            <Badge className="bg-orange-500 text-white border-0 text-xs py-0.5">
              <Flame className="w-3 h-3 mr-1" />Trending
            </Badge>
          )}
          {!note.isFree && (
            <Badge className="bg-violet-600 text-white border-0 text-xs py-0.5">
              <Crown className="w-3 h-3 mr-1" />Premium
            </Badge>
          )}
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center">
            -{discount}%
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${note.subject.color ?? "#3b82f6"}20`, color: note.subject.color ?? "#3b82f6" }}>
            {note.subject.name}
          </span>
          <span className="text-xs text-muted-foreground">{note.class.name}</span>
        </div>

        <Link href={`/notes/${note.slug}`}>
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 hover:text-primary transition-colors mb-2">
            {note.title}
          </h3>
        </Link>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          {note.totalPages && (
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{note.totalPages} pages</span>
          )}
          {note.avgRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {note.avgRating} ({note.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base">{formatPrice(note.price)}</span>
            {note.originalPrice && note.originalPrice > note.price && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(note.originalPrice)}</span>
            )}
          </div>
          <Button size="sm" asChild className="rounded-lg text-xs h-8">
            <Link href={`/notes/${note.slug}`}>
              {note.isFree ? "Read Free" : "Buy Now"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FeaturedNotes({ notes }: { notes: Note[] }) {
  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Featured Notes</h2>
            <p className="text-muted-foreground">Hand-picked premium study material</p>
          </div>
          <Link href="/notes" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all notes <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {notes.map((note, idx) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <NoteCard note={note} />
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button size="lg" asChild variant="outline" className="rounded-xl">
            <Link href="/notes">
              <BookOpen className="w-5 h-5 mr-2" />Explore All Notes
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
