"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  _count: { notes: number };
}

export function BrowseBySubject({ subjects }: { subjects: Subject[] }) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="font-heading text-3xl font-bold mb-2">Browse by Subject</h2>
            <p className="text-muted-foreground">Find notes for your favourite subject</p>
          </div>
          <Link href="/subjects" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {subjects.map((subject, idx) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                href={`/subjects/${subject.slug}`}
                className="group flex flex-col items-center p-5 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                style={{ "--subject-color": subject.color ?? "#3b82f6" } as React.CSSProperties}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 transition-transform group-hover:scale-110 duration-200 shadow-sm"
                  style={{ backgroundColor: `${subject.color ?? "#3b82f6"}20`, border: `2px solid ${subject.color ?? "#3b82f6"}30` }}
                >
                  {subject.icon ?? "📚"}
                </div>
                <p className="font-semibold text-sm text-center leading-tight">{subject.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{subject._count.notes} notes</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
