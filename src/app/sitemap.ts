import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://studiya.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [notes, blogPosts, classes, subjects] = await Promise.all([
    prisma.note.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.class.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.subject.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/notes`,  lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/classes`,lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/subjects`,lastModified: new Date(),changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/pricing`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/blog`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/about`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`,lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terms`,  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/refund`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const notePages: MetadataRoute.Sitemap = notes.map((note) => ({
    url: `${BASE_URL}/notes/${note.slug}`,
    lastModified: note.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const classPages: MetadataRoute.Sitemap = classes.map((cls) => ({
    url: `${BASE_URL}/classes/${cls.slug}`,
    lastModified: cls.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const subjectPages: MetadataRoute.Sitemap = subjects.map((sub) => ({
    url: `${BASE_URL}/subjects/${sub.slug}`,
    lastModified: sub.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...notePages, ...blogPages, ...classPages, ...subjectPages];
}
