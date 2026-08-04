import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = { title: "Disclaimer", robots: { index: true, follow: true } };

export default function DisclaimerPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-3xl mx-auto prose dark:prose-invert">
        <h1>Disclaimer</h1>
        <p>Nuvixo is an independent educational platform and is not affiliated with, endorsed by, or officially connected to NCERT (National Council of Educational Research and Training) or CBSE (Central Board of Secondary Education).</p>

        <h2>Educational Purpose</h2>
        <p>All notes are created as supplementary study material based on the NCERT/CBSE syllabus. While we strive for accuracy, students should cross-reference with official textbooks and consult teachers for exam-critical information.</p>

        <h2>No Guarantee of Results</h2>
        <p>Nuvixo does not guarantee specific exam scores or outcomes. Results depend on individual effort, understanding, and additional practice.</p>

        <h2>Third-Party Links</h2>
        <p>Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these external sites.</p>
      </div>
    </MainLayout>
  );
}
