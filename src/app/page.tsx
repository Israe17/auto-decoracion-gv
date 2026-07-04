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
  const { products, categories } = await fetchPublicCatalog();
  const featured = products.filter((product) => product.featured).slice(0, 4);

  return (
    <>
      <HomeShowcase categories={categories} products={products} />

      <section className="section section--tight">
        <div className="benefits">
          <div>
            <Store />
            <strong>Producto en el local</strong>
            <span>Inventario real en Liberia, listo para llevar.</span>
          </div>
          <div>
            <Truck />
            <strong>Bajo pedido de confianza</strong>
            <span>Lo que no esté en stock lo pedimos a nuestros distribuidores.</span>
          </div>
          <div>
            <Wrench />
            <strong>Instalación en el taller</strong>
            <span>Instalamos todo lo que vendemos, de audio a defensas.</span>
          </div>
          <div>
            <Film />
            <strong>Polarizado profesional</strong>
            <span>Protección solar y privacidad para su vehículo.</span>
          </div>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="section__header">
          <div>
            <span className="eyebrow">Servicios en el taller</span>
            <h2>No solo vendemos: instalamos y polarizamos</h2>
          </div>
        </div>
        <div className="service-grid">
          <article className="service-card">
            <Film />
            <h3>Polarizado</h3>
            <p>
              Polarizado profesional para todo tipo de vehículo: protección
              solar, privacidad y mejor apariencia.
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
              Instalación de pantallas, cámaras de reversa, parlantes y
              sistemas de sonido, con conexión limpia y garantizada.
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
              Montaje de defensas, estribos, barras LED, racks, suspensión y
              todo accesorio que compre con nosotros.
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

      <section className="section section--tight">
        <div className="cta-band">
          <PackageSearch size={34} />
          <div>
            <h2>¿No encontró lo que busca?</h2>
            <p>
              El catálogo en línea es solo una parte: en el local hay mucho más,
              y lo que no tengamos lo conseguimos con nuestros distribuidores de
              confianza.
            </p>
          </div>
          <Link className="button button--primary" href="/contacto">
            Cuéntenos qué necesita <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
