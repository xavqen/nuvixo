"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Search, BookOpen, Star, Users, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-violet-950 min-h-[90vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-700/10 rounded-full blur-3xl" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container relative z-10 py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-white/80 mb-8"
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span>Premium NCERT Notes — Class 6 Science now available</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight text-balance mb-6"
          >
            Study Smarter.{" "}
            <span className="bg-gradient-to-r from-brand-300 to-violet-300 bg-clip-text text-transparent">
              Score Higher.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed text-balance"
          >
            India&apos;s most comprehensive NCERT notes platform. Exam-ready, well-structured 
            notes for Class 6–12 students. Read online or download PDF.
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex gap-2 max-w-xl mx-auto mb-8"
            action="/search"
            method="GET"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                name="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Chapter, Subject, Class..."
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400 focus:bg-white/15 transition-all text-sm"
              />
            </div>
            <Button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-brand-500 to-violet-600 hover:opacity-90 text-white rounded-xl font-semibold transition-all"
            >
              Search
            </Button>
          </motion.form>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {["Class 6 Science", "Class 10 Maths", "Class 12 Physics", "NCERT Biology"].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs hover:bg-white/20 hover:text-white transition-all"
              >
                {tag}
              </Link>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild className="bg-white text-brand-700 hover:bg-white/90 font-semibold px-8 rounded-xl">
              <Link href="/notes">
                <BookOpen className="w-5 h-5 mr-2" />Browse Notes
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20 rounded-xl"
            >
              <Link href="/auth/register">
                Start Free <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-8 mt-14 text-white/60 text-sm flex-wrap"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span><strong className="text-white">10,000+</strong> Students</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span><strong className="text-white">500+</strong> Notes</span>
            </div>
            <div className="w-px h-4 bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span><strong className="text-white">4.9/5</strong> Average Rating</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" className="w-full fill-background" preserveAspectRatio="none">
          <path d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,30 L1440,60 Z" />
        </svg>
      </div>
    </section>
  );
}
