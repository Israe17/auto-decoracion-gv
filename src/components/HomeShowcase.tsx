"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  PackageSearch
} from "lucide-react";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { Category, Product, Promo } from "@/types";

type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  image: string;
  href?: string;
  ctaLabel: string;
  external: boolean;
};

// Lamina de respaldo: garantiza que el hero nunca quede vacio aunque no
// haya promociones ni categorias con imagen.
const FALLBACK_SLIDE: Slide = {
  id: "fallback",
  eyebrow: "Auto Decoración G&V",
  title: "Todo para su vehículo, instalado por expertos",
  description:
    "Accesorios, polarizado e instalación profesional en Liberia desde 2008. Lo tenemos en el local o se lo conseguimos.",
  image: "/hero/vehiculo.jpg",
  href: "/catalogo",
  ctaLabel: "Ver catálogo",
  external: false
};

// Carrusel del hero: foto horizontal a todo lo ancho con el texto sobre
// un degradado oscuro y botones de accion. Toma las promociones de
// admin > Promociones; sin promociones activas cae a las lineas de
// catalogo (categorias). Hasta 5 laminas.
export function HomeShowcase({
  categories,
  products,
  promos = []
}: {
  categories: Category[];
  products: Product[];
  promos?: Promo[];
}) {
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

  const slides = useMemo<Slide[]>(() => {
    const promoSlides = promos
      .filter((promo) => promo.active !== false && promo.image)
      .slice(0, 5)
      .map((promo) => ({
        id: promo.id,
        eyebrow: "Auto Decoración G&V",
        title: promo.title,
        description: promo.subtitle,
        image: promo.image,
        href: promo.link,
        ctaLabel: promo.ctaLabel || "Ver más",
        external: Boolean(promo.link && /^https?:/i.test(promo.link))
      }));

    if (promoSlides.length) return promoSlides;

    const withImage = categories.filter((category) => category.image);
    const withProducts = withImage.filter((category) => categoryCounts[category.slug]);
    const rest = withImage.filter((category) => !categoryCounts[category.slug]);
    const categorySlides = [...withProducts, ...rest].slice(0, 5).map((category) => ({
      id: category.id,
      eyebrow: categoryCounts[category.slug]
        ? `${categoryCounts[category.slug]} producto(s) en línea`
        : "Línea de catálogo",
      title: category.name,
      description: category.description,
      image: category.image,
      href: `/catalogo?categoria=${category.slug}`,
      ctaLabel: "Ver categoría",
      external: false
    }));

    return categorySlides.length ? categorySlides : [FALLBACK_SLIDE];
  }, [promos, categories, categoryCounts]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [openCategory, setOpenCategory] = useState(
    () =>
      categories.find((category) =>
        products.some((product) => product.categorySlug === category.slug)
      )?.slug ||
      categories[0]?.slug ||
      ""
  );

  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  function moveSlide(direction: number) {
    if (!slideCount) return;
    setActiveSlide((current) => (current + direction + slideCount) % slideCount);
  }

  const active = slides[activeSlide % (slideCount || 1)];
  if (!active) return null;

  return (
    <section className="home-showcase" aria-label="Destacados">
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
        <div className="home-carousel__media" key={active.id}>
          <img src={active.image} alt={active.title} />
        </div>
        <div className="home-carousel__shade" />

        <div className="home-carousel__content">
          <span className="home-carousel__eyebrow">{active.eyebrow}</span>
          <h1>{active.title}</h1>
          {active.description && <p>{active.description}</p>}

          <div className="home-carousel__actions">
            {active.href &&
              (active.external ? (
                <a
                  className="button button--primary"
                  href={active.href}
                  target="_blank"
                  rel="noopener"
                >
                  {active.ctaLabel} <ArrowRight size={18} />
                </a>
              ) : (
                <Link className="button button--primary" href={active.href}>
                  {active.ctaLabel} <ArrowRight size={18} />
                </Link>
              ))}
            <a
              className="button button--ghost"
              href={generalWhatsAppUrl()}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={18} /> Cotizar por WhatsApp
            </a>
          </div>
        </div>

        {slideCount > 1 && (
          <>
            <button
              className="home-carousel__arrow home-carousel__arrow--left"
              type="button"
              aria-label="Anterior"
              onClick={() => moveSlide(-1)}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className="home-carousel__arrow home-carousel__arrow--right"
              type="button"
              aria-label="Siguiente"
              onClick={() => moveSlide(1)}
            >
              <ChevronRight size={24} />
            </button>

            <div className="home-carousel__dots" aria-label="Seleccionar lamina">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Ver ${slide.title}`}
                  aria-current={index === activeSlide}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
