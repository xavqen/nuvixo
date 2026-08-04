"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const reviews = [
  {
    name: "Aarav Sharma",
    class: "Class 6, Delhi",
    rating: 5,
    text: "These notes are incredibly well-structured! The Class 6 Science notes helped me understand food and nutrition perfectly. My exam scores improved from 70% to 95% after using Studiya!",
    avatar: "AS",
  },
  {
    name: "Priya Patel",
    class: "Class 10, Mumbai",
    rating: 5,
    text: "Best NCERT notes platform I've ever used. The PDF quality is excellent and the online reader is so smooth. Totally worth the investment for board exam preparation.",
    avatar: "PP",
  },
  {
    name: "Rahul Verma",
    class: "Class 12, Bangalore",
    rating: 5,
    text: "I was skeptical at first but after trying the free preview, I bought all Chemistry notes. The explanations are crystal clear and diagrams are top-notch. Highly recommend!",
    avatar: "RV",
  },
  {
    name: "Sneha Gupta",
    class: "Class 8, Kolkata",
    rating: 5,
    text: "My daughter loves these notes. The bookmark and progress tracking feature is amazing — she can pick up exactly where she left off. The night mode is great for evening study.",
    avatar: "SG",
  },
  {
    name: "Arjun Nair",
    class: "Class 11, Chennai",
    rating: 4,
    text: "Physics and Chemistry notes are outstanding. Covers all NCERT concepts thoroughly with extra examples. The mobile experience is also very smooth.",
    avatar: "AN",
  },
  {
    name: "Kavya Reddy",
    class: "Class 9, Hyderabad",
    rating: 5,
    text: "Studiya has completely changed how I study. The structured notes with key points highlighted save so much time during revision. 100% recommended for CBSE students!",
    avatar: "KR",
  },
];

export function StudentReviews() {
  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">What Students Say</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join 10,000+ students who are already scoring higher with Studiya
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
            <span className="font-semibold ml-1">4.9</span>
            <span className="text-muted-foreground text-sm">from 2,500+ reviews</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="relative p-6 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-muted-foreground/20" />
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-brand-400 to-violet-500 text-white text-sm font-bold">
                    {review.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.class}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
                {Array.from({ length: 5 - review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-muted-foreground/30" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
