"use client";

import { RefObject, useEffect, useState } from "react";

// Posición absoluta en el documento, independiente de transforms (offsetTop
// no se ve afectado por scale/translate, a diferencia de getBoundingClientRect).
function docTop(el: HTMLElement | null) {
  let top = 0;
  let node: HTMLElement | null = el;
  while (node) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return top;
}

// Devuelve si el modo apilado está activo (solo móvil y sin reduced-motion).
export function useIsStackMode() {
  const [stack, setStack] = useState(false);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStack(mobile && !reduce);
  }, []);
  return stack;
}

// Aplica el efecto Scroll Stack (React Bits adaptado) a las
// `.scroll-stack-card` dentro de `rootRef`, usando el Lenis global (loop
// rAF propio que lee window.scrollY, sin crear un segundo Lenis).
export function useScrollStack(rootRef: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".scroll-stack-card"));
    const endEl = root.querySelector<HTMLElement>(".scroll-stack-end");
    if (!cards.length) return;

    const itemStackDistance = 24;
    const baseScale = 0.9;
    const itemScale = 0.025;
    let raf = 0;

    const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

    function update() {
      const scrollTop = window.scrollY;
      const vh = window.innerHeight;
      // Punto donde se fijan las tarjetas: ~34% desde arriba para que el
      // apilado quede centrado en la pantalla (no pegado arriba).
      const stackPx = 0.34 * vh;
      const scaleEndPx = 0.2 * vh;
      const endTop = endEl ? docTop(endEl) : 0;
      const pinEnd = endTop - vh / 2;

      cards.forEach((card, i) => {
        const cardTop = docTop(card);
        const triggerStart = cardTop - stackPx - itemStackDistance * i;
        const triggerEnd = cardTop - scaleEndPx;
        const progress = clamp((scrollTop - triggerStart) / (triggerEnd - triggerStart || 1));
        const targetScale = baseScale + i * itemScale;
        const scale = 1 - progress * (1 - targetScale);

        let translateY = 0;
        if (scrollTop >= triggerStart && scrollTop <= pinEnd) {
          translateY = scrollTop - cardTop + stackPx + itemStackDistance * i;
        } else if (scrollTop > pinEnd) {
          translateY = pinEnd - cardTop + stackPx + itemStackDistance * i;
        }

        card.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0) scale(${scale.toFixed(
          3
        )})`;
      });

      raf = requestAnimationFrame(update);
    }

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [rootRef, active]);
}
