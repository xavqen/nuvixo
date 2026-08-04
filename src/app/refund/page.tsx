import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = { title: "Refund Policy", robots: { index: true, follow: true } };

export default function RefundPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Refund Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>7-Day Money-Back Guarantee</h2>
        <p>If you&apos;re not satisfied with the quality of purchased notes, you may request a full refund within 7 days of purchase, provided:</p>
        <ul>
          <li>You have not downloaded the PDF (for downloadable notes)</li>
          <li>The request includes a valid reason for dissatisfaction</li>
          <li>The order ID and registered email are provided</li>
        </ul>

        <h2>How to Request a Refund</h2>
        <p>Email hello@studiya.com with your order ID and reason for the refund request. Our team will review and respond within 2 business days.</p>

        <h2>Processing Time</h2>
        <p>Approved refunds are processed within 5–7 business days and credited back to your original payment method via Razorpay.</p>

        <h2>Non-Refundable Cases</h2>
        <p>Refunds will not be issued for notes that have been downloaded, or after the 7-day window has passed.</p>
      </div>
    </MainLayout>
  );
}
