import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench
} from "lucide-react";
import { products as seedProducts, formatCRC } from "@/lib/catalog";
import { fetchPublicCatalog } from "@/lib/store";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import { ProductActions } from "@/components/ProductActions";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 60;

export function generateStaticParams() {
  return seedProducts.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await fetchPublicCatalog();
  const product = products.find((item) => item.slug === slug);

  if (!product) {
    return {
      title: "Producto no encontrado"
    };
  }

  return {
    title: `${product.name} | Auto Decoracion G&V`,
    description: product.description
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await fetchPublicCatalog();
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  const related = products
    .filter(
      (item) => item.id !== product.id && item.categorySlug === product.categorySlug
    )
    .concat(products.filter((item) => item.id !== product.id && item.featured))
    .filter((item, index, list) => list.findIndex((match) => match.id === item.id) === index)
    .slice(0, 4);

  const statusLabel =
    product.status === "available"
      ? "Disponible"
      : product.status === "on_request"
        ? "Bajo pedido"
        : "Agotado";

  return (
    <>
      <section className="product-detail-hero">
        <Link href="/catalogo" className="text-link product-detail__back">
          <ArrowLeft size={18} /> Volver al catalogo
        </Link>

        <div className="product-detail__grid">
          <div className="product-gallery">
            <div className="product-gallery__main">
              {product.oldPrice && <span className="badge">Oferta</span>}
              <img src={product.images[0]} alt={product.name} />
            </div>
            {product.images.length > 1 && (
              <div className="product-gallery__thumbs" aria-label="Imagenes del producto">
                {product.images.map((image, index) => (
                  <span key={`${image}-${index}`}>
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <div className="product-info__topline">
              <span className="eyebrow">{product.categoryName}</span>
              <span className="product-status">{statusLabel}</span>
            </div>

            <h1>{product.name}</h1>
            <p>{product.description}</p>

            <div className="product-info__price-card">
              <div className="product-info__price-card-top">
                <span>
                  {product.saleMode === "price_quote" ? "Precio de referencia" : "Cotizacion"}
                </span>
                {product.oldPrice && product.price && (
                  <span className="price-card__badge">
                    Oferta −{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                )}
              </div>
              <div>
                {product.oldPrice && <del>{formatCRC(product.oldPrice)}</del>}
                <strong>
                  {product.saleMode === "price_quote"
                    ? formatCRC(product.price)
                    : "Consultar precio"}
                </strong>
              </div>
            </div>

            <ProductActions product={product} />

            <div className="detail-list">
              <div>
                <MessageCircle size={18} />
                <span>Cotización por WhatsApp en minutos</span>
              </div>
              <div>
                <Wrench size={18} />
                <span>Instalación profesional en nuestro taller de Liberia</span>
              </div>
              <div>
                <Truck size={18} />
                <span>Disponible bajo pedido con distribuidores de confianza</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section product-detail-content">
        <div className="product-detail-panel">
          <div className="product-detail-panel__block">
            <div className="product-detail-card__title">
              <ShieldCheck size={20} />
              <strong>Compatibilidad</strong>
            </div>
            {product.compatibilityMode === "universal" ? (
              <p>
                Producto universal o adaptable a varios vehículos. Recomendamos
                confirmar medidas o versión antes de instalar.
              </p>
            ) : (
              <ul>
                {product.vehicles.map((vehicle) => (
                  <li key={`${vehicle.make}-${vehicle.model}`}>
                    <CheckCircle2 size={17} />
                    <span>
                      {vehicle.make} {vehicle.model}{" "}
                      {vehicle.fromYear && vehicle.toYear
                        ? `${vehicle.fromYear}-${vehicle.toYear}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-panel__block product-detail-panel__block--tip">
            <div className="product-detail-card__title">
              <Sparkles size={20} />
              <strong>Cotice este producto para su vehículo</strong>
            </div>
            <p>
              Envíenos la marca, el modelo, el año y la versión de su vehículo.
              Le confirmamos precio, disponibilidad e instalación de este
              producto en un solo mensaje.
            </p>
            <a
              className="button button--primary"
              href={productWhatsAppUrl(product)}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={18} /> Cotizar este producto
            </a>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--tight">
          <div className="section__header">
            <div>
              <span className="eyebrow">Tambien le puede servir</span>
              <h2>Productos relacionados</h2>
            </div>
            <Link href="/catalogo" className="text-link">
              Ver catalogo completo
            </Link>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
