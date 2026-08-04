import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { NoteCard } from "@/components/home/featured-notes";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

interface Props { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subject = await prisma.subject.findUnique({ where: { slug }, select: { name: true } });
  if (!subject) return { title: "Subject Not Found" };
  return {
    title: `${subject.name} Notes – NCERT Study Material`,
    description: `Browse all ${subject.name} NCERT notes across all classes. Premium, exam-ready study material.`,
  };
}

export const revalidate = 3600;

export default async function SubjectDetailPage({ params }: Props) {
  const { slug } = await params;

  const subject = await prisma.subject.findUnique({ where: { slug, isActive: true } });
  if (!subject) notFound();

  const notes = await prisma.note.findMany({
    where: { subjectId: subject.id, isPublished: true },
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
    { name: "Subjects", url: "/subjects" },
    { name: subject.name, url: `/subjects/${subject.slug}` },
  ];

  return (
    <MainLayout>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <div className="container py-12">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link><span>/</span>
          <Link href="/subjects" className="hover:text-foreground">Subjects</Link><span>/</span>
          <span className="text-foreground">{subject.name}</span>
        </nav>

        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${subject.color ?? "#3b82f6"}20` }}
          >
            {subject.icon ?? "📚"}
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold">{subject.name} Notes</h1>
            <p className="text-muted-foreground">{notes.length} notes available</p>
          </div>
        </div>

        {notesWithRating.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No notes published yet for {subject.name}.</p>
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
