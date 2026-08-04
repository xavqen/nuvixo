import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { BookOpen, Target, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Studiya – Our Story",
  description: "Learn about Studiya, India's premium NCERT notes platform built to help students study smarter and score higher.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-premium">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-heading text-4xl font-bold mb-4">About Studiya</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            We believe every Indian student deserves access to high-quality study material. 
            Studiya was built to make premium NCERT notes affordable, accessible, and effective.
          </p>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "Empower 1 million Indian students to score their best by providing world-class NCERT study material at an affordable price.",
              color: "bg-blue-500",
            },
            {
              icon: Users,
              title: "Our Audience",
              desc: "Students in Class 6–12 preparing for board exams, competitive entrance tests, and annual school examinations.",
              color: "bg-violet-500",
            },
            {
              icon: Award,
              title: "Our Quality",
              desc: "Every note is reviewed by experienced teachers and subject matter experts to ensure accuracy and exam-readiness.",
              color: "bg-emerald-500",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="p-6 rounded-2xl border border-border bg-card text-center">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>Our Story</h2>
          <p>
            Studiya was founded with a single goal: make quality NCERT notes accessible to every student across India. 
            We noticed that most students either struggled with poorly formatted notes or spent excessive time 
            making their own. We decided to fix that.
          </p>
          <p>
            Starting with Class 6 Science, we crafted chapter-by-chapter notes that are structured, 
            well-illustrated, and aligned with the latest NCERT syllabus. Every note is designed so that 
            a student can read it the night before an exam and feel confident.
          </p>
          <p>
            Our platform is built on three pillars: <strong>quality</strong>, <strong>accessibility</strong>, 
            and <strong>affordability</strong>. We support all formats — online reading with bookmarks and 
            progress tracking, and offline PDF downloads — so students can study however works best for them.
          </p>
          <h2>What&apos;s Next</h2>
          <p>
            We are actively expanding to cover Class 6–12 across all subjects including Science, Mathematics, 
            Social Science, English, Hindi, Physics, Chemistry, and Biology for NCERT, CBSE, and major State Boards. 
            Future plans include video lessons, AI-powered tutoring, practice tests, and a mobile app.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
