import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/home/hero-section";
import { SearchSection } from "@/components/home/search-section";
import { BrowseByClass } from "@/components/home/browse-by-class";
import { BrowseBySubject } from "@/components/home/browse-by-subject";
import { FeaturedNotes } from "@/components/home/featured-notes";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { StudentReviews } from "@/components/home/student-reviews";
import { StatsSection } from "@/components/home/stats-section";
import { FAQSection } from "@/components/home/faq-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { AnnouncementBanner } from "@/components/home/announcement-banner";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nuvixo – Premium NCERT Notes for Class 6 to 12",
  description:
    "Study smarter with premium, exam-ready NCERT notes for Class 6–12. Science, Maths, English, Social Science and more. Download PDF or read online.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600; // ISR every hour

async function getHomeData() {
  const [featuredNotes, classes, subjects, announcements] = await Promise.all([
    prisma.note.findMany({
      where: { isPublished: true, isFeatured: true },
      take: 8,
      select: {
        id: true, title: true, slug: true, shortDescription: true, coverUrl: true,
        price: true, originalPrice: true, isFree: true, difficulty: true,
        totalPages: true, language: true, isTrending: true, isNew: true,
        class: { select: { name: true, slug: true } },
        subject: { select: { name: true, slug: true, color: true, icon: true } },
        chapter: { select: { number: true } },
        reviews: { select: { rating: true }, where: { isApproved: true } },
      },
      orderBy: { purchaseCount: "desc" },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { notes: { where: { isPublished: true } } } } },
    }),
    prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
      include: { _count: { select: { notes: { where: { isPublished: true } } } } },
    }),
    prisma.announcement.findMany({
      where: {
        isActive: true,
        startsAt: { lte: new Date() },
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 1,
    }),
  ]);

  const notesWithRating = featuredNotes.map((n) => {
    const avgRating =
      n.reviews.length > 0
        ? n.reviews.reduce((s, r) => s + r.rating, 0) / n.reviews.length
        : 0;
    const { reviews: _, ...rest } = n;
    return { ...rest, avgRating: Math.round(avgRating * 10) / 10, reviewCount: n.reviews.length };
  });

  return { featuredNotes: notesWithRating, classes, subjects, announcements };
}

export default async function HomePage() {
  const { featuredNotes, classes, subjects, announcements } = await getHomeData();

  return (
    <MainLayout>
      {announcements[0] && <AnnouncementBanner announcement={announcements[0]} />}
      <HeroSection />
      <SearchSection />
      <BrowseByClass classes={classes} />
      <BrowseBySubject subjects={subjects} />
      <FeaturedNotes notes={featuredNotes} />
      <WhyChooseUs />
      <StatsSection />
      <StudentReviews />
      <FAQSection />
      <NewsletterSection />
    </MainLayout>
  );
}
