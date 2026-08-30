"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassItem {
  id: string;
  name: string;
  numeral: number;
  slug: string;
  _count: { notes: number };
}

const classColors = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-green-600",
  "from-indigo-500 to-blue-600",
  "from-red-500 to-pink-500",
];

export function BrowseByClass({ classes }: { classes: ClassItem[] }) {
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
            <h2 className="font-heading text-3xl font-bold mb-2">Browse by Class</h2>
            <p className="text-muted-foreground">Select your class and start exploring notes</p>
          </div>
          <Link
            href="/classes"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {classes.map((cls, idx) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={`/classes/${cls.slug}`}
                className="group flex flex-col items-center p-6 rounded-2xl border border-border hover:border-transparent hover:shadow-lg hover:-translate-y-1 transition-all duration-200 bg-card relative overflow-hidden"
              >
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gradient-to-br",
                  classColors[idx % classColors.length]
                )} />
                <div className="relative z-10">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-3 mx-auto shadow-md transition-transform group-hover:scale-110 duration-200",
                    classColors[idx % classColors.length]
                  )}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-bold text-lg text-center group-hover:text-white transition-colors">{cls.name}</p>
                  <p className="text-xs text-muted-foreground text-center mt-0.5 group-hover:text-white/80 transition-colors">
                    {cls._count.notes} notes
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
