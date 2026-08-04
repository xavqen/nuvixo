import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { NoteDetailClient } from "@/components/notes/note-detail-client";
import { RelatedNotes } from "@/components/notes/related-notes";
import { NoteJsonLd } from "@/components/seo/note-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";
import { hasUserPurchasedNote } from "@/lib/auth-helpers";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = await prisma.note.findUnique({
    where: { slug, isPublished: true },
    select: {
      title: true, metaTitle: true, metaDescription: true,
      shortDescription: true, coverUrl: true, keywords: true,
      class: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });

  if (!note) return { title: "Note Not Found" };

  return {
    title: note.metaTitle ?? note.title,
    description: note.metaDescription ?? note.shortDescription ?? undefined,
    keywords: note.keywords,
    openGraph: {
      title: note.metaTitle ?? note.title,
      description: note.metaDescription ?? note.shortDescription ?? "",
      images: note.coverUrl ? [{ url: note.coverUrl, width: 800, height: 1100 }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: note.metaTitle ?? note.title,
      description: note.metaDescription ?? note.shortDescription ?? "",
      images: note.coverUrl ? [note.coverUrl] : [],
    },
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const { slug } = await params;

  const note = await prisma.note.findUnique({
    where: { slug, isPublished: true },
    include: {
      class: true,
      subject: true,
      book: true,
      chapter: true,
      board: true,
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!note) notFound();

  const session = await auth();
  let hasPurchased = false;
  let isWishlisted = false;

  if (session?.user?.id) {
    [hasPurchased, isWishlisted] = await Promise.all([
      hasUserPurchasedNote(session.user.id, note.id),
      prisma.wishlist
        .findUnique({ where: { userId_noteId: { userId: session.user.id, noteId: note.id } } })
        .then(Boolean),
    ]);
    // Increment view count
    prisma.note.update({ where: { id: note.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  }

  // Related notes
  const relatedNotes = await prisma.note.findMany({
    where: {
      isPublished: true,
      subjectId: note.subjectId,
      classId: note.classId,
      id: { not: note.id },
    },
    take: 4,
    select: {
      id: true, title: true, slug: true, coverUrl: true,
      price: true, isFree: true, difficulty: true, totalPages: true,
      class: { select: { name: true, slug: true } },
      subject: { select: { name: true, slug: true, color: true, icon: true } },
      reviews: { select: { rating: true }, where: { isApproved: true } },
    },
  });

  const avgRating =
    note.reviews.length > 0
      ? note.reviews.reduce((s, r) => s + r.rating, 0) / note.reviews.length
      : 0;

  const breadcrumbs = [
    { name: "Home",           url: "/" },
    { name: "Notes",          url: "/notes" },
    { name: note.class.name,  url: `/classes/${note.class.slug}` },
    { name: note.subject.name,url: `/subjects/${note.subject.slug}` },
    { name: note.title,       url: `/notes/${note.slug}` },
  ];

  return (
    <MainLayout>
      <NoteJsonLd note={note} avgRating={avgRating} reviewCount={note.reviews.length} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <NoteDetailClient
        note={{ ...note, pdfSecureUrl: undefined, pdfPublicId: undefined }}
        hasPurchased={hasPurchased}
        isWishlisted={isWishlisted}
        avgRating={Math.round(avgRating * 10) / 10}
        userId={session?.user?.id}
        breadcrumbs={breadcrumbs}
      />
      <RelatedNotes notes={relatedNotes} />
    </MainLayout>
  );
}
