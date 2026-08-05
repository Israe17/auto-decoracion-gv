"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgePercent, Sparkles } from "lucide-react";
import gsap from "gsap";
import { encuadreDe, estadoDelProducto, formatCRC } from "@/lib/catalog";
import { Product } from "@/types";
import { ProductActions } from "./ProductActions";

export function ProductCard({
  product,
  ocultarCategoria = false
}: {
  product: Product;
  // La categoría ya se sabe por el título de la sección o por el filtro
  // activo (página de categoría, catálogo filtrado a una hoja): repetirla en
  // cada tarjeta solo carga la vista.
  ocultarCategoria?: boolean;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const estado = estadoDelProducto(product);

  // UNA sola etiqueta descriptiva bajo la foto, por orden de importancia:
  // ser el extra de otro producto cambia cómo se lee el producto entero; la
  // categoría solo cuando no se sabe ya por el contexto; la marca al final,
  // que es la que más se adivina por la foto y el nombre.
  const etiqueta = product.parentProductName
    ? { texto: "Complemento", detalle: `Complemento de ${product.parentProductName}` }
    : !ocultarCategoria
      ? { texto: product.categoryName, detalle: undefined }
      : product.brandName
        ? {
            texto: product.isOwnBrand ? "G&V System" : product.brandName,
            detalle: undefined
          }
        : null;

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = card.getBoundingClientRect();
    const isAlreadyVisible = bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0;
    if (isAlreadyVisible) return;

    let observer!: IntersectionObserver;
    const ctx = gsap.context(() => {
      gsap.set(card, { autoAlpha: 0, y: 24 });
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          gsap.to(card, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" });
        },
        { rootMargin: "0px 0px -12% 0px" }
      );
      observer.observe(card);
    }, card);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <article ref={cardRef} className="product-card">
      <Link href={`/productos/${product.slug}`} className="product-card__image">
        {/* Sobre la foto solo va lo que de verdad interrumpe: oferta o
            destacado. La disponibilidad bajó al cuerpo como indicador
            discreto. */}
        {(product.oldPrice || product.featured) && (
          <span className={`badge badge--${product.oldPrice ? "offer" : "featured"}`}>
            {product.oldPrice ? (
              <BadgePercent size={14} aria-hidden="true" />
            ) : (
              <Sparkles size={14} aria-hidden="true" />
            )}
            {product.oldPrice ? "Oferta" : "Destacado"}
          </span>
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 300px"
          /* La foto se guarda entera: el encuadre elegido en el panel se
             aplica aquí, no recortando el archivo. */
          style={{ objectPosition: encuadreDe(product, product.images[0]) }}
        />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          {etiqueta && (
            // El `title` lleva siempre el texto completo: en la tarjeta de
            // movil un nombre de categoria largo se corta con puntos
            // suspensivos, y asi el dato no se pierde.
            <span
              className="product-card__etiqueta"
              title={etiqueta.detalle ?? etiqueta.texto}
            >
              {etiqueta.texto}
            </span>
          )}
        </div>
        <Link href={`/productos/${product.slug}`} className="product-card__title">
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card__purchase">
          <div className="price-row">
            {product.oldPrice && <del>{formatCRC(product.oldPrice)}</del>}
            <strong>
              {product.saleMode === "price_quote" ? formatCRC(product.price) : "Consultar precio"}
            </strong>
          </div>
          {/* La disponibilidad va junto al precio, no en la fila de la
              etiqueta: en la tarjeta de movil (~170px) las dos cosas no
              caben en un renglon y el nombre de la categoria salia
              cortado. */}
          <span
            className={`estado-punto estado-punto--${estado.tono} product-card__estado`}
          >
            <span className="estado-punto__punto" aria-hidden="true" />
            {estado.label}
          </span>
        </div>
        <ProductActions product={product} compact />
      </div>
    </article>
  );
}
