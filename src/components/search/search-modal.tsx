"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, TrendingUp, Clock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  price: number;
  isFree: boolean;
  class: { name: string };
  subject: { name: string; color: string | null };
  chapter: { number: number } | null;
}

const POPULAR_SEARCHES = [
  "Class 6 Science", "NCERT Physics", "Class 10 Maths",
  "Biology Notes", "Chemistry Chapter 1",
];

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const stored = localStorage.getItem("nuvixo_recent_searches");
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults(debouncedQuery);
  }, [debouncedQuery, fetchResults]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  function saveRecentSearch(q: string) {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("nuvixo_recent_searches", JSON.stringify(updated));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    onClose();
  }

  function handleResultClick(q: string) {
    saveRecentSearch(q);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, chapters, subjects..."
            className="border-0 shadow-none focus-visible:ring-0 text-base placeholder:text-muted-foreground/70 p-0"
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </form>

        <div className="max-h-96 overflow-y-auto p-2">
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-muted-foreground px-3 py-2 font-medium">Search Results</p>
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/notes/${result.slug}`}
                    onClick={() => handleResultClick(query)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-14 rounded-md bg-muted overflow-hidden flex-shrink-0">
                      {result.coverUrl ? (
                        <Image src={result.coverUrl} alt={result.title} width={40} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">PDF</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{result.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{result.class.name}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{result.subject.name}</span>
                      </div>
                    </div>
                    <Badge variant={result.isFree ? "secondary" : "default"} className="text-xs flex-shrink-0">
                      {formatPrice(result.price)}
                    </Badge>
                  </Link>
                ))}
                {query.length >= 2 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={() => { saveRecentSearch(query); onClose(); }}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg text-sm text-primary hover:bg-primary/10 transition-colors font-medium"
                  >
                    <Search className="w-4 h-4" />
                    See all results for &quot;{query}&quot;
                  </Link>
                )}
              </motion.div>
            ) : !query ? (
              <motion.div key="default" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground px-3 py-2 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" />Recent Searches
                    </p>
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted transition-colors text-left text-sm"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground px-3 py-2 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-2 px-3 py-2">
                    {POPULAR_SEARCHES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium hover:bg-primary hover:text-white transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Search className="w-8 h-8 mb-3 opacity-50" />
                <p className="text-sm">No results for &quot;{query}&quot;</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t px-4 py-3 flex items-center gap-4 text-xs text-muted-foreground">
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd> to search
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd> to navigate
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
