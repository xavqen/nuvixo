import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXTAUTH_URL ?? "https://nuvixo.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/notes/", "/blog/", "/classes/", "/subjects/", "/search"],
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/reader/",
          "/auth/",
          "/_next/",
          "/static/",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
