"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { BlurText } from "@/components/BlurText";

type AdminLoadingTab = "products" | "offers" | "promos" | "vehicles" | "categories";

function LoadingBlock({ className = "" }: { className?: string }) {
  return <span className={`admin-skeleton__pulse ${className}`.trim()} aria-hidden="true" />;
}

function useSkeletonMotion() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(".admin-skeleton__pulse", {
        opacity: 0.45,
        duration: 0.85,
        ease: "sine.inOut",
        repeat: -1,
        stagger: 0.08,
        yoyo: true
      });
      gsap.fromTo(
        ".admin-skeleton__shimmer",
        { xPercent: -120 },
        { xPercent: 140, duration: 1.7, ease: "none", repeat: -1 }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return ref;
}

export function AdminStatsSkeleton() {
  const ref = useSkeletonMotion();

  return (
    <div className="admin-skeleton admin-skeleton--stats" ref={ref} aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div className="admin-stat-skeleton" key={index}>
          <LoadingBlock className="admin-skeleton__line admin-skeleton__line--sm" />
          <LoadingBlock className="admin-skeleton__line admin-skeleton__line--number" />
        </div>
      ))}
    </div>
  );
}

function ProductRowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="admin-product-list admin-skeleton__rows">
      {Array.from({ length: rows }, (_, index) => (
        <div className="admin-product-row admin-skeleton__row" key={index}>
          <LoadingBlock className="admin-skeleton__thumbnail" />
          <div>
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--title" />
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--meta" />
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--short" />
          </div>
          <div className="admin-skeleton__row-actions">
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock />
          </div>
        </div>
      ))}
    </div>
  );
}

function OfferCardsSkeleton() {
  return (
    <div className="admin-offer-grid admin-skeleton__offer-grid">
      {Array.from({ length: 6 }, (_, index) => (
        <article className="admin-offer-card admin-skeleton__offer-card" key={index}>
          <LoadingBlock className="admin-skeleton__offer-image" />
          <div className="admin-offer-card__body">
            <div className="admin-skeleton__chips">
              <LoadingBlock />
              <LoadingBlock />
            </div>
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--title" />
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--meta" />
            <div className="admin-skeleton__price">
              <LoadingBlock className="admin-skeleton__line admin-skeleton__line--sm" />
              <LoadingBlock className="admin-skeleton__line admin-skeleton__line--price" />
            </div>
            <div className="admin-skeleton__offer-actions">
              <LoadingBlock />
              <LoadingBlock />
              <LoadingBlock />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export function AdminCollectionSkeleton({ tab }: { tab: AdminLoadingTab }) {
  const ref = useSkeletonMotion();
  const offers = tab === "offers";
  const title =
    tab === "products"
      ? "Productos"
      : tab === "offers"
        ? "Ofertas y destacados"
        : tab === "promos"
          ? "Promociones del inicio"
          : tab === "vehicles"
            ? "Modelos registrados"
            : "Categorias registradas";

  return (
    <div className="admin-skeleton admin-skeleton--panel" ref={ref} aria-busy="true" aria-live="polite">
      <span className="admin-skeleton__shimmer" aria-hidden="true" />
      <div className="admin-skeleton__status">
        <BlurText as="span" text="Cargando catalogo" delay={35} duration={0.32} />
      </div>
      <section className={offers ? "admin-offers-panel" : "admin-list-panel admin-list-panel--wide"}>
        <div className="admin-list-header admin-skeleton__header">
          <div>
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--header" />
            <LoadingBlock className="admin-skeleton__line admin-skeleton__line--meta" />
          </div>
          <LoadingBlock className="admin-skeleton__header-action" />
        </div>
        {offers ? <OfferCardsSkeleton /> : <ProductRowsSkeleton />}
      </section>
      <span className="sr-only">Cargando {title.toLowerCase()}.</span>
    </div>
  );
}

export function AdminPanelReveal({
  tab,
  children
}: {
  tab: AdminLoadingTab;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const selector = tab === "offers" ? ".admin-offer-card" : ".admin-product-row";
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(selector);
      if (items.length) {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.34, ease: "power2.out", stagger: 0.045 }
        );
      } else {
        gsap.fromTo(root, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
      }
    }, root);

    return () => ctx.revert();
  }, [tab]);

  return <div className="admin-panel-reveal" ref={ref}>{children}</div>;
}
