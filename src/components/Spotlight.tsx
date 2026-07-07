"use client";

import { CSSProperties, ReactNode, useRef } from "react";

// Envoltorio con "spotlight": una luz suave que sigue el cursor dentro
// del elemento. Adaptado de React Bits (SpotlightCard) a nuestro sistema.
// Se apaga en touch y con reduced-motion vía CSS (.spotlight).
export function Spotlight({
  children,
  className = "",
  color = "rgba(255, 255, 255, 0.25)",
  style
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={`spotlight-host ${className}`.trim()}
      style={{ ["--spot-color" as string]: color, ...style }}
    >
      <span className="spotlight" aria-hidden="true" />
      {children}
    </div>
  );
}
