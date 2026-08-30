"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingCart, Tag, Loader2, CheckCircle, CreditCard, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { trackPurchase } from "@/components/analytics/google-analytics";
import toast from "react-hot-toast";
import Script from "next/script";

interface PurchaseModalProps {
  note: {
    id: string;
    title: string;
    price: number;
    originalPrice: number | null;
    isFree: boolean;
    coverUrl: string | null;
    class: { name: string };
    subject: { name: string };
  };
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

export function PurchaseModal({ note, onClose }: PurchaseModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const currentUser = session?.user;
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const finalPrice = Math.max(0, note.price - discount);

  if (!currentUser) {
    router.push(`/auth/login?callbackUrl=/notes/${note.id}`);
    return null;
  }

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteIds: [note.id], couponCode: coupon }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      // Re-derive discount from the order response
      const expectedFinal = data.amount ?? finalPrice;
      setDiscount(note.price - expectedFinal);
      setCouponApplied(true);
      toast.success("Coupon applied!");
    } catch {
      toast.error("Failed to apply coupon.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handlePurchase() {
    if (!currentUser) {
      router.push(`/auth/login?callbackUrl=/notes/${note.id}`);
      onClose();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteIds: [note.id],
          ...(couponApplied && { couponCode: coupon }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); setLoading(false); return; }

      // Free note or zero after coupon
      if (data.free) {
        toast.success("Access granted!");
        trackPurchase(data.order.id, 0, [{ id: note.id, name: note.title, price: 0 }]);
        router.push(`/reader/${note.id}`);
        onClose();
        return;
      }

      // Razorpay checkout
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: "Studiya",
        description: note.title,
        order_id: data.razorpayOrderId,
        prefill: {
          name: currentUser?.name ?? "",
          email: currentUser?.email ?? "",
        },
        theme: { color: "#3b82f6" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            trackPurchase(data.orderId, finalPrice, [{ id: note.id, name: note.title, price: finalPrice }]);
            toast.success("Payment successful! Access granted.");
            router.push(`/reader/${note.id}`);
            onClose();
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl font-bold">Complete Purchase</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Secure checkout powered by Razorpay</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border mb-6">
                <div className="w-12 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center text-xl">📚</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2">{note.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{note.class.name} · {note.subject.name}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-bold">{formatPrice(note.price)}</span>
                    {note.originalPrice && note.originalPrice > note.price && (
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(note.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon */}
              {!note.isFree && (
                <div className="mb-6">
                  <label className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" />Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponApplied(false); setDiscount(0); }}
                      placeholder="Enter coupon code"
                      className="rounded-lg flex-1"
                      disabled={couponApplied}
                    />
                    <Button
                      variant="outline"
                      onClick={applyCoupon}
                      disabled={couponLoading || couponApplied}
                      className="rounded-lg"
                    >
                      {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : couponApplied ? <CheckCircle className="w-4 h-4 text-green-500" /> : "Apply"}
                    </Button>
                  </div>
                  {couponApplied && discount > 0 && (
                    <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />Coupon applied — you saved {formatPrice(discount)}!
                    </p>
                  )}
                </div>
              )}

              <Separator className="mb-4" />

              {/* Price summary */}
              <div className="space-y-2 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span>{formatPrice(note.price)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2 bg-gradient-to-r from-brand-600 to-violet-600 text-white hover:opacity-90 h-12 text-base font-semibold"
                onClick={handlePurchase}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {finalPrice === 0 ? "Get Free Access" : `Pay ${formatPrice(finalPrice)}`}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                256-bit SSL encryption · Powered by Razorpay
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
