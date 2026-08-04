interface ArticleJsonLdProps {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    coverUrl: string | null;
    category: { name: string } | null;
  };
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://nuvixo.com";

export function ArticleJsonLd({ post }: ArticleJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": `${BASE_URL}/blog/${post.slug}`,
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "image": post.coverUrl ?? `${BASE_URL}/og-image.png`,
    "author": {
      "@type": "Organization",
      "name": "Nuvixo Team",
      "url": BASE_URL,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nuvixo",
      "logo": { "@type": "ImageObject", "url": `${BASE_URL}/icon-512.png` },
    },
    ...(post.category && {
      "articleSection": post.category.name,
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
