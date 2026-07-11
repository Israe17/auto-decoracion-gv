import type { MetadataRoute } from "next";
import { topCategories } from "@/lib/catalog";
import { fetchPublicCatalog } from "@/lib/store";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

// Sitemap: lista todas las URLs publicas (paginas fijas + categorias madre
// + productos) para que Google las descubra e indexe. Toma los datos del
// catalogo real (Firestore) con fallback a los de ejemplo.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/contacto`, changeFrequency: "monthly", priority: 0.7 }
  ];

  try {
    const { categories, products } = await fetchPublicCatalog();

    const categoryRoutes: MetadataRoute.Sitemap = topCategories(categories).map(
      (category) => ({
        url: `${siteUrl}/categoria/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.7
      })
    );

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${siteUrl}/productos/${product.slug}`,
      changeFrequency: "weekly",
      priority: 0.6
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
