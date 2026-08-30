import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: true, follow: true } };

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly (name, email, phone) and information collected automatically (IP address, browser type, pages visited) to improve our services.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, process payments, send transactional emails, and communicate updates. We never sell your personal data to third parties.</p>

        <h2>3. Payment Information</h2>
        <p>All payments are processed securely through Razorpay. We do not store your card details on our servers.</p>

        <h2>4. Cookies</h2>
        <p>We use cookies for authentication, analytics (Google Analytics 4, Microsoft Clarity), and to remember your preferences.</p>

        <h2>5. Data Security</h2>
        <p>We implement industry-standard security measures including SSL encryption, secure password hashing, and signed URLs for content protection.</p>

        <h2>6. Your Rights</h2>
        <p>You may request access, correction, or deletion of your personal data by contacting hello@studiya.com.</p>

        <h2>7. Contact Us</h2>
        <p>For privacy-related questions, contact us at hello@studiya.com.</p>
      </div>
    </MainLayout>
  );
}
