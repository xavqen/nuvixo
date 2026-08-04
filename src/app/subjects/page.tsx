import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "Browse by Subject – All Subjects",
  description: "Browse NCERT notes by subject. Science, Mathematics, English, Social Science and more.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { notes: { where: { isPublished: true } } } } },
  });

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold mb-3">Browse by Subject</h1>
          <p className="text-muted-foreground">Explore notes organized by subject</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/subjects/${subject.slug}`}
              className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${subject.color ?? "#3b82f6"}20`, border: `2px solid ${subject.color ?? "#3b82f6"}30` }}
              >
                {subject.icon ?? "📚"}
              </div>
              <p className="font-semibold text-center">{subject.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{subject._count.notes} notes</p>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
