import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { HomeShowcase } from "@/components/HomeShowcase";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder } from "@/components/VehicleFinder";
import { fetchPublicCatalog } from "@/lib/store";

export const revalidate = 60;

export default async function Home() {
  const { products, categories } = await fetchPublicCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <HomeShowcase categories={categories} products={products} />

      <section className="section section--tight">
        <div className="benefits">
          <div>
            <Wrench />
            <strong>Instalacion disponible</strong>
            <span>Le ayudamos a dejarlo listo.</span>
          </div>
          <div>
            <MessageCircle />
            <strong>Cotizacion por WhatsApp</strong>
            <span>Un solo numero para todo el negocio.</span>
          </div>
          <div>
            <ShieldCheck />
            <strong>Compatibilidad por vehiculo</strong>
            <span>Universal o por marca, modelo y ano.</span>
          </div>
          <div>
            <CheckCircle2 />
            <strong>Precio o solo cotizar</strong>
            <span>Cada producto se maneja como convenga.</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Categorias</span>
            <h2>Todo para equipar su vehiculo</h2>
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
          <VehicleFinder />
          <div className="split__copy">
            <span className="eyebrow">Filtro inteligente</span>
            <h2>Universal o compatible con un vehiculo especifico</h2>
            <p>
              Los productos pueden aparecer para muchos carros o para modelos
              concretos como Hilux, Frontier o Fortuner. Asi el cliente cotiza
              con informacion clara desde el inicio.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Destacados</span>
            <h2>Productos listos para cotizar</h2>
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
    </>
  );
}
