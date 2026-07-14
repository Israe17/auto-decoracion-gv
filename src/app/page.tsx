import Link from "next/link";
import {
  ArrowRight,
  Film,
  PackageSearch,
  Store,
  Truck,
  Wrench
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { CompatHero } from "@/components/CompatHero";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { ServicesShowcase } from "@/components/ServicesShowcase";
import { Spotlight } from "@/components/Spotlight";
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
  const mainCategories = topCategories(categories);

  return (
    <>
      <HomeShowcase categories={categories} products={products} promos={promos} />

      <section className="section section--tight">
        <div className="benefits">
          <Spotlight color="rgba(230, 33, 53, 0.14)">
            <Store />
            <strong>Disponible de inmediato</strong>
            <span>Visite nuestro local en Liberia y llévese el producto el mismo día.</span>
          </Spotlight>
          <Spotlight color="rgba(230, 33, 53, 0.14)">
            <Truck />
            <strong>Lo conseguimos por usted</strong>
            <span>Si no está disponible, lo pedimos a nuestros distribuidores de confianza.</span>
          </Spotlight>
          <Spotlight color="rgba(230, 33, 53, 0.14)">
            <Wrench />
            <strong>Instalación profesional</strong>
            <span>Instalamos todo lo que vendemos, con acabado limpio y garantizado.</span>
          </Spotlight>
          <Spotlight color="rgba(230, 33, 53, 0.14)">
            <Film />
            <strong>Polarizado de calidad</strong>
            <span>Protección solar, privacidad y un acabado uniforme para su vehículo.</span>
          </Spotlight>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="section__header">
          <div>
            <span className="eyebrow">Servicios</span>
            <h2>Servicio completo en nuestro taller</h2>
          </div>
        </div>
        <ServicesShowcase />
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
