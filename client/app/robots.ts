import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     "/",
        disallow:  [
          "/admin/",   // never index admin portal
          "/api/",     // never index API routes
          "/_next/",   // never index Next.js internals
        ],
      },
    ],
    sitemap: "https://www.kosres.com/sitemap.xml",
    host:    "https://www.kosres.com",
  }
}
