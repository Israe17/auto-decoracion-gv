"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { GalleryItem, GalleryShape } from "@/types";

// Mosaico tipo Masonry adaptado de React Bits (variante JS + CSS) al
// sistema del proyecto: clases propias (las del original — .list,
// .item-wrapper — son demasiado genericas y chocarian con el resto del
// CSS), alturas por proporcion en vez de pixeles fijos (asi el mosaico
// respira igual en cualquier ancho), next/image con alt real (fotos
// optimizadas y accesibles), y sin animacion cuando el visitante pide menos
// movimiento.

// Alto de la pieza = ancho de columna x este factor.
const PROPORCION: Record<GalleryShape, number> = {
  vertical: 1.32,
  cuadrada: 1,
  horizontal: 0.72
};

type Pieza = GalleryItem & { x: number; y: number; w: number; h: number };

function useColumnas(ancho: number) {
  if (ancho >= 1180) return 4;
  if (ancho >= 820) return 3;
  if (ancho >= 520) return 2;
  return 1;
}

function useMedida() {
  const ref = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(0);

  useLayoutEffect(() => {
    const nodo = ref.current;
    if (!nodo) return;
    const observador = new ResizeObserver(([entrada]) => {
      setAncho(entrada.contentRect.width);
    });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  return [ref, ancho] as const;
}

export function GalleryMasonry({ items }: { items: GalleryItem[] }) {
  const [contenedorRef, ancho] = useMedida();
  const columnas = useColumnas(ancho);
  const yaMonto = useRef(false);
  const [reducido, setReducido] = useState(false);

  useEffect(() => {
    setReducido(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Cada pieza cae en la columna mas corta: eso es lo que hace el mosaico.
  const { piezas, alto } = useMemo(() => {
    if (!ancho) return { piezas: [] as Pieza[], alto: 0 };

    const gap = 14;
    const anchoColumna = (ancho - gap * (columnas - 1)) / columnas;
    const alturas = new Array(columnas).fill(0);

    const piezas = items.map((item) => {
      const columna = alturas.indexOf(Math.min(...alturas));
      const h = anchoColumna * (PROPORCION[item.shape] ?? 1);
      const pieza: Pieza = {
        ...item,
        x: (anchoColumna + gap) * columna,
        y: alturas[columna],
        w: anchoColumna,
        h
      };
      alturas[columna] += h + gap;
      return pieza;
    });

    return { piezas, alto: Math.max(...alturas, 0) - gap };
  }, [ancho, columnas, items]);

  useLayoutEffect(() => {
    if (!piezas.length) return;

    piezas.forEach((pieza, indice) => {
      const selector = `[data-galeria="${pieza.id}"]`;
      const destino = { x: pieza.x, y: pieza.y, width: pieza.w, height: pieza.h };

      if (yaMonto.current || reducido) {
        gsap.set(selector, { ...destino, opacity: 1, filter: "blur(0px)" });
        return;
      }

      gsap.fromTo(
        selector,
        { ...destino, opacity: 0, y: pieza.y + 60, filter: "blur(12px)" },
        {
          ...destino,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          delay: Math.min(indice * 0.05, 0.6)
        }
      );
    });

    yaMonto.current = true;
  }, [piezas, reducido]);

  return (
    <div className="galeria-mosaico" ref={contenedorRef} style={{ height: alto || undefined }}>
      {piezas.map((pieza) => (
        <figure className="galeria-pieza" data-galeria={pieza.id} key={pieza.id}>
          <Image
            src={pieza.image}
            alt={pieza.title || "Trabajo de Auto Decoración G&V"}
            fill
            sizes="(max-width: 520px) 100vw, (max-width: 820px) 50vw, (max-width: 1180px) 33vw, 25vw"
          />
          {(pieza.title || pieza.description) && (
            <figcaption>
              {pieza.title && <strong>{pieza.title}</strong>}
              {pieza.description && <span>{pieza.description}</span>}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
