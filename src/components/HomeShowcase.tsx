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
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { Category, Product, Promo } from "@/types";

// Carrusel del hero. Con promociones activas (admin > Promociones)
// muestra los banners completos y clicables; sin promociones cae a las
// lineas de catalogo (categorias), cuyo contenido tambien se edita en
// el admin. Hasta 5 laminas en ambos modos.
export function HomeShowcase({
  categories,
  products,
  promos = []
}: {
  categories: Category[];
  products: Product[];
  promos?: Promo[];
}) {
  const promoSlides = useMemo(
    () => promos.filter((promo) => promo.active !== false && promo.image).slice(0, 5),
    [promos]
  );

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

  const categorySlides = useMemo(() => {
    const withImage = categories.filter((category) => category.image);
    const withProducts = withImage.filter((category) => categoryCounts[category.slug]);
    const rest = withImage.filter((category) => !categoryCounts[category.slug]);
    return [...withProducts, ...rest].slice(0, 5);
  }, [categories, categoryCounts]);

  const promoMode = promoSlides.length > 0;
  const slideCount = promoMode ? promoSlides.length : categorySlides.length;

  const [activeSlide, setActiveSlide] = useState(0);
  const [openCategory, setOpenCategory] = useState(
    () =>
      categories.find((category) =>
        products.some((product) => product.categorySlug === category.slug)
      )?.slug ||
      categories[0]?.slug ||
      ""
  );

  useEffect(() => {
    if (slideCount < 2) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slideCount);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  const activePromo = promoSlides[activeSlide % (promoSlides.length || 1)];
  const activeCategory = categorySlides[activeSlide % (categorySlides.length || 1)];

  function moveSlide(direction: number) {
    if (!slideCount) return;
    setActiveSlide((current) => (current + direction + slideCount) % slideCount);
  }

  if (promoMode ? !activePromo : !activeCategory) return null;

  const activeCount = activeCategory ? categoryCounts[activeCategory.slug] || 0 : 0;
  const promoLinkExternal = Boolean(activePromo?.link && /^https?:/i.test(activePromo.link));

  return (
    <section className="home-showcase" aria-label="Lineas de catalogo">
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

      <div className={promoMode ? "home-carousel home-carousel--promo" : "home-carousel"}>
        {promoMode && activePromo ? (
          <div className="home-promo">
            <div className="home-promo__panel">
              <span className="home-carousel__tag">
                <Sparkles size={15} />
                Promoción G&V
              </span>
              <h1>{activePromo.title}</h1>
              {activePromo.subtitle && <p>{activePromo.subtitle}</p>}

              <div className="home-carousel__actions">
                {activePromo.link &&
                  (promoLinkExternal ? (
                    <a
                      className="button button--primary"
                      href={activePromo.link}
                      target="_blank"
                      rel="noopener"
                    >
                      {activePromo.ctaLabel || "Ver promoción"} <ArrowRight size={18} />
                    </a>
                  ) : (
                    <Link className="button button--primary" href={activePromo.link}>
                      {activePromo.ctaLabel || "Ver promoción"} <ArrowRight size={18} />
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

            <div className="home-promo__art">
              <span className="home-promo__backdrop" aria-hidden="true">
                <img src={activePromo.image} alt="" />
              </span>
              <img
                className="home-promo__img"
                src={activePromo.image}
                alt={activePromo.title}
              />
            </div>
          </div>
        ) : (
          activeCategory && (
            <>
              <div className="home-carousel__media">
                <img src={activeCategory.image} alt={activeCategory.name} />
              </div>
              <div className="home-carousel__shade" />

              <div className="home-carousel__content">
                <span className="home-carousel__tag">
                  <Sparkles size={15} />
                  Lineas G&V
                </span>
                <span className="home-carousel__category">
                  {activeCount
                    ? `${activeCount} producto(s) en linea`
                    : "Disponible bajo pedido"}
                </span>
                <h1>{activeCategory.name}</h1>
                <p>{activeCategory.description}</p>

                <div className="home-carousel__actions">
                  <Link
                    className="button button--primary"
                    href={`/catalogo?categoria=${activeCategory.slug}`}
                  >
                    Ver categoria <ArrowRight size={18} />
                  </Link>
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
            </>
          )
        )}

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
          {(promoMode
            ? promoSlides.map((promo) => ({ id: promo.id, label: promo.title }))
            : categorySlides.map((category) => ({ id: category.id, label: category.name }))
          ).map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={`Ver ${item.label}`}
              aria-current={index === activeSlide}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
