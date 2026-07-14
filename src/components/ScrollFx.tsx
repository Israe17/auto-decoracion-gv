"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// Selectores que se revelan como bloque al entrar al viewport.
const revealSelectors = [
  ".page-hero",
  ".home-showcase",
  ".section__header",
  ".split__copy",
  ".compat-hero",
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
  [".category-grid", ".category-card"],
  [".faq", "details"]
];

// Reveals por IntersectionObserver + GSAP: el navegador detecta la
// entrada al viewport sin posiciones precalculadas, asi los cambios de
// layout (imagenes tardias, datos) no dejan secciones ocultas — el bug
// clasico de los triggers con medidas viejas.
export function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observers: IntersectionObserver[] = [];
    let ctx: gsap.Context | null = null;
    let frame = 0;
    let cancelled = false;

    // `el` ya paso la linea de disparo (-12% del alto): esta a la vista al
    // cargar, asi que no lo ocultamos (no vale la pena animarlo y evita el
    // parpadeo del contenido "above the fold").
    function alreadyVisible(el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.88 && rect.bottom > 0;
    }

    const setup = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        // Observa `el` y ejecuta `play` una sola vez cuando entra al viewport
        // (equivalente a start "top 88%": margen inferior de -12%).
        function onEnter(el: HTMLElement, play: () => void) {
          const io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                play();
                io.unobserve(entry.target);
              });
            },
            { rootMargin: "0px 0px -12% 0px" }
          );
          io.observe(el);
          observers.push(io);
        }

        gsap.utils.toArray<HTMLElement>(revealSelectors).forEach((el) => {
          if (alreadyVisible(el)) return;
          gsap.set(el, { autoAlpha: 0, y: 28 });
          onEnter(el, () =>
            gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" })
          );
        });

        staggerGroups.forEach(([parentSelector, childSelector]) => {
          document.querySelectorAll<HTMLElement>(parentSelector).forEach((parent) => {
            const items = parent.querySelectorAll<HTMLElement>(childSelector);
            if (!items.length || alreadyVisible(parent)) return;
            gsap.set(items, { autoAlpha: 0, y: 24 });
            onEnter(parent, () =>
              gsap.to(items, {
                autoAlpha: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.08
              })
            );
          });
        });

        // El precio heroe entra con un pequeno pop.
        document.querySelectorAll<HTMLElement>(".product-price-hero").forEach((el) => {
          if (alreadyVisible(el)) return;
          gsap.set(el, { autoAlpha: 0, scale: 0.95 });
          onEnter(el, () =>
            gsap.to(el, {
              autoAlpha: 1,
              scale: 1,
              duration: 0.55,
              delay: 0.15,
              ease: "power2.out"
            })
          );
        });
      });
    };

    // IMPORTANTE: las mutaciones de GSAP (opacity/visibility/transform en
    // linea) deben ocurrir DESPUES de que React termine de hidratar; de lo
    // contrario React las marca como desajuste de hidratacion. La hidratacion
    // concurrente puede pintar (y disparar un rAF) ANTES de terminar, asi que
    // en la carga inicial esperamos el evento `load` (garantizado despues de
    // la hidratacion). En navegaciones del cliente ya no hay hidratacion y
    // basta un frame.
    const schedule = () => {
      frame = window.requestAnimationFrame(setup);
    };
    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", schedule);
      observers.forEach((io) => io.disconnect());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
