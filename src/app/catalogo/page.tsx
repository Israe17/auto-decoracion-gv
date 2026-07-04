import { SlidersHorizontal } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder } from "@/components/VehicleFinder";
import { fetchPublicCatalog } from "@/lib/store";

export const revalidate = 60;

export default async function CatalogPage() {
  const { products, categories } = await fetchPublicCatalog();

  return (
    <>
      <section className="page-hero page-hero--catalog">
        <span className="eyebrow">Catálogo G&V</span>
        <h1>Seleccione, revise compatibilidad y cotice por WhatsApp</h1>
        <p>
          Producto disponible en el local o bajo pedido con nuestros
          distribuidores de confianza. Si no lo ve aquí,{" "}
          <a href="/contacto">cuéntenos qué busca</a> y se lo conseguimos.
        </p>
      </section>

      <section className="section section--tight">
        <div className="catalog-layout">
          <aside className="filters">
            <div className="filters__title">
              <SlidersHorizontal size={18} />
              Filtros
            </div>
            <VehicleFinder compact />
            <div className="filter-block">
              <strong>Modo de venta</strong>
              <label>
                <input type="checkbox" defaultChecked /> Precio + cotizar
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Solo cotizar
              </label>
            </div>
            <div className="filter-block">
              <strong>Estado</strong>
              <label>
                <input type="checkbox" defaultChecked /> Disponible
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Bajo pedido
              </label>
            </div>
          </aside>
          <div>
            <div className="catalog-toolbar">
              <span>Mostrando {products.length} producto(s)</span>
              <span>Orden: destacados primero</span>
            </div>
            <div className="product-grid product-grid--catalog">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="categorias">
        <div className="section__header">
          <div>
            <span className="eyebrow">Categorias completas</span>
            <h2>Lineas de producto</h2>
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
