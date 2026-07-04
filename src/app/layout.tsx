import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteTray } from "@/components/QuoteTray";

export const metadata: Metadata = {
  title: "Auto Decoracion G&V",
  description:
    "Catalogo de accesorios automotrices, instalacion y cotizacion por WhatsApp en Liberia, Guanacaste.",
  icons: {
    icon: "/gv-system-logo.ico",
    shortcut: "/gv-system-logo.ico",
    apple: "/gv-system-logo.ico"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <Header />
        <main>{children}</main>
        <QuoteTray />
        <Footer />
      </body>
    </html>
  );
}
