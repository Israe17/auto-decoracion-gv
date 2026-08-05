import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  MessageCircle,
  Puzzle,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  Wrench
} from "lucide-react";
import {
  products as seedProducts,
  complementsOf,
  estadoDelProducto,
  formatCRC
} from "@/lib/catalog";
import { isProductFeaturedActive } from "@/lib/featured";
import { fetchPublicCatalog } from "@/lib/store";
import { siteUrl } from "@/lib/seo";
import { ProductActions } from "@/components/ProductActions";
import { ProductQuoteLink } from "@/components/ProductQuoteLink";
import { ProductPhotos } from "@/components/ProductPhotos";
import { ProductCard } from "@/components/ProductCard";

const availabilityMap = {
  available: "https://schema.org/InStock",
  on_request: "https://schema.org/BackOrder",
  sold_out: "https://schema.org/OutOfStock"
} as const;

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

  const title = `${product.name} | Auto Decoracion G&V`;

  return {
    title,
    description: product.description,
    openGraph: {
      type: "website",
      title,
      description: product.description,
      images: product.images.map((image) => ({ url: image }))
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
      images: product.images
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await fetchPublicCatalog();
  const product = products.find((item) => item.slug === slug);

  if (!product) notFound();

  // Extras que se venden aparte pero acompañan a este producto, y el
  // producto principal cuando la ficha abierta es la de un complemento.
  const complementos = complementsOf(products, product.id);
  const padre = product.parentProductId
    ? products.find((item) => item.id === product.parentProductId)
    : undefined;

  // Los complementos y el padre ya tienen su propio lugar en la pagina:
  // repetirlos aqui seria mostrar el mismo producto dos veces.
  const yaEnLaPagina = new Set([
    product.id,
    ...complementos.map((item) => item.id),
    ...(padre ? [padre.id] : [])
  ]);

  const related = products
    .filter((item) => !yaEnLaPagina.has(item.id) && item.categorySlug === product.categorySlug)
    .concat(products.filter((item) => !yaEnLaPagina.has(item.id) && isProductFeaturedActive(item)))
    .filter((item, index, list) => list.findIndex((match) => match.id === item.id) === index)
    .slice(0, 4);

  const estado = estadoDelProducto(product);

  const discount =
    product.oldPrice && product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : 0;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    url: `${siteUrl}/productos/${product.slug}`,
    ...(product.brandName
      ? {
          brand: {
            "@type": "Brand",
            name: product.brandName
          }
        }
      : {}),
    ...(product.saleMode === "price_quote" && product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "CRC",
            price: product.price,
            availability: availabilityMap[product.status],
            url: `${siteUrl}/productos/${product.slug}`
          }
        }
      : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <section className="product-detail-hero">
        <Link href="/catalogo" className="text-link product-detail__back">
          <ArrowLeft size={18} /> Volver al catalogo
        </Link>

        <div className="product-detail__grid">
          <ProductPhotos images={product.images} name={product.name} discount={discount} />

          <div className="product-info">
            <div className="product-info__topline">
              <span className="eyebrow">
                <Tag size={14} aria-hidden="true" />
                {product.categoryName}
              </span>
              {product.brandName && (
                <span className="product-status product-status--own-brand">
                  <BadgeCheck size={14} aria-hidden="true" />
                  {product.isOwnBrand ? "G&V System" : product.brandName}
                </span>
              )}
              {/* Mismo indicador discreto que la tarjeta: punto de color y
                  texto, sin fondo ni sombra. El label verde macizo cargaba
                  la fila junto a los de categoria y marca. */}
              <span
                className={`estado-punto estado-punto--${estado.tono} product-info__estado`}
              >
                <span className="estado-punto__punto" aria-hidden="true" />
                {estado.label}
              </span>
            </div>

            <h1>{product.name}</h1>
            <p>{product.description}</p>

            {padre && (
              <Link
                href={`/productos/${padre.slug}`}
                className="text-link product-info__padre"
              >
                <Puzzle size={16} aria-hidden="true" /> Complemento de {padre.name}
              </Link>
            )}

            <div className="product-price-hero">
              {product.oldPrice && <del>{formatCRC(product.oldPrice)}</del>}
              <strong>
                {product.saleMode === "price_quote"
                  ? formatCRC(product.price)
                  : "Consultar precio"}
              </strong>
              {product.oldPrice && product.price && (
                <span className="price-chip--save">
                  Ahorra {formatCRC(product.oldPrice - product.price)}
                </span>
              )}
            </div>
            {product.saleMode === "quote_only" && (
              <p className="product-price-note">
                El precio depende del modelo y la versión de su vehículo.
              </p>
            )}

            <ProductActions product={product} compact />

            <div className="product-info__meta">
              <span>
                <Wrench size={15} /> Instalación en taller
              </span>
              <span>
                <Truck size={15} /> Bajo pedido disponible
              </span>
              <span>
                <MessageCircle size={15} /> Respuesta en minutos
              </span>
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
              Díganos su marca, modelo y año. Le confirmamos precio,
              disponibilidad e instalación en un solo mensaje.
            </p>
            <ProductQuoteLink product={product}>
              <MessageCircle size={18} /> Cotizar este producto
            </ProductQuoteLink>
          </div>
        </div>
      </section>

      {complementos.length > 0 && (
        <section className="section section--tight">
          <div className="section-head section-head--left">
            <div>
              <span className="section-head__pill">
                <Puzzle size={14} /> Complementos
              </span>
              {/* El nombre del producto NO va en el titular: la barra del
                  degradado se dibuja bajo el <em> y con un nombre largo
                  ocupa dos renglones enteros. */}
              <h2>
                Complete su <em>equipo.</em>
              </h2>
              <p className="section-head__nota">
                Accesorios que acompañan este producto. Se cotizan y se compran por
                separado.
              </p>
            </div>
          </div>
          <div className="product-grid">
            {complementos.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section section--tight">
          <div className="section-head section-head--left">
            <div>
              <span className="section-head__pill">
                <Sparkles size={14} /> También le puede servir
              </span>
              <h2>
                Productos <em>relacionados.</em>
              </h2>
            </div>
            <Link href="/catalogo" className="text-link">
              Ver catálogo completo <ArrowRight size={18} />
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
