"use client";

import Script from "next/script";

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  );
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined") {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", action, {
        event_category: category,
        event_label: label,
        value,
      });
    }
  }
}

export function trackPurchase(orderId: string, amount: number, items: { id: string; name: string; price: number }[]) {
  if (typeof window !== "undefined") {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      gtag("event", "purchase", {
        transaction_id: orderId,
        value: amount,
        currency: "INR",
        items: items.map((item, idx) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          index: idx,
          quantity: 1,
        })),
      });
    }
  }
}
