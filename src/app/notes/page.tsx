import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { NotesListClient } from "@/components/notes/notes-list-client";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";

export const metadata: Metadata = {
  title: "All NCERT Notes – Class 6 to 12",
  description:
    "Browse all premium NCERT notes for Class 6–12. Filter by class, subject, board, language, and price. Instant access after purchase.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

async function getFiltersData() {
  const [classes, subjects, boards] = await Promise.all([
    prisma.class.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.board.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { classes, subjects, boards };
}

export default async function NotesPage() {
  const { classes, subjects, boards } = await getFiltersData();

  return (
    <MainLayout>
      <OrganizationJsonLd />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">All Notes</h1>
          <p className="text-muted-foreground">
            Browse premium NCERT & CBSE notes for Class 6–12
          </p>
        </div>
        <NotesListClient filters={{ classes, subjects, boards }} />
      </div>
    </MainLayout>
  );
}
