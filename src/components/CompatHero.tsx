"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { business } from "@/lib/business";

// Banda hero del logo: escena animada tipo secuencia (el logo flota, su
// halo respira y gira ligado al scroll) con el formulario flotando en
// vidrio encima, e informacion del negocio en la parte inferior.
export function CompatHero({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Flotacion continua del logo
      gsap.to(".compat-hero__logo img", {
        y: -12,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Halo rojo que respira detras del logo
      gsap.to(".compat-hero__halo", {
        scale: 1.18,
        opacity: 0.5,
        duration: 2.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // La tira LED de la entrada parpadea sutil, como en el local
      gsap.to(".compat-hero__led", {
        opacity: 0.65,
        duration: 1.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });

      // Secuencia ligada al scroll: el logo gira al desplazar la pagina
      gsap.fromTo(
        ".compat-hero__logo",
        { rotateY: -24, scale: 0.94 },
        {
          rotateY: 24,
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5
          }
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="compat-hero" ref={rootRef}>
      <div className="compat-hero__bg" aria-hidden="true">
        <span className="compat-hero__led" />
      </div>

      <div className="compat-hero__info">
        <div className="compat-hero__logo-stage">
          <span className="compat-hero__halo" aria-hidden="true" />
          <div className="compat-hero__logo">
            <img src="/gv-system-logo.png" alt="Auto Decoración G&V" />
          </div>
        </div>

        <div className="compat-hero__brandinfo">
          <span className="eyebrow eyebrow--light">Compatibilidad garantizada</span>
          <strong>{business.name}</strong>
          <p>Accesorios, polarizado e instalación · {business.city}</p>
        </div>
      </div>

      <div className="compat-hero__form">{children}</div>
    </div>
  );
}
