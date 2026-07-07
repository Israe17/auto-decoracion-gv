"use client";

import { CSSProperties, ReactNode, useRef } from "react";

// Envoltorio "Border Glow": al acercar el cursor al borde de la tarjeta,
// se enciende un anillo de luz (rojo de la marca) en la dirección del
// puntero. Adaptado de React Bits a nuestros tiles con foto (el glow va
// en un anillo aparte para no tapar la imagen). Se apaga en touch y con
// reduced-motion vía CSS.
export function BorderGlow({
  children,
  className = "",
  radius = 22,
  sensitivity = 42,
  style
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  sensitivity?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = x - cx;
    const dy = y - cy;

    const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
    const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
    const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    el.style.setProperty("--edge-proximity", (edge * 100).toFixed(2));
    el.style.setProperty("--cursor-angle", `${deg.toFixed(2)}deg`);
  }

  function handleLeave() {
    ref.current?.style.setProperty("--edge-proximity", "0");
  }

  return (
    <div
      ref={ref}
      className={`border-glow ${className}`.trim()}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{
        ["--bg-radius" as string]: `${radius}px`,
        ["--edge-sensitivity" as string]: String(sensitivity),
        ...style
      }}
    >
      <span className="border-glow__ring" aria-hidden="true" />
      {children}
    </div>
  );
}
