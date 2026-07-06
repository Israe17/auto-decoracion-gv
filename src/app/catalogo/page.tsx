import { Suspense } from "react";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { CategoryCard } from "@/components/CategoryCard";
import { fetchPublicCatalog } from "@/lib/store";

export const revalidate = 60;

export default async function CatalogPage() {
  const { products, categories, vehicles } = await fetchPublicCatalog();

  return (
    <>
      <section className="page-hero page-hero--catalog">
        <span className="eyebrow">Catálogo G&V</span>
        <h1>Explore el catálogo y cotice por WhatsApp</h1>
        <p>
          Filtre por su vehículo y vea solo lo que le sirve. Si no encuentra lo
          que busca, <a href="/contacto">cuéntenos qué necesita</a> y lo
          conseguimos por usted.
        </p>
      </section>

      <section className="section section--tight">
        <Suspense fallback={null}>
          <CatalogExplorer
            products={products}
            categories={categories}
            vehicles={vehicles}
          />
        </Suspense>
      </section>

      <section className="section" id="categorias">
        <div className="section__header">
          <div>
            <span className="eyebrow">Categorías completas</span>
            <h2>Líneas de producto</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </>
  );
}
