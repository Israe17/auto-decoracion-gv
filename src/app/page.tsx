import Link from "next/link";
import {
  ArrowRight,
  Film,
  MessageCircle,
  PackageSearch,
  Speaker,
  Store,
  Truck,
  Wrench
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder } from "@/components/VehicleFinder";
import { fetchPublicCatalog } from "@/lib/store";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function Home() {
  const { products, categories, vehicles } = await fetchPublicCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <HomeShowcase categories={categories} products={products} />

      <section className="section section--tight">
        <div className="benefits">
          <div>
            <Store />
            <strong>Disponible de inmediato</strong>
            <span>Visite nuestro local en Liberia y llévese el producto el mismo día.</span>
          </div>
          <div>
            <Truck />
            <strong>Lo conseguimos por usted</strong>
            <span>Si no está disponible, lo pedimos a nuestros distribuidores de confianza.</span>
          </div>
          <div>
            <Wrench />
            <strong>Instalación profesional</strong>
            <span>Instalamos todo lo que vendemos, con acabado limpio y garantizado.</span>
          </div>
          <div>
            <Film />
            <strong>Polarizado de calidad</strong>
            <span>Protección solar, privacidad y un acabado uniforme para su vehículo.</span>
          </div>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="section__header">
          <div>
            <span className="eyebrow">Servicios</span>
            <h2>Servicio completo en nuestro taller</h2>
          </div>
        </div>
        <div className="service-grid">
          <article className="service-card">
            <Film />
            <h3>Polarizado</h3>
            <p>
              Reduzca el calor, gane privacidad y mejore la apariencia de su
              vehículo con un acabado uniforme y duradero.
            </p>
            <a
              className="button button--secondary"
              href={serviceWhatsAppUrl("polarizado")}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={17} /> Cotizar polarizado
            </a>
          </article>
          <article className="service-card">
            <Speaker />
            <h3>Audio y video</h3>
            <p>
              Pantallas, cámaras de reversa y sistemas de sonido instalados con
              conexiones limpias y seguras.
            </p>
            <a
              className="button button--secondary"
              href={serviceWhatsAppUrl("instalacion de audio y video")}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={17} /> Cotizar instalación
            </a>
          </article>
          <article className="service-card">
            <Wrench />
            <h3>Accesorios y 4x4</h3>
            <p>
              Defensas, estribos, barras LED, racks y suspensión con montaje
              profesional y seguro.
            </p>
            <a
              className="button button--secondary"
              href={serviceWhatsAppUrl("instalacion de accesorios")}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={17} /> Cotizar instalación
            </a>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Categorías</span>
            <h2>Todo para su vehículo en un solo lugar</h2>
          </div>
          <Link href="/catalogo" className="text-link">
            Ver todas <ArrowRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="section section--muted">
        <div className="split">
          <VehicleFinder vehicles={vehicles} />
          <div className="split__copy">
            <span className="eyebrow">Compatibilidad garantizada</span>
            <h2>Confirme la compatibilidad antes de comprar</h2>
            <p>
              Indíquenos la marca, el modelo y el año de su vehículo, y le
              confirmamos que la pieza es la correcta antes de realizar la
              compra.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Destacados</span>
            <h2>Productos destacados de la semana</h2>
          </div>
          <Link href="/catalogo" className="text-link">
            Ir al catalogo <ArrowRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <div className="cta-band">
          <PackageSearch size={34} />
          <div>
            <h2>¿No encontró lo que busca?</h2>
            <p>
              Nuestro catálogo en línea es una selección: en el local hay más
              producto y trabajamos con distribuidores de confianza. Cuéntenos
              qué necesita y le enviamos una cotización.
            </p>
          </div>
          <Link className="button button--primary" href="/contacto">
            Solicitar cotización <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
