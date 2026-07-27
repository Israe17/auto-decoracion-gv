import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LayoutGrid,
  PackageSearch,
  Sparkles,
  Wrench
} from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { HeroShell } from "@/components/HeroShell";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { WorkshopTimeline } from "@/components/WorkshopTimeline";
import { topCategories } from "@/lib/catalog";
import { selectActiveFeaturedProducts } from "@/lib/featured";
import { fetchPublicCatalog } from "@/lib/store";

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
      <HeroShell vehicles={vehicles} />

      <HomeShowcase categories={categories} products={products} promos={promos} />

      <section className="section" id="servicios">
        <div className="section-head">
          <span className="section-head__pill">
            <Wrench size={14} /> Taller propio
          </span>
          <h2>
            Compre y salga con todo <em>instalado.</em>
          </h2>
          <ul className="workshop-panel__trust">
            <li>En el local hoy mismo</li>
            <li>Instalación con garantía</li>
            <li>Si no está, se lo conseguimos</li>
          </ul>
        </div>
        <WorkshopTimeline />
      </section>

      <section className="section">
        <div className="section-head section-head--left">
          <div>
            <span className="section-head__pill">
              <LayoutGrid size={14} /> Categorías
            </span>
            <h2>
              Todo para su vehículo en un solo <em>lugar.</em>
            </h2>
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
          <div className="section-head section-head--left">
            <div>
              <span className="section-head__pill">
                <BadgeCheck size={14} /> Línea propia
              </span>
              <h2>
                Productos <em>G&amp;V System.</em>
              </h2>
            </div>
            <Link href="/catalogo?linea=propia" className="text-link">
              Ver línea completa <ArrowRight size={18} />
            </Link>
          </div>
          <div className="product-grid">
            {ownBrandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head section-head--left">
          <div>
            <span className="section-head__pill">
              <Sparkles size={14} /> Destacados
            </span>
            <h2>
              {featured.length ? (
                <>
                  Productos destacados de la <em>semana.</em>
                </>
              ) : (
                <>
                  Productos <em>recomendados.</em>
                </>
              )}
            </h2>
          </div>
          <Link href="/catalogo" className="text-link">
            Ir al catálogo <ArrowRight size={18} />
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
