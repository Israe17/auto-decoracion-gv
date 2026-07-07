import Link from "next/link";
import {
  ArrowRight,
  Film,
  MessageCircle,
  PackageSearch,
  Speaker,
  Wrench
} from "lucide-react";
import { BenefitsShowcase } from "@/components/BenefitsShowcase";
import { CategoryCard } from "@/components/CategoryCard";
import { CompatHero } from "@/components/CompatHero";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder } from "@/components/VehicleFinder";
import { topCategories } from "@/lib/catalog";
import { fetchPublicCatalog } from "@/lib/store";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function Home() {
  const { products, categories, vehicles, promos } = await fetchPublicCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 4);
  const mainCategories = topCategories(categories);

  return (
    <>
      <HomeShowcase categories={categories} products={products} promos={promos} />

      <section className="section section--tight">
        <BenefitsShowcase />
      </section>

      <section className="section" id="servicios">
        <div className="section__header">
          <div>
            <span className="eyebrow">Servicios</span>
            <h2>Servicio completo en nuestro taller</h2>
          </div>
        </div>
        <div className="service-grid">
          <article className="service-card glare-host">
            <span className="glare" aria-hidden="true" />
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
          <article className="service-card glare-host">
            <span className="glare" aria-hidden="true" />
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
          <article className="service-card glare-host">
            <span className="glare" aria-hidden="true" />
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
          {mainCategories.slice(0, 6).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <CompatHero>
          <VehicleFinder vehicles={vehicles} />
        </CompatHero>
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
        <div className="cta-band glare-host">
          <span className="glare" aria-hidden="true" />
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
