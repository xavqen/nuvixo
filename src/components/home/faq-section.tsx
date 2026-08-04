"use client";

import { motion } from "framer-motion";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Studiya?",
    a: "Studiya is India's premium NCERT notes platform offering well-structured, exam-ready study material for Class 6–12 students. You can browse, preview, purchase, and read notes online or download PDFs.",
  },
  {
    q: "Are there any free notes available?",
    a: "Yes! We offer select chapters completely free. For Class 6 Science, the first three chapters are free to read. Browse all free notes at /notes?free=true.",
  },
  {
    q: "Can I preview notes before purchasing?",
    a: "Absolutely. Every note has a free preview of the first 3–5 pages so you can assess quality before buying. No registration required to preview.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support all major payment methods via Razorpay: UPI, credit/debit cards, net banking, and popular wallets. All transactions are secured with 256-bit SSL encryption.",
  },
  {
    q: "Can I download the PDF after purchase?",
    a: "Yes, you can download the PDF after purchase (subject to admin settings). You can also read notes online using our built-in PDF viewer with features like bookmarks, progress tracking, and night mode.",
  },
  {
    q: "How long do I have access to purchased notes?",
    a: "Lifetime access. Once you purchase a note, it's yours forever. Access it anytime from your dashboard on any device.",
  },
  {
    q: "What if I'm not satisfied with the notes?",
    a: "We offer a 7-day refund policy if the notes don't meet the described quality. Contact support at hello@studiya.com with your order ID.",
  },
  {
    q: "Are the notes updated with the latest NCERT syllabus?",
    a: "Yes. Our notes are regularly reviewed and updated to reflect the latest NCERT curriculum changes. The last updated date is shown on every note page.",
  },
  {
    q: "Is Studiya available on mobile?",
    a: "Studiya is fully responsive and works on all devices. You can also install it as a Progressive Web App (PWA) on your phone for an app-like experience.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-heading text-3xl font-bold mb-3">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about Studiya</p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <AccordionItem
                  value={`faq-${idx}`}
                  className="border border-border rounded-xl px-4 bg-card shadow-sm"
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
