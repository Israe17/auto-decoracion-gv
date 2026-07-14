import { Product } from "@/types";

export type FeaturedStatus = "active" | "scheduled" | "expired" | "none";

function costaRicaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Costa_Rica",
    year: "numeric"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function getFeaturedStatus(product: Product, now = new Date()): FeaturedStatus {
  if (!product.featured) return "none";

  const today = costaRicaDateKey(now);
  if (product.featuredFrom && product.featuredFrom > today) return "scheduled";
  if (product.featuredUntil && product.featuredUntil < today) return "expired";
  return "active";
}

export function isProductFeaturedActive(product: Product, now?: Date) {
  return getFeaturedStatus(product, now) === "active";
}

export function selectActiveFeaturedProducts(products: Product[], limit?: number) {
  const selected = products
    .filter((product) => product.status !== "sold_out" && isProductFeaturedActive(product))
    .sort(
      (a, b) =>
        (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name)
    );

  return typeof limit === "number" ? selected.slice(0, limit) : selected;
}
