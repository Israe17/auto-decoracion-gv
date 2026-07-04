"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PackageSearch,
  Sparkles
} from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import { Category, Product } from "@/types";

export function HomeShowcase({
  categories,
  products
}: {
  categories: Category[];
  products: Product[];
}) {
  const slides = products.filter((product) => product.featured).slice(0, 4);
  const [activeSlide, setActiveSlide] = useState(0);
  const [openCategory, setOpenCategory] = useState(
    () =>
      categories.find((category) =>
        products.some((product) => product.categorySlug === category.slug)
      )?.slug ||
      categories[0]?.slug ||
      ""
  );
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const categoryCounts = useMemo(
    () =>
      categories.reduce<Record<string, number>>((acc, category) => {
        acc[category.slug] = products.filter(
          (product) => product.categorySlug === category.slug
        ).length;
        return acc;
      }, {}),
    [categories, products]
  );

  const activeProduct = slides[activeSlide] || products[0];

  function moveSlide(direction: number) {
    if (!slides.length) return;
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  if (!activeProduct) return null;

  return (
    <section className="home-showcase" aria-label="Catalogo destacado">
      <aside className="category-accordion">
        <div className="category-accordion__title">
          <PackageSearch size={20} />
          <span>Todas las categorias</span>
        </div>

        <div className="category-accordion__list">
          {categories.slice(0, 9).map((category) => {
            const isOpen = openCategory === category.slug;

            return (
              <div className="category-accordion__item" key={category.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenCategory(isOpen ? "" : category.slug)}
                >
                  <span>{category.name}</span>
                  <ChevronDown size={17} />
                </button>

                <div className="category-accordion__panel" hidden={!isOpen}>
                  <p>{category.description}</p>
                  <div>
                    <span>
                      {categoryCounts[category.slug]
                        ? `${categoryCounts[category.slug]} producto(s)`
                        : "Linea de catalogo"}
                    </span>
                    <Link href={`/catalogo?categoria=${category.slug}`}>
                      Ver categoria <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Link className="category-accordion__more" href="/catalogo#categorias">
          Ver todas las lineas <ArrowRight size={16} />
        </Link>
      </aside>

      <div className="home-carousel">
        <div className="home-carousel__media">
          <img src={activeProduct.images[0]} alt={activeProduct.name} />
        </div>
        <div className="home-carousel__shade" />

        <button
          className="home-carousel__arrow home-carousel__arrow--left"
          type="button"
          aria-label="Producto anterior"
          onClick={() => moveSlide(-1)}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="home-carousel__arrow home-carousel__arrow--right"
          type="button"
          aria-label="Producto siguiente"
          onClick={() => moveSlide(1)}
        >
          <ChevronRight size={24} />
        </button>

        <div className="home-carousel__content">
          <span className="home-carousel__tag">
            <Sparkles size={15} />
            Destacado G&V
          </span>
          <span className="home-carousel__category">{activeProduct.categoryName}</span>
          <h1>{activeProduct.name}</h1>
          <p>{activeProduct.description}</p>

          <div className="home-carousel__meta">
            <div className="home-carousel__price">
              {activeProduct.oldPrice && <del>{formatCRC(activeProduct.oldPrice)}</del>}
              <strong>
                {activeProduct.saleMode === "price_quote"
                  ? formatCRC(activeProduct.price)
                  : "Consultar precio"}
              </strong>
            </div>
            <span>
              {activeProduct.status === "available" ? "Disponible" : "Bajo pedido"}
            </span>
          </div>

          <div className="home-carousel__actions">
            <a
              className="button button--primary"
              href={productWhatsAppUrl(activeProduct, origin)}
              target="_blank"
            >
              <MessageCircle size={18} /> Cotizar
            </a>
            <Link className="button button--ghost" href={`/productos/${activeProduct.slug}`}>
              Ver detalle <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="home-carousel__dots" aria-label="Seleccionar destacado">
          {slides.map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Ver ${product.name}`}
              aria-current={index === activeSlide}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
