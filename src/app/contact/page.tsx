import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Mail, Phone, MapPin, MessageSquare, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us – Studiya",
  description: "Get in touch with the Studiya team. We're here to help with any questions about notes, payments, or your account.",
};

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="font-heading text-4xl font-bold mb-3">Get in Touch</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have a question? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail,    label: "Email",    value: "hello@studiya.com",   href: "mailto:hello@studiya.com" },
                  { icon: Phone,   label: "Phone",    value: "+91 98765 43210",     href: "tel:+919876543210" },
                  { icon: MessageSquare, label: "WhatsApp", value: "Chat on WhatsApp", href: "https://wa.me/919876543210" },
                  { icon: MapPin,  label: "Address",  value: "New Delhi, India",    href: null },
                  { icon: Clock,   label: "Support Hours", value: "Mon–Sat, 9 AM – 7 PM IST", href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      {href ? (
                        <a href={href} className="font-medium hover:text-primary transition-colors">{value}</a>
                      ) : (
                        <p className="font-medium">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { label: "Help Center / FAQ",  href: "/#faq" },
                  { label: "Privacy Policy",      href: "/privacy" },
                  { label: "Terms of Service",    href: "/terms" },
                  { label: "Refund Policy",       href: "/refund" },
                  { label: "DMCA Policy",         href: "/dmca" },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    → {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form (client action → API) */}
          <div className="rounded-3xl border border-border bg-card p-8">
            <h2 className="font-heading text-xl font-bold mb-6">Send a Message</h2>
            <form
              action="/api/contact"
              method="POST"
              className="space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" name="name" placeholder="Aarav Sharma" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" placeholder="e.g. Issue with my purchase" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  required
                  className="rounded-xl resize-none"
                />
              </div>
              <Button type="submit" className="w-full gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white">
                <Send className="w-4 h-4" />Send Message
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We typically respond within 24 hours on business days.
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
