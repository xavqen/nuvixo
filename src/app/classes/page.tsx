import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Browse by Class – Class 6 to 12",
  description: "Browse NCERT notes by class. Select your class from 6 to 12 to find well-structured, exam-ready notes.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { notes: { where: { isPublished: true } } } } },
  });

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-3">Browse by Class</h1>
          <p className="text-muted-foreground">Select your class to explore available notes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {classes.map((cls) => (
            <Link
              key={cls.id}
              href={`/classes/${cls.slug}`}
              className="group flex items-center gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">{cls.name}</h2>
                <p className="text-muted-foreground text-sm">{cls._count.notes} notes available</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
