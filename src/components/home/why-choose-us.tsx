"use client";

import { motion } from "framer-motion";
import { Shield, Zap, BookMarked, Download, Star, HeadphonesIcon } from "lucide-react";

const features = [
  {
    icon: BookMarked,
    title: "Expert-Curated Notes",
    description: "Every note is prepared by experienced teachers following the latest NCERT syllabus.",
    color: "bg-blue-500",
  },
  {
    icon: Zap,
    title: "Instant Access",
    description: "Purchase once and access instantly. No waiting, no delays. Start reading right away.",
    color: "bg-violet-500",
  },
  {
    icon: Download,
    title: "Offline Reading",
    description: "Download PDF for offline studying during exams or when internet isn't available.",
    color: "bg-emerald-500",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "All payments are secured with 256-bit encryption. Razorpay powered checkout.",
    color: "bg-orange-500",
  },
  {
    icon: Star,
    title: "Quality Guaranteed",
    description: "4.9/5 average rating from 10,000+ students. Quality or your money back.",
    color: "bg-pink-500",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 Support",
    description: "Got a question? Our support team is always ready to help you via email or chat.",
    color: "bg-cyan-500",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">Why Students Love Nuvixo</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We&apos;re not just a notes platform — we&apos;re your study partner designed to help you succeed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 shadow-md transition-transform group-hover:scale-110 duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
