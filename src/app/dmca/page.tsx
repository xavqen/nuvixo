import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = { title: "DMCA Policy", robots: { index: true, follow: true } };

export default function DMCAPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl mx-auto prose dark:prose-invert">
        <h1>DMCA Policy</h1>
        <p>Nuvixo respects the intellectual property rights of others. All notes on our platform are either originally created by our team or licensed appropriately.</p>

        <h2>Filing a DMCA Complaint</h2>
        <p>If you believe content on Nuvixo infringes your copyright, send a written notice to hello@nuvixo.com including:</p>
        <ul>
          <li>Identification of the copyrighted work</li>
          <li>Location of the infringing material on our site</li>
          <li>Your contact information</li>
          <li>A statement of good faith belief that the use is unauthorized</li>
          <li>A statement of accuracy under penalty of perjury</li>
        </ul>

        <h2>Our Response</h2>
        <p>We will investigate all valid claims and remove infringing content promptly.</p>
      </div>
    </MainLayout>
  );
}
