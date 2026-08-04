import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = { title: "Terms of Service", robots: { index: true, follow: true } };

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Nuvixo, you agree to be bound by these Terms of Service.</p>

        <h2>2. Account Registration</h2>
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your account credentials.</p>

        <h2>3. Purchases &amp; Licensing</h2>
        <p>When you purchase notes, you receive a personal, non-transferable license to access the content for personal study purposes. Redistribution, resale, or sharing of purchased content is strictly prohibited.</p>

        <h2>4. Content Protection</h2>
        <p>All notes are protected by copyright. Unauthorized copying, screenshotting, or distribution is a violation of these terms and may result in account termination and legal action.</p>

        <h2>5. Refunds</h2>
        <p>Refunds are governed by our <a href="/refund">Refund Policy</a>.</p>

        <h2>6. Limitation of Liability</h2>
        <p>Nuvixo provides notes &quot;as is&quot; for educational purposes. We do not guarantee specific exam outcomes.</p>

        <h2>7. Changes to Terms</h2>
        <p>We may update these terms from time to time. Continued use of the platform constitutes acceptance of updated terms.</p>

        <h2>8. Contact</h2>
        <p>Questions about these terms can be sent to hello@nuvixo.com.</p>
      </div>
    </MainLayout>
  );
}
