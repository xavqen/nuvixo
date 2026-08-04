interface NoteJsonLdProps {
  note: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    isFree: boolean;
    language: string;
    totalPages: number | null;
    publishedAt: Date | null;
    updatedAt: Date;
    coverUrl: string | null;
    class: { name: string };
    subject: { name: string };
    board: { name: string };
  };
  avgRating: number;
  reviewCount: number;
}

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://studiya.com";

export function NoteJsonLd({ note, avgRating, reviewCount }: NoteJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "@id": `${BASE_URL}/notes/${note.slug}`,
    "name": note.title,
    "description": note.description,
    "url": `${BASE_URL}/notes/${note.slug}`,
    "inLanguage": note.language === "HINDI" ? "hi" : "en",
    "numberOfPages": note.totalPages ?? undefined,
    "image": note.coverUrl,
    "datePublished": note.publishedAt?.toISOString(),
    "dateModified": note.updatedAt.toISOString(),
    "publisher": {
      "@type": "Organization",
      "name": "Studiya",
      "url": BASE_URL,
    },
    "educationalLevel": note.class.name,
    "about": {
      "@type": "Thing",
      "name": `${note.class.name} ${note.subject.name}`,
    },
    "offers": {
      "@type": "Offer",
      "price": note.isFree ? "0" : String(note.price),
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `${BASE_URL}/notes/${note.slug}`,
    },
    ...(avgRating > 0 && reviewCount > 0 && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating,
        "reviewCount": reviewCount,
        "bestRating": 5,
        "worstRating": 1,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
