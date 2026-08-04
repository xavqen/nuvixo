"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function SearchSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-heading text-2xl font-bold mb-2">Find your notes instantly</h2>
          <p className="text-muted-foreground text-sm mb-6">Search across all classes, subjects, and chapters</p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Class 6 Science Chapter 1..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
            <Button type="submit" className="px-6 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 text-white">
              Search
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" asChild>
              <Link href="/notes"><SlidersHorizontal className="w-4 h-4" /></Link>
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
