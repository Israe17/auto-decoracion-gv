"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Fondo "Pixel Snow" (adaptacion propia de React Bits, sin three.js):
// cuadritos que caen lentamente detras del contenido, guino al patron de
// bandera a cuadros del logo GV System. Canvas 2D ligero, densidad baja,
// paleta de marca (tinta tenue + acentos amarillo/rojo). Se apaga con
// prefers-reduced-motion y en el admin. pointer-events: none siempre.
export function PixelSnow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Paleta: mayoria tinta muy tenue; acentos ocasionales del logo.
    const COLORS = [
      "rgba(17, 21, 28, 0.16)",
      "rgba(17, 21, 28, 0.11)",
      "rgba(17, 21, 28, 0.2)",
      "rgba(255, 199, 44, 0.32)",
      "rgba(230, 33, 53, 0.16)"
    ];
    // Pesos: 3 de cada 4 copos son tinta; amarillo y rojo son detalles.
    const pick = () => {
      const r = Math.random();
      if (r < 0.78) return COLORS[Math.floor(Math.random() * 3)];
      return r < 0.9 ? COLORS[3] : COLORS[4];
    };

    type Flake = {
      x: number;
      y: number;
      size: number;
      speed: number;
      drift: number;
      color: string;
    };

    let flakes: Flake[] = [];
    let raf = 0;
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const spawn = (randomY: boolean): Flake => ({
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -6,
      size: 2 + Math.floor(Math.random() * 3) * 2, // 2, 4 o 6 px: pixelado
      speed: 0.25 + Math.random() * 0.55,
      drift: (Math.random() - 0.5) * 0.15,
      color: pick()
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Densidad proporcional al area, con techo bajo (fondo sutil).
      const target = Math.min(90, Math.round((width * height) / 18000));
      flakes = Array.from({ length: target }, () => spawn(true));
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      for (const flake of flakes) {
        flake.y += flake.speed;
        flake.x += flake.drift;
        if (flake.y > height + 6 || flake.x < -6 || flake.x > width + 6) {
          Object.assign(flake, spawn(false));
        }
        ctx.fillStyle = flake.color;
        // Cuadrado alineado a la retícula: efecto pixel, como los cuadros
        // del logo.
        ctx.fillRect(Math.round(flake.x), Math.round(flake.y), flake.size, flake.size);
      }
      raf = window.requestAnimationFrame(step);
    };

    resize();
    raf = window.requestAnimationFrame(step);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return <canvas ref={canvasRef} className="pixel-snow" aria-hidden="true" />;
}
