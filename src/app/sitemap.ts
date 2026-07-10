import type { MetadataRoute } from "next";
import { fetchPublicCatalog } from "@/lib/store";
import { siteUrl } from "@/lib/seo";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await fetchPublicCatalog();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/contacto`, changeFrequency: "monthly", priority: 0.5 }
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories
    .filter((category) => !category.parent)
    .map((category) => ({
      url: `${siteUrl}/categoria/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.7
    }));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/productos/${product.slug}`,
    changeFrequency: "weekly",
    priority: 0.6
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
