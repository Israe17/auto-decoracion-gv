"use client";

import { ElementType, useEffect, useRef, useState } from "react";
import { Film, Store, Truck, Wrench } from "lucide-react";
import { Spotlight } from "./Spotlight";

type Benefit = { icon: ElementType; title: string; text: string };

const ITEMS: Benefit[] = [
  {
    icon: Store,
    title: "Disponible de inmediato",
    text: "Visite nuestro local en Liberia y llévese el producto el mismo día."
  },
  {
    icon: Truck,
    title: "Lo conseguimos por usted",
    text: "Si no está disponible, lo pedimos a nuestros distribuidores de confianza."
  },
  {
    icon: Wrench,
    title: "Instalación profesional",
    text: "Instalamos todo lo que vendemos, con acabado limpio y garantizado."
  },
  {
    icon: Film,
    title: "Polarizado de calidad",
    text: "Protección solar, privacidad y un acabado uniforme para su vehículo."
  }
];

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

// Beneficios: en escritorio una cuadrícula con spotlight; en celular las
// tarjetas se APILAN al hacer scroll (Scroll Stack de React Bits adaptado
// a nuestro Lenis global, sin crear un segundo Lenis).
export function BenefitsShowcase() {
  const [stack, setStack] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setStack(mobile && !reduce);
  }, []);

  useEffect(() => {
    if (!stack) return;
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
      const stackPx = 0.16 * vh;
      const scaleEndPx = 0.1 * vh;
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
  }, [stack]);

  if (stack) {
    return (
      <div className="benefit-stack" ref={rootRef}>
        {ITEMS.map((item) => (
          <div className="scroll-stack-card" key={item.title}>
            <item.icon />
            <strong>{item.title}</strong>
            <span>{item.text}</span>
          </div>
        ))}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="benefits">
      {ITEMS.map((item) => (
        <Spotlight color="rgba(230, 33, 53, 0.14)" key={item.title}>
          <item.icon />
          <strong>{item.title}</strong>
          <span>{item.text}</span>
        </Spotlight>
      ))}
    </div>
  );
}
