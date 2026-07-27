import Link from "next/link";
import {
  ArrowRight,
  Film,
  MessageCircle,
  PackageSearch,
  Speaker,
  Wrench
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { CompatHero } from "@/components/CompatHero";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder } from "@/components/VehicleFinder";
import { topCategories } from "@/lib/catalog";
import { selectActiveFeaturedProducts } from "@/lib/featured";
import { fetchPublicCatalog } from "@/lib/store";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function Home() {
  const { products, categories, vehicles, promos } = await fetchPublicCatalog();
  const featured = selectActiveFeaturedProducts(products, 4);
  const showcaseProducts = featured.length
    ? featured
    : products.filter((product) => product.status !== "sold_out").slice(0, 4);
  const ownBrandProducts = products
    .filter((product) => product.isOwnBrand && product.status !== "sold_out")
    .slice(0, 4);
  const mainCategories = topCategories(categories);

  return (
    <>
      <HomeShowcase categories={categories} products={products} promos={promos} />

      <section className="section" id="servicios">
        <div className="workshop-panel glare-host">
          <span className="glare" aria-hidden="true" />
          <div className="workshop-panel__intro">
            <span className="eyebrow">Taller propio</span>
            <h2>Compre y salga con todo instalado</h2>
            <p>
              Polarizado, audio y accesorios con acabado garantizado, en
              Liberia desde 2008.
            </p>
            <a
              className="button button--primary"
              href={serviceWhatsAppUrl("servicios del taller")}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={18} /> Cotizar por WhatsApp
            </a>
            <ul className="workshop-panel__trust">
              <li>En el local hoy mismo</li>
              <li>Instalación con garantía</li>
              <li>Si no está, se lo conseguimos</li>
            </ul>
          </div>
          <div className="workshop-panel__services">
            <a
              className="workshop-tile"
              href={serviceWhatsAppUrl("polarizado")}
              target="_blank"
              rel="noopener"
            >
              <span className="workshop-tile__icon"><Film /></span>
              <strong>Polarizado</strong>
              <span>Menos calor, más privacidad</span>
            </a>
            <a
              className="workshop-tile"
              href={serviceWhatsAppUrl("instalacion de audio y video")}
              target="_blank"
              rel="noopener"
            >
              <span className="workshop-tile__icon"><Speaker /></span>
              <strong>Audio y video</strong>
              <span>Pantallas, cámaras y sonido</span>
            </a>
            <a
              className="workshop-tile"
              href={serviceWhatsAppUrl("instalacion de accesorios")}
              target="_blank"
              rel="noopener"
            >
              <span className="workshop-tile__icon"><Wrench /></span>
              <strong>Accesorios y 4x4</strong>
              <span>Defensas, LED, racks y suspensión</span>
            </a>
            <a
              className="workshop-tile"
              href={serviceWhatsAppUrl("conseguir un repuesto o pieza")}
              target="_blank"
              rel="noopener"
            >
              <span className="workshop-tile__icon"><PackageSearch /></span>
              <strong>Repuestos y piezas</strong>
              <span>Se los conseguimos por usted</span>
            </a>
          </div>
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

      {ownBrandProducts.length > 0 && (
        <section className="section section--own-brand">
          <div className="section__header">
            <div>
              <span className="eyebrow">Linea propia</span>
              <h2>Productos G&amp;V System</h2>
            </div>
            <Link href="/catalogo?linea=propia" className="text-link">
              Ver linea completa <ArrowRight size={18} />
            </Link>
          </div>
          <div className="product-grid">
            {ownBrandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="section section--tight">
        <CompatHero>
          <VehicleFinder vehicles={vehicles} />
        </CompatHero>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Destacados</span>
            <h2>{featured.length ? "Productos destacados de la semana" : "Productos recomendados"}</h2>
          </div>
          <Link href="/catalogo" className="text-link">
            Ir al catalogo <ArrowRight size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {showcaseProducts.map((product) => (
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
