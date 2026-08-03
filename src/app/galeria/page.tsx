import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Images, MessageCircle } from "lucide-react";
import { GalleryMasonry } from "@/components/GalleryMasonry";
import { fetchGallery } from "@/lib/store";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Galería de trabajos | Auto Decoración G&V",
  description:
    "Instalaciones, polarizados y accesorios montados en nuestro taller de Liberia, Guanacaste. Vea trabajos reales antes de cotizar."
};

export const revalidate = 60;

export default async function GalleryPage() {
  const items = await fetchGallery();

  return (
    <>
      {/* Portada de la galeria: solo el titulo sobre la foto. Las fotos del
          taller hablan por si solas; el label y el parrafo sobraban. */}
      <section className="page-hero page-hero--gallery">
        <h1>Trabajos hechos en nuestro taller</h1>
      </section>

      <section className="section section--tight galeria-seccion">
        {items.length > 0 ? (
          <GalleryMasonry items={items} />
        ) : (
          <div className="notice notice--empty">
            <Images size={26} />
            <div>
              <strong>Estamos preparando la galería</strong>
              <p>
                Muy pronto verá aquí los trabajos del taller. Mientras tanto,
                cuéntenos qué necesita y le cotizamos.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="section section--tight galeria-cierre">
        <div className="cta-band glare-host">
          <span className="glare" aria-hidden="true" />
          <MessageCircle size={34} />
          <div>
            <h2>¿Quiere algo así en su vehículo?</h2>
            <p>
              Díganos qué vio y para cuál vehículo: le confirmamos precio,
              disponibilidad e instalación en un solo mensaje.
            </p>
          </div>
          <a
            className="button button--primary"
            href={generalWhatsAppUrl()}
            target="_blank"
            rel="noopener"
          >
            Cotizar por WhatsApp <ArrowRight size={18} />
          </a>
        </div>
        <p className="galeria-cierre__extra">
          <Link className="text-link" href="/catalogo">
            Ver el catálogo completo <ArrowRight size={18} />
          </Link>
        </p>
      </section>
    </>
  );
}
