"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock3, PackageCheck, PackageX } from "lucide-react";
import gsap from "gsap";
import { formatCRC } from "@/lib/catalog";
import { Product } from "@/types";
import { ProductActions } from "./ProductActions";

export function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLElement>(null);
  const discount =
    product.oldPrice && product.price && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  const status =
    product.status === "available"
      ? { label: "Disponible", className: "available", Icon: PackageCheck }
      : product.status === "sold_out"
        ? { label: "Agotado", className: "sold-out", Icon: PackageX }
        : { label: "Bajo pedido", className: "on-request", Icon: Clock3 };
  const StatusIcon = status.Icon;

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
        {(product.oldPrice || product.featured) && (
          <span className={`badge badge--${product.oldPrice ? "offer" : "featured"}`}>
            {product.oldPrice ? (discount ? `-${discount}%` : "Oferta") : "Destacado"}
          </span>
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 300px"
        />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span className="product-card__category">{product.categoryName}</span>
          {product.brandName && (
            <span className="product-card__brand">
              {product.isOwnBrand ? "G&V System" : product.brandName}
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
          <div className={`stock-row stock-row--${status.className}`}>
            <StatusIcon size={15} />
            {status.label}
          </div>
        </div>
        <ProductActions product={product} compact />
      </div>
    </article>
  );
}
