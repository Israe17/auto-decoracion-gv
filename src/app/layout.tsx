import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { QuoteTray } from "@/components/QuoteTray";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Auto Decoracion G&V",
  description:
    "Accesorios automotrices en Liberia, Guanacaste: venta en el local y bajo pedido, polarizado e instalacion profesional. Cotice por WhatsApp.",
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
        <WhatsAppFloat />
        <Footer />
      </body>
    </html>
  );
}
