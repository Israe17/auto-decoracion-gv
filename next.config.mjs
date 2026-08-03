// Las fotos que sube el admin viven en Supabase Storage (bucket
// catalog-media). El optimizador de next/image RECHAZA cualquier host que
// no este listado aqui: sin esta entrada las tarjetas salen en blanco en
// el sitio, aunque en el admin (que usa <img> normal) se vean bien.
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
  } catch {
    return "ooytyrwpkvrosppyhzcm.supabase.co";
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost
      },
      // Imagenes viejas que siguen vivas en el catalogo.
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "images.pexels.com"
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  }
};

export default nextConfig;
