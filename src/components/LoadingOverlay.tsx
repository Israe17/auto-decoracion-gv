"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

// Overlay de carga a pantalla completa con el degradado de marca y tres
// puntos que laten. Al pasar `show` a false aparece una costura blanca en
// el centro y la tela se abre hacia los dos lados, revelando la app
// ("line reveal"). Adaptacion propia a GSAP del LoadingOverlay de Estetica
// Dalay (alla usa motion/react). Va por portal al body para que el
// position: fixed no quede atrapado por transforms de ancestros; con
// reduced-motion los puntos quedan quietos y la salida es un fundido.
export function LoadingOverlay({
  show,
  label = "Verificando sesión"
}: {
  show: boolean;
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(show);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (show) {
      setVisible(true);
      return;
    }

    const root = rootRef.current;
    if (!root) {
      setVisible(false);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      const done = () => setVisible(false);

      if (reduce) {
        gsap.to(root, { autoAlpha: 0, duration: 0.4, onComplete: done });
        return;
      }

      const tl = gsap.timeline({ onComplete: done });
      tl.to(".loading-overlay__inner", { autoAlpha: 0, duration: 0.2 }, 0)
        .fromTo(
          ".loading-overlay__seam",
          { scaleY: 0, autoAlpha: 0 },
          { scaleY: 1, autoAlpha: 1, duration: 0.3, ease: "power2.out" },
          0
        )
        .to(".loading-overlay__seam", { autoAlpha: 0, duration: 0.3 }, 0.3)
        .to(
          ".loading-overlay__half--l",
          { xPercent: -101, duration: 0.72, ease: "power3.inOut" },
          0.32
        )
        .to(
          ".loading-overlay__half--r",
          { xPercent: 101, duration: 0.72, ease: "power3.inOut" },
          0.32
        );
    }, root);

    return () => ctx.revert();
  }, [show]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="loading-overlay" ref={rootRef}>
      <div className="loading-overlay__half loading-overlay__half--l" />
      <div className="loading-overlay__half loading-overlay__half--r" />
      <span className="loading-overlay__seam" aria-hidden="true" />
      <div className="loading-overlay__inner">
        <span className="loading-overlay__brand">G&amp;V System</span>
        <div className="loading-overlay__dots" aria-hidden="true">
          <span className="loading-overlay__dot" />
          <span className="loading-overlay__dot" />
          <span className="loading-overlay__dot" />
        </div>
        <p className="loading-overlay__label" role="status" aria-live="polite">
          {label}
        </p>
      </div>
    </div>,
    document.body
  );
}
