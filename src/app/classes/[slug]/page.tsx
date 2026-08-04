import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { NoteCard } from "@/components/home/featured-notes";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import Link from "next/link";

interface Props { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cls = await prisma.class.findUnique({ where: { slug }, select: { name: true } });
  if (!cls) return { title: "Class Not Found" };
  return {
    title: `${cls.name} Notes – NCERT Study Material`,
    description: `Browse all ${cls.name} NCERT notes across all subjects. Premium, exam-ready study material.`,
  };
}

export const revalidate = 3600;

export default async function ClassDetailPage({ params }: Props) {
  const { slug } = await params;

  const cls = await prisma.class.findUnique({
    where: { slug, isActive: true },
    include: {
      subjects: {
        include: { subject: true },
      },
    },
  });
  if (!cls) notFound();

  const notes = await prisma.note.findMany({
    where: { classId: cls.id, isPublished: true },
    take: 24,
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, shortDescription: true, coverUrl: true,
      price: true, originalPrice: true, isFree: true, difficulty: true,
      totalPages: true, language: true, isTrending: true, isNew: true,
      class: { select: { name: true, slug: true } },
      subject: { select: { name: true, slug: true, color: true, icon: true } },
      chapter: { select: { number: true } },
      reviews: { select: { rating: true }, where: { isApproved: true } },
    },
  });

  const notesWithRating = notes.map((n) => {
    const avgRating = n.reviews.length > 0 ? n.reviews.reduce((s, r) => s + r.rating, 0) / n.reviews.length : 0;
    const { reviews: _, ...rest } = n;
    return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: n.reviews.length };
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Classes", url: "/classes" },
    { name: cls.name, url: `/classes/${cls.slug}` },
  ];

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="container py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link href="/classes" className="hover:text-foreground">Classes</Link><span>/</span>
          <span className="text-foreground">{cls.name}</span>
        </nav>

        <h1 className="font-heading text-4xl font-bold mb-3">{cls.name} Notes</h1>
        <p className="text-muted-foreground mb-8">{notes.length} notes available for {cls.name}</p>

        {/* Subjects for this class */}
        {cls.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {cls.subjects.map(({ subject }) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}?class=${cls.slug}`}
                className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                {subject.icon} {subject.name}
              </Link>
            ))}
          </div>
        )}

        {notesWithRating.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No notes published yet for {cls.name}.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {notesWithRating.map((note) => <NoteCard key={note.id} note={note} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
