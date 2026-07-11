import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// robots.txt: permite indexar todo el sitio publico menos el panel admin,
// y le indica a Google donde esta el sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin"
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}
