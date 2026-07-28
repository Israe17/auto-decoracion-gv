import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  LayoutGrid,
  PackageSearch,
  Sparkles,
  Wrench
} from "lucide-react";
import { CategoryShowcase } from "@/components/CategoryShowcase";
import { CompatHero } from "@/components/CompatHero";
import { HeroShell } from "@/components/HeroShell";
import { HomeShowcase } from "@/components/HomeShowcase";
import { VehicleFinder } from "@/components/VehicleFinder";
import { ProductCard } from "@/components/ProductCard";
import { WorkshopTimeline } from "@/components/WorkshopTimeline";
import { formatCRC, topCategories } from "@/lib/catalog";
import { selectActiveFeaturedProducts } from "@/lib/featured";
import { fetchPublicCatalog } from "@/lib/store";

export const revalidate = 60;

export default async function Home() {
  const { products, categories, vehicles, promos } = await fetchPublicCatalog();
  const featured = selectActiveFeaturedProducts(products, 8);
  const showcaseProducts = featured.length
    ? featured
    : products.filter((product) => product.status !== "sold_out").slice(0, 8);
  const ownBrandProducts = products
    .filter((product) => product.isOwnBrand && product.status !== "sold_out")
    .slice(0, 8);
  // Oferta real de la linea propia: el producto de la marca con mayor
  // descuento vigente (precio rebajado). El panel promocional lo anuncia
  // con su porcentaje calculado; sin ofertas cae al mensaje de marca.
  const ownOffer =
    ownBrandProducts
      .filter(
        (product) =>
          product.oldPrice && product.price && product.oldPrice > product.price
      )
      .sort(
        (a, b) =>
          (b.oldPrice ?? 0) - (b.price ?? 0) - ((a.oldPrice ?? 0) - (a.price ?? 0))
      )[0] ?? null;
  const ownOfferDiscount = ownOffer?.oldPrice
    ? Math.round((1 - (ownOffer.price ?? 0) / ownOffer.oldPrice) * 100)
    : 0;
  const mainCategories = topCategories(categories);

  return (
    <>
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
        <CategoryShowcase categories={mainCategories} />
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
          <div className="own-brand-showcase">
            <aside className="own-panel glare-host">
              <span className="glare" aria-hidden="true" />
              <span className="own-panel__eyebrow">
                {ownOffer ? "Oferta de la línea" : "Línea propia"}
              </span>
              <h3>{ownOffer ? ownOffer.name : "Diseñadas para su vehículo"}</h3>
              <p>
                {ownOffer
                  ? `Antes ${formatCRC(ownOffer.oldPrice)} — ahora ${formatCRC(
                      ownOffer.price
                    )}. Ahorre ${formatCRC(
                      (ownOffer.oldPrice ?? 0) - (ownOffer.price ?? 0)
                    )}.`
                  : "Alfombras y accesorios de nuestra línea, con ajuste perfecto e instalación en el taller."}
              </p>
              <Link
                className="own-panel__cta"
                href={
                  ownOffer
                    ? `/productos/${ownOffer.slug}`
                    : "/catalogo?linea=propia"
                }
              >
                {ownOffer ? "Ver la oferta" : "Ver línea completa"}{" "}
                <ArrowRight size={17} />
              </Link>
              <span className="own-panel__seal" aria-hidden="true">
                {ownOffer && ownOfferDiscount > 0 ? (
                  `−${ownOfferDiscount}%`
                ) : (
                  <>
                    Desde
                    <br />
                    2008
                  </>
                )}
              </span>
            </aside>
            <div className="product-rail">
              {ownBrandProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section--tight">
        <CompatHero>
          <VehicleFinder vehicles={vehicles} />
        </CompatHero>
      </section>

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
        <div className="product-rail">
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

      <HeroShell
        productsCount={products.length}
        categoriesCount={mainCategories.length}
        years={new Date().getFullYear() - 2008}
      />
    </>
  );
}
