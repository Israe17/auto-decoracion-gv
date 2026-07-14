"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import gsap from "gsap";
import { formatCRC } from "@/lib/catalog";
import { Product } from "@/types";
import { ProductActions } from "./ProductActions";

export function ProductCard({ product }: { product: Product }) {
  const cardRef = useRef<HTMLElement>(null);

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
          <span className="badge">{product.oldPrice ? "Oferta" : "Destacado"}</span>
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 300px"
        />
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        {product.isOwnBrand && <span className="product-card__brand">G&amp;V System</span>}
        <Link href={`/productos/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price-row">
          {product.oldPrice && <del>{formatCRC(product.oldPrice)}</del>}
          <strong>
            {product.saleMode === "price_quote" ? formatCRC(product.price) : "Consultar precio"}
          </strong>
        </div>
        <div className="stock-row">
          <PackageCheck size={16} />
          {product.status === "available" ? "Disponible" : "Bajo pedido"}
        </div>
        <ProductActions product={product} />
      </div>
    </article>
  );
}
