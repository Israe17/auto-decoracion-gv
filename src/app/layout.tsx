import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteTray } from "@/components/QuoteTray";
import { ScrollFx } from "@/components/ScrollFx";
import { SmoothScroll } from "@/components/SmoothScroll";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { business } from "@/lib/business";
import { siteUrl } from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#e62135"
};

const title = "Auto Decoracion G&V";
const description =
  "Accesorios automotrices en Liberia, Guanacaste: venta en el local y bajo pedido, polarizado e instalacion profesional. Cotice por WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/gv-system-logo.ico",
    shortcut: "/gv-system-logo.ico",
    apple: "/gv-system-logo.ico"
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: siteUrl,
    siteName: title,
    title,
    description,
    images: [{ url: "/hero/vehiculo.jpg", width: 1600, height: 997, alt: title }]
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/hero/vehiculo.jpg"]
  }
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: business.name,
  alternateName: business.shortName,
  image: `${siteUrl}/hero/vehiculo.jpg`,
  url: siteUrl,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Liberia",
    addressRegion: "Guanacaste",
    addressCountry: "CR"
  },
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
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
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
