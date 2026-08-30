import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MainLayout } from "@/components/layout/main-layout";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { ArticleJsonLd } from "@/components/seo/article-json-ld";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-json-ld";

interface Props { params: Promise<{ slug: string }> }

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, excerpt: true, metaTitle: true, metaDescription: true, coverUrl: true, keywords: true },
  });
  if (!post) return { title: "Post Not Found" };

  return {
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt ?? undefined,
    keywords: post.keywords,
    openGraph: {
      title: post.metaTitle ?? post.title,
      description: post.metaDescription ?? post.excerpt ?? "",
      images: post.coverUrl ? [post.coverUrl] : [],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true },
  });
  if (!post) notFound();

  // View count (fire-and-forget)
  prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  // Related posts
  const related = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", id: { not: post.id }, categoryId: post.categoryId ?? undefined },
    take: 3,
    select: { id: true, title: true, slug: true, coverUrl: true, readingTime: true, publishedAt: true },
  });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  return (
    <MainLayout>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <article className="container py-12 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-foreground">Blog</Link>
          <span>/</span>
          <span className="text-foreground line-clamp-1">{post.title}</span>
        </nav>

        {/* Header */}
        {post.category && (
          <Badge className="mb-4" style={{ backgroundColor: `${post.category.color}20`, color: post.category.color ?? undefined, border: "none" }}>
            {post.category.name}
          </Badge>
        )}
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-4 text-balance">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 flex-wrap">
          {post.publishedAt && (
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(post.publishedAt)}</span>
          )}
          {post.readingTime && (
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readingTime} min read</span>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5 ml-auto" onClick={() => {}}>
            <Share2 className="w-4 h-4" />Share
          </Button>
        </div>

        {/* Cover */}
        {post.coverUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted mb-10 shadow-lg">
            <Image src={post.coverUrl} alt={post.title} fill className="object-cover" priority />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-heading prose-headings:font-bold
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-blockquote:border-l-brand-500
            prose-code:bg-muted prose-code:rounded prose-code:px-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground cursor-pointer">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="border-t border-border py-12">
          <div className="container max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow">
                  {rel.coverUrl && (
                    <div className="relative aspect-video bg-muted">
                      <Image src={rel.coverUrl} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{rel.title}</h3>
                    {rel.readingTime && <p className="text-xs text-muted-foreground mt-1">{rel.readingTime} min read</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
