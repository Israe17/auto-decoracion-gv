"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Selectores que se revelan como bloque al entrar al viewport.
const revealSelectors = [
  ".page-hero",
  ".home-showcase",
  ".section__header",
  ".split__copy",
  ".compat-stage",
  ".vehicle-finder",
  ".cta-band",
  ".product-gallery",
  ".product-info",
  ".product-detail-panel",
  ".contact-card",
  ".contact-map",
  ".contact-form"
].join(", ");

// Grupos cuyos hijos entran en cascada (stagger).
const staggerGroups: Array<[parent: string, children: string]> = [
  [".benefits", ":scope > div"],
  [".service-grid", ".service-card"],
  [".product-grid", ".product-card"],
  [".category-grid", ".category-card"],
  [".faq", "details"]
];

export function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(revealSelectors).forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true }
          }
        );
      });

      staggerGroups.forEach(([parentSelector, childSelector]) => {
        document.querySelectorAll<HTMLElement>(parentSelector).forEach((parent) => {
          const items = parent.querySelectorAll<HTMLElement>(childSelector);
          if (!items.length) return;
          gsap.fromTo(
            items,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.08,
              scrollTrigger: { trigger: parent, start: "top 88%", once: true }
            }
          );
        });
      });

      // Parallax sutil en la imagen principal de la galeria del producto.
      document
        .querySelectorAll<HTMLElement>(".product-gallery__main img")
        .forEach((img) => {
          gsap.set(img, { scale: 1.12 });
          gsap.to(img, {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6
            }
          });
        });

      // El precio heroe entra con un pequeno pop.
      document.querySelectorAll<HTMLElement>(".product-price-hero").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, scale: 0.95 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.55,
            delay: 0.15,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true }
          }
        );
      });
    });

    // Las imagenes que cargan tarde mueven las posiciones calculadas.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
