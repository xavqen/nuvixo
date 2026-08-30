"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { NoteCard } from "@/components/home/featured-notes";
import { NoteCardSkeleton } from "@/components/notes/note-card-skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Filters {
  classes: { id: string; name: string; slug: string }[];
  subjects: { id: string; name: string; slug: string; color: string | null }[];
  boards: { id: string; name: string; slug: string }[];
}

interface Note {
  id: string; title: string; slug: string; shortDescription: string | null;
  coverUrl: string | null; price: number; originalPrice: number | null;
  isFree: boolean; difficulty: string; totalPages: number | null;
  language: string; isTrending: boolean; isNew: boolean;
  avgRating: number; reviewCount: number;
  class: { name: string; slug: string };
  subject: { name: string; slug: string; color: string | null; icon: string | null };
  chapter: { number: number } | null;
}

const SORT_OPTIONS = [
  { label: "Newest",       value: "newest" },
  { label: "Oldest",       value: "oldest" },
  { label: "Price: Low",   value: "price_asc" },
  { label: "Price: High",  value: "price_desc" },
  { label: "Most Popular", value: "popular" },
  { label: "A–Z",          value: "az" },
];

export function NotesListClient({ filters }: { filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const selectedClass   = searchParams.get("class") ?? "";
  const selectedSubject = searchParams.get("subject") ?? "";
  const selectedBoard   = searchParams.get("board") ?? "";
  const selectedFree    = searchParams.get("free") === "true";
  const sort            = searchParams.get("sort") ?? "newest";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    router.push(pathname);
  }

  const hasActiveFilters = selectedClass || selectedSubject || selectedBoard || selectedFree;

  const fetchNotes = useCallback(async (p: number, replace = true) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    params.set("limit", "12");

    try {
      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();
      if (replace) {
        setNotes(data.notes ?? []);
      } else {
        setNotes((prev) => [...prev, ...(data.notes ?? [])]);
      }
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
      setPage(p);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchNotes(1, true);
  }, [searchParams, fetchNotes]);

  function FilterPanel() {
    return (
      <div className="space-y-6">
        {/* Class */}
        <div>
          <p className="font-medium text-sm mb-3">Class</p>
          <div className="space-y-2">
            {filters.classes.map((cls) => (
              <label key={cls.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedClass === cls.slug}
                  onCheckedChange={(v) => updateFilter("class", v ? cls.slug : "")}
                />
                <span className="text-sm">{cls.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div>
          <p className="font-medium text-sm mb-3">Subject</p>
          <div className="space-y-2">
            {filters.subjects.map((sub) => (
              <label key={sub.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedSubject === sub.slug}
                  onCheckedChange={(v) => updateFilter("subject", v ? sub.slug : "")}
                />
                <span className="text-sm">{sub.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Board */}
        <div>
          <p className="font-medium text-sm mb-3">Board</p>
          <div className="space-y-2">
            {filters.boards.map((board) => (
              <label key={board.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBoard === board.slug}
                  onCheckedChange={(v) => updateFilter("board", v ? board.slug : "")}
                />
                <span className="text-sm">{board.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Free */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={selectedFree} onCheckedChange={(v) => updateFilter("free", v ? "true" : "")} />
            <span className="text-sm font-medium">Free Notes Only</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-24 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />Filters
            </h3>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all</button>
            )}
          </div>
          <FilterPanel />
        </div>
      </aside>

      {/* Notes grid */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2">
                  <SlidersHorizontal className="w-4 h-4" />Filters
                  {hasActiveFilters && <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">!</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>

            <span className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${total} notes`}
            </span>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={clearFilters}>
                <X className="w-3 h-3" />Clear
              </Button>
            )}
          </div>

          <Select value={sort} onValueChange={(v) => updateFilter("sort", v)}>
            <SelectTrigger className="w-40 h-9 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium mb-2">No notes found</p>
            <p className="text-sm">Try adjusting your filters</p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {notes.map((note) => <NoteCard key={note.id} note={note} />)}
            </div>

            {page < totalPages && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchNotes(page + 1, false)}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                  Load More Notes
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
