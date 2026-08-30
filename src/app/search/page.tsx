import { Metadata } from "next";
import { Suspense } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SearchPageClient } from "@/components/search/search-page-client";
import { prisma } from "@/lib/prisma";
import { SearchAction } from "@/components/seo/search-action-json-ld";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q ?? "";
  return {
    title: q ? `"${q}" – Search Results` : "Search Notes",
    description: `Search NCERT notes across all classes and subjects${q ? ` for "${q}"` : ""}.`,
    robots: { index: false },
  };
}

async function getFiltersData() {
  const [classes, subjects, boards] = await Promise.all([
    prisma.class.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.subject.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 20 }),
    prisma.board.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { classes, subjects, boards };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string; subject?: string; sort?: string; free?: string }>;
}) {
  const sp = await searchParams;
  const { classes, subjects, boards } = await getFiltersData();

  return (
    <MainLayout>
      <SearchAction />
      <div className="container py-8">
        <Suspense fallback={<div className="text-muted-foreground">Loading…</div>}>
          <SearchPageClient
            initialQuery={sp.q ?? ""}
            initialClass={sp.class ?? ""}
            initialSubject={sp.subject ?? ""}
            initialSort={sp.sort ?? "newest"}
            initialFree={sp.free === "true"}
            filters={{ classes, subjects, boards }}
          />
        </Suspense>
      </div>
    </MainLayout>
  );
}
