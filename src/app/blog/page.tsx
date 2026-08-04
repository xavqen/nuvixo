import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";

export const metadata: Metadata = {
  title: "Blog – Study Tips, NCERT Guides & Exam Prep",
  description: "Read study tips, NCERT guides, exam preparation articles and more on the Nuvixo blog.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        id: true, title: true, slug: true, excerpt: true, coverUrl: true,
        tags: true, readingTime: true, publishedAt: true, viewCount: true,
        category: { select: { name: true, slug: true, color: true } },
      },
    }),
    prisma.blogCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const [featured, ...rest] = posts;

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-bold mb-3">Nuvixo Blog</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Study tips, NCERT guides, exam strategies and more for Indian students.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Link href="/blog" className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/blog?category=${cat.slug}`}
              className="px-4 py-1.5 rounded-full border border-border text-sm hover:bg-muted transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="grid md:grid-cols-2 gap-8 rounded-3xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video md:aspect-auto bg-muted">
                {featured.coverUrl ? (
                  <Image src={featured.coverUrl} alt={featured.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-violet-100 dark:from-brand-950 dark:to-violet-950" />
                )}
              </div>
              <div className="p-8 flex flex-col justify-center">
                {featured.category && (
                  <Badge className="w-fit mb-3" style={{ backgroundColor: `${featured.category.color}20`, color: featured.category.color ?? undefined, border: "none" }}>
                    {featured.category.name}
                  </Badge>
                )}
                <h2 className="font-heading text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">{featured.excerpt}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {featured.publishedAt && <span>{formatDate(featured.publishedAt)}</span>}
                  {featured.readingTime && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{featured.readingTime} min read</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-4 text-sm text-primary font-medium">
                  Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="relative aspect-video bg-muted">
                {post.coverUrl ? (
                  <Image src={post.coverUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-violet-50 dark:from-brand-950/50 dark:to-violet-950/50" />
                )}
              </div>
              <div className="p-5">
                {post.category && (
                  <span className="text-xs font-medium" style={{ color: post.category.color ?? undefined }}>{post.category.name}</span>
                )}
                <h3 className="font-semibold mt-1 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && <p className="text-muted-foreground text-xs line-clamp-2 mb-3">{post.excerpt}</p>}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {post.publishedAt && <span>{formatDate(post.publishedAt, { month: "short", day: "numeric" })}</span>}
                  {post.readingTime && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readingTime} min</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No articles published yet.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
