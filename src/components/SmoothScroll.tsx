"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll suave global (equivalente libre del ScrollSmoother de pago de
// GSAP). Integra Lenis con ScrollTrigger para que los reveals sigan
// funcionando. Se desactiva con prefers-reduced-motion.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: true, // scroll suave también en celular (elegido por el dueño)
      syncTouchLerp: 0.08,
      anchors: true,
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]"))
    });

    // Lenis maneja el scroll; avisamos a ScrollTrigger en cada frame.
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
