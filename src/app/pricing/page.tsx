import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { Check, Zap, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing – Nuvixo NCERT Notes",
  description: "Affordable pricing for premium NCERT notes. Buy individual chapter notes or save with bundles. Lifetime access guaranteed.",
};

const plans = [
  {
    name: "Free Preview",
    price: 0,
    description: "Explore before you buy",
    icon: Zap,
    color: "from-slate-400 to-slate-600",
    features: [
      "Preview first 3–5 pages of any note",
      "Browse all classes & subjects",
      "Search notes",
      "Create free account",
      "Access free chapters",
    ],
    cta: "Start Free",
    href: "/notes?free=true",
    highlighted: false,
  },
  {
    name: "Per Chapter",
    price: 49,
    priceNote: "per chapter",
    description: "Buy exactly what you need",
    icon: Star,
    color: "from-brand-500 to-violet-600",
    features: [
      "Full chapter notes PDF",
      "Online reading with bookmarks",
      "Night mode & zoom",
      "Reading progress tracker",
      "Optional PDF download",
      "Lifetime access",
      "7-day refund guarantee",
    ],
    cta: "Browse Notes",
    href: "/notes",
    highlighted: true,
  },
  {
    name: "Class Bundle",
    price: 299,
    priceNote: "per class/subject",
    description: "Best value for full preparation",
    icon: Crown,
    color: "from-amber-500 to-orange-600",
    features: [
      "All chapters of one subject",
      "Everything in Per Chapter",
      "Priority customer support",
      "Early access to new notes",
      "Certificate of completion",
      "Exclusive study tips",
      "Lifetime access",
    ],
    cta: "Coming Soon",
    href: "#",
    highlighted: false,
    comingSoon: true,
  },
];

export default function PricingPage() {
  return (
    <MainLayout>
      <div className="container py-16">
        <div className="text-center mb-14">
          <h1 className="font-heading text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            No subscriptions. No hidden fees. Buy the notes you need, access them forever.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl border ${plan.highlighted ? "border-brand-300 dark:border-brand-600 shadow-premium" : "border-border"} bg-card p-8 flex flex-col`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-violet-600 text-white text-xs font-bold whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-heading text-xl font-bold mb-1">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.priceNote && (
                    <span className="text-muted-foreground text-sm ml-2">{plan.priceNote}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild={!plan.comingSoon}
                  disabled={plan.comingSoon}
                  className={plan.highlighted
                    ? "bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90 w-full"
                    : "w-full"
                  }
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.comingSoon ? (
                    <span>{plan.cta}</span>
                  ) : (
                    <Link href={plan.href}>{plan.cta}</Link>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* FAQ pricing */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="font-heading text-2xl font-bold text-center mb-8">Pricing FAQ</h2>
          <div className="space-y-4">
            {[
              { q: "Is there a subscription?", a: "No. Nuvixo uses a one-time purchase model. Pay once, own forever." },
              { q: "Can I get a refund?", a: "Yes. We offer a 7-day money-back guarantee if you're not satisfied with the quality." },
              { q: "Are there student discounts?", a: "Yes! Use coupon codes from our newsletter or social media for up to 50% off." },
              { q: "What payment methods are accepted?", a: "UPI, credit/debit cards, net banking, and popular wallets via Razorpay." },
            ].map((faq) => (
              <div key={faq.q} className="p-5 rounded-2xl border border-border bg-card">
                <p className="font-semibold mb-1">{faq.q}</p>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
