"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { CategoryCard } from "@/components/CategoryCard";
import { Category } from "@/types";

const DEPTH_Z = 10;
const DEPTH_Y = 6;

// Mazo deslizable de categorias para movil (adaptacion propia del Sliding
// Cards de Estetica Dalay): se arrastra la tarjeta de arriba y pasa al
// fondo mientras la siguiente toma su lugar, con puntos de posicion.
// Diferencia clave con Dalay: alla la tarjeta tiene botones sueltos y el
// arrastre se bloquea sobre enlaces; aca la tarjeta ENTERA es un enlace,
// asi que el arrastre se permite en toda su superficie y, si hubo
// arrastre real, se traga el clic siguiente para no navegar sin querer.
function SlidingDeck({ categories }: { categories: Category[] }) {
  const stackRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    cardsRef.current = Array.from(stack.querySelectorAll<HTMLElement>(".sliding-card"));
    const dotEls = dotsRef.current ? Array.from(dotsRef.current.children) : [];

    const DUR = 320;
    const DRAG_THRESHOLD = 8;
    let isSwiping = false;
    let dragged = false;
    let startX = 0;
    let currentX = 0;
    let raf: number | null = null;
    let pointerId: number | null = null;

    const active = () => cardsRef.current[0];

    const stackTransform = (offset: number, x = 0, rotate = 0) =>
      `perspective(900px) translateZ(${-DEPTH_Z * offset}px) translateY(${DEPTH_Y * offset}px) translateX(${x}px) rotateY(${rotate}deg)`;

    const updateDots = () => {
      const front = active();
      const idx = front ? Number(front.dataset.idx) : 0;
      dotEls.forEach((dot, i) => dot.classList.toggle("is-active", i === idx));
    };

    const updatePositions = () => {
      cardsRef.current.forEach((card, i) => {
        const offset = i + 1;
        card.style.zIndex = `${100 - offset}`;
        card.style.transform = stackTransform(offset);
        card.style.opacity = "1";
        // el orden del mazo vive en el arreglo, no en el DOM: la clase
        // marca cual es la de arriba para que solo ella lleve sombra
        card.classList.toggle("is-front", i === 0);
      });
      updateDots();
    };

    const applySwipe = (deltaX: number) => {
      const card = active();
      if (!card) return;
      const rotate = deltaX * 0.16;
      const opacity = 1 - Math.min(Math.abs(deltaX) / 130, 1) * 0.55;
      card.style.transform = stackTransform(1, deltaX, rotate);
      card.style.opacity = `${opacity}`;
    };

    const flingToBack = (dir: number) => {
      const card = active();
      if (!card) return;
      card.style.transition = `transform ${DUR}ms ease, opacity ${DUR}ms ease`;
      card.style.transform = stackTransform(1, dir * 380, dir * 22);
      window.setTimeout(() => {
        cardsRef.current = [...cardsRef.current.slice(1), card];
        updatePositions();
      }, DUR);
    };

    const start = (clientX: number) => {
      if (isSwiping) return;
      isSwiping = true;
      dragged = false;
      startX = currentX = clientX;
      const card = active();
      if (card) card.style.transition = "none";
    };

    const move = (clientX: number) => {
      if (!isSwiping) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        currentX = clientX;
        const deltaX = currentX - startX;
        if (Math.abs(deltaX) > DRAG_THRESHOLD && !dragged) {
          dragged = true;
          // Se captura el puntero SOLO cuando ya hay arrastre, para que el
          // gesto siga vivo si el dedo se sale de la pila. Capturarlo desde
          // el pointerdown redirigiria tambien el clic al contenedor y el
          // enlace de la tarjeta nunca se abriria con un toque simple.
          if (pointerId !== null) stack.setPointerCapture(pointerId);
        }
        applySwipe(deltaX);
        if (Math.abs(deltaX) > 60) end();
      });
    };

    // Tras un arrastre real el navegador dispara un clic "fantasma" sobre
    // la tarjeta (que es un enlace) y navegaria sin que la persona lo haya
    // tocado. Se atrapa ese unico clic y se libera enseguida, para no
    // bloquear un toque genuino posterior.
    const swallowNextClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const end = () => {
      if (!isSwiping) return;
      if (raf) cancelAnimationFrame(raf);
      const deltaX = currentX - startX;
      const card = active();
      const wasDragged = dragged;
      if (card) {
        card.style.transition = `transform ${DUR}ms ease, opacity ${DUR}ms ease`;
        if (Math.abs(deltaX) > 50) {
          flingToBack(Math.sign(deltaX));
        } else {
          applySwipe(0);
        }
      }
      if (pointerId !== null && stack.hasPointerCapture(pointerId)) {
        stack.releasePointerCapture(pointerId);
      }
      pointerId = null;
      isSwiping = false;
      dragged = false;
      startX = currentX = 0;

      if (wasDragged) {
        stack.addEventListener("click", swallowNextClick, { capture: true, once: true });
        window.setTimeout(() => stack.removeEventListener("click", swallowNextClick, true), 400);
      }
    };

    // La tarjeta es un enlace con una imagen dentro, asi que el navegador
    // intenta su propio "arrastrar y soltar" y aborta el gesto con
    // pointercancel; por eso se anula el dragstart nativo.
    const onDown = (event: PointerEvent) => {
      pointerId = event.pointerId;
      start(event.clientX);
    };
    const onMove = (event: PointerEvent) => move(event.clientX);
    const onUp = () => end();
    const onDragStart = (event: Event) => event.preventDefault();

    stack.addEventListener("pointerdown", onDown);
    stack.addEventListener("pointermove", onMove);
    stack.addEventListener("pointerup", onUp);
    stack.addEventListener("pointercancel", onUp);
    stack.addEventListener("dragstart", onDragStart);

    updatePositions();

    return () => {
      stack.removeEventListener("pointerdown", onDown);
      stack.removeEventListener("pointermove", onMove);
      stack.removeEventListener("pointerup", onUp);
      stack.removeEventListener("pointercancel", onUp);
      stack.removeEventListener("dragstart", onDragStart);
      stack.removeEventListener("click", swallowNextClick, true);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [categories.length]);

  return (
    <div className="sliding-cards-wrap">
      <div className="sliding-cards" ref={stackRef}>
        {categories.map((category, index) => {
          const offset = index + 1;
          return (
            <article
              key={category.id}
              data-idx={index}
              className="sliding-card"
              style={
                {
                  zIndex: 100 - offset,
                  transform: `perspective(900px) translateZ(${-DEPTH_Z * offset}px) translateY(${DEPTH_Y * offset}px)`
                } as CSSProperties
              }
            >
              <CategoryCard category={category} />
            </article>
          );
        })}
      </div>

      {categories.length > 1 && (
        <div className="sliding-cards__dots" ref={dotsRef} aria-hidden="true">
          {categories.map((category, index) => (
            <span
              key={category.id}
              className={`sliding-cards__dot${index === 0 ? " is-active" : ""}`}
            />
          ))}
        </div>
      )}
      <p className="sliding-cards__hint">Deslice para ver las categorías</p>
    </div>
  );
}

// En escritorio la cuadricula de siempre; en movil el mazo deslizable.
export function CategoryShowcase({ categories }: { categories: Category[] }) {
  const [deck, setDeck] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const sync = () => setDeck(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (deck) return <SlidingDeck categories={categories} />;

  return (
    <div className="category-grid">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  );
}
