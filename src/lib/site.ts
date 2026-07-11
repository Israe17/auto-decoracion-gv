// URL publica del sitio. Se toma de la variable de entorno
// NEXT_PUBLIC_SITE_URL (configurela en el hosting: Vercel > Settings >
// Environment Variables, o en .env.local). Sin ella cae a un valor por
// defecto para que el build no falle; cambielo por su dominio real.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://autodecoraciongv.com"
).replace(/\/$/, "");
