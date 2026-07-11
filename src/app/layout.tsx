import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteTray } from "@/components/QuoteTray";
import { ScrollFx } from "@/components/ScrollFx";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { business } from "@/lib/business";
import { siteUrl } from "@/lib/site";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e62135"
};

const description =
  "Auto Decoración G&V (G&V System): accesorios automotrices en Liberia, Guanacaste. Venta en el local y bajo pedido, polarizado e instalación profesional de audio, video y 4x4. Cotice por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Auto Decoración G&V — Accesorios automotrices en Liberia",
    template: "%s | Auto Decoración G&V"
  },
  description,
  applicationName: "Auto Decoración G&V",
  keywords: [
    "Auto Decoración G&V",
    "autodecoraciongv",
    "G&V System",
    "accesorios automotrices Liberia",
    "polarizado Liberia Guanacaste",
    "audio y video para carro",
    "accesorios 4x4 Costa Rica"
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: siteUrl,
    siteName: "Auto Decoración G&V",
    title: "Auto Decoración G&V — Accesorios automotrices en Liberia",
    description,
    images: [{ url: "/hero/vehiculo.jpg", width: 1200, height: 630, alt: "Auto Decoración G&V" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Auto Decoración G&V — Accesorios automotrices en Liberia",
    description,
    images: ["/hero/vehiculo.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" }
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: "/gv-system-logo.ico",
    shortcut: "/gv-system-logo.ico",
    apple: "/gv-system-logo.ico"
  }
};

// Datos estructurados (JSON-LD): le dice a Google que esto es un comercio
// local de repuestos/accesorios en Liberia. Ayuda a que aparezca con su
// ficha (nombre, horario, ubicacion) en los resultados.
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: business.name,
  alternateName: [business.shortName, "autodecoraciongv"],
  description,
  url: siteUrl,
  image: `${siteUrl}/hero/vehiculo.jpg`,
  logo: `${siteUrl}/gv-system-logo.png`,
  ...(whatsappNumber && whatsappNumber !== "50600000000"
    ? { telephone: `+${whatsappNumber}` }
    : {}),
  address: {
    "@type": "PostalAddress",
    addressLocality: "Liberia",
    addressRegion: "Guanacaste",
    addressCountry: "CR"
  },
  areaServed: business.address,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "16:00"
    }
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <ScrollFx />
        <QuoteTray />
        <WhatsAppFloat />
        <Footer />
      </body>
    </html>
  );
}
