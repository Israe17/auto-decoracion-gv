// URL pública del sitio para metadata absoluta (Open Graph, sitemap, JSON-LD).
// Configure NEXT_PUBLIC_SITE_URL con el dominio real en produccion.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://autodecoraciongv.com"
).replace(/\/$/, "");
