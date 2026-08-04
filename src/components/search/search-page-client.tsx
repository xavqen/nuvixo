"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { NoteCard } from "@/components/home/featured-notes";
import { NoteCardSkeleton } from "@/components/notes/note-card-skeleton";
import { useDebounce } from "@/hooks/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";

interface Filters {
  classes:  { id: string; name: string; slug: string }[];
  subjects: { id: string; name: string; slug: string; color: string | null }[];
  boards:   { id: string; name: string; slug: string }[];
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

interface Props {
  initialQuery:   string;
  initialClass:   string;
  initialSubject: string;
  initialSort:    string;
  initialFree:    boolean;
  filters:        Filters;
}

const SORT_OPTIONS = [
  { label: "Newest",       value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Price: Low",   value: "price_asc" },
  { label: "Price: High",  value: "price_desc" },
  { label: "A–Z",          value: "az" },
];

export function SearchPageClient({ initialQuery, initialClass, initialSubject, initialSort, initialFree, filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [query,   setQuery]   = useState(initialQuery);
  const [selClass,setSelClass]= useState(initialClass);
  const [selSubj, setSelSubj] = useState(initialSubject);
  const [sort,    setSort]    = useState(initialSort);
  const [isFree,  setIsFree]  = useState(initialFree);
  const [notes,   setNotes]   = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [total,   setTotal]   = useState(0);

  const debouncedQuery = useDebounce(query, 400);

  const buildUrl = useCallback((params: Record<string, string | boolean>) => {
    const sp = new URLSearchParams();
    if (params.q)       sp.set("q",       String(params.q));
    if (params.class)   sp.set("class",   String(params.class));
    if (params.subject) sp.set("subject", String(params.subject));
    if (params.sort && params.sort !== "newest") sp.set("sort", String(params.sort));
    if (params.free)    sp.set("free",    "true");
    return sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
  }, [pathname]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (selClass)  params.set("class", selClass);
      if (selSubj)   params.set("subject", selSubj);
      if (sort)      params.set("sort", sort);
      if (isFree)    params.set("free", "true");
      params.set("limit", "24");

      const endpoint = debouncedQuery
        ? `/api/search?${params.toString()}`
        : `/api/notes?${params.toString()}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (debouncedQuery) {
        setNotes(data.results ?? []);
        setTotal(data.results?.length ?? 0);
      } else {
        setNotes(data.notes ?? []);
        setTotal(data.pagination?.total ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selClass, selSubj, sort, isFree]);

  useEffect(() => {
    fetchResults();
    router.replace(buildUrl({ q: debouncedQuery, class: selClass, subject: selSubj, sort, free: isFree }), { scroll: false });
  }, [buildUrl, fetchResults, router, debouncedQuery, selClass, selSubj, sort, isFree]);

  const hasFilters = selClass || selSubj || isFree;

  return (
    <div>
      {/* Search input */}
      <div className="relative max-w-2xl mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes, chapters, subjects..."
          className="pl-12 h-12 rounded-xl text-base border-2 focus-visible:border-primary"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selClass} onValueChange={(v) => setSelClass(v === "_all" ? "" : v)}>
            <SelectTrigger className="w-36 h-9 rounded-lg text-sm">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Classes</SelectItem>
              {filters.classes.map((c) => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selSubj} onValueChange={(v) => setSelSubj(v === "_all" ? "" : v)}>
            <SelectTrigger className="w-40 h-9 rounded-lg text-sm">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All Subjects</SelectItem>
              {filters.subjects.map((s) => <SelectItem key={s.id} value={s.slug}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <label className="flex items-center gap-1.5 cursor-pointer text-sm">
            <Checkbox checked={isFree} onCheckedChange={(v) => setIsFree(Boolean(v))} />
            Free only
          </label>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={() => { setSelClass(""); setSelSubj(""); setIsFree(false); }} className="text-xs gap-1">
              <X className="w-3 h-3" />Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!loading && <span className="text-sm text-muted-foreground">{total} results</span>}
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40 h-9 rounded-lg text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {notes.map((note) => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-2">
            {query ? `No notes match "${query}". Try a different search.` : "Try adjusting your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
