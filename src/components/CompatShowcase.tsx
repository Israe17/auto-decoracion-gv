"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatCRC } from "@/lib/catalog";
import { Product } from "@/types";

// Escaparate cinematico: crossfade + zoom lento (Ken Burns) en loop,
// con barra de informacion sobre el borde inferior de la foto.
export function CompatShowcase({ products }: { products: Product[] }) {
  const slides = products.filter((product) => product.images[0]).slice(0, 4);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const slideEls = gsap.utils.toArray<HTMLElement>(".compat-stage__slide");
      gsap.set(slideEls, { autoAlpha: 0 });

      const tl = gsap.timeline({ repeat: -1 });
      slideEls.forEach((el, index) => {
        const img = el.querySelector("img");
        const info = el.querySelector(".compat-stage__info");

        tl.add(() => setActive(index))
          .set(img, { scale: 1.06 })
          .to(el, { autoAlpha: 1, duration: 0.7, ease: "power2.out" })
          .fromTo(
            info,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" },
            "<0.15"
          )
          .to(img, { scale: 1.16, duration: 4.4, ease: "none" }, "<")
          .to(el, { autoAlpha: 0, duration: 0.7, ease: "power2.in" }, "-=0.7");
      });

      // Parallax sutil del escenario al hacer scroll
      gsap.to(stageRef.current, {
        yPercent: -4,
        ease: "none",
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6
        }
      });
    }, stageRef);

    return () => ctx.revert();
  }, [slides.length]);

  if (!slides.length) {
    return (
      <div className="compat-stage compat-stage--empty">
        <span className="eyebrow">Auto Decoración G&V</span>
      </div>
    );
  }

  return (
    <div className="compat-stage" ref={stageRef}>
      {slides.map((product, index) => (
        <Link
          key={product.id}
          className={`compat-stage__slide${index === 0 ? " is-first" : ""}`}
          href={`/productos/${product.slug}`}
          aria-hidden={active !== index}
          tabIndex={active === index ? 0 : -1}
        >
          <img src={product.images[0]} alt={product.name} />
          <div className="compat-stage__info">
            <span>{product.categoryName}</span>
            <strong>{product.name}</strong>
            <em>
              {product.saleMode === "price_quote"
                ? formatCRC(product.price)
                : "Cotizar por WhatsApp"}
            </em>
          </div>
        </Link>
      ))}

      <div className="compat-stage__dots" aria-hidden="true">
        {slides.map((slide, index) => (
          <span key={slide.id} className={index === active ? "is-active" : ""} />
        ))}
      </div>
    </div>
  );
}
