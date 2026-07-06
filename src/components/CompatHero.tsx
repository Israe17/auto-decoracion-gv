"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { business } from "@/lib/business";
import { LogoSequence } from "./LogoSequence";

// Banda hero del logo: escena animada tipo secuencia (el logo flota, su
// halo respira y gira ligado al scroll) con el formulario flotando en
// vidrio encima, e informacion del negocio en la parte inferior.
export function CompatHero({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Flotacion continua del canvas del logo
      gsap.to(".compat-hero__canvas", {
        y: -10,
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
          <LogoSequence trigger=".compat-hero" />
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
