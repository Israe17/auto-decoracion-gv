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

    // Paleta de la bandera a cuadros del logo: SOLO amarillos y negros,
    // mitad y mitad, en dos intensidades cada uno.
    const COLORS = [
      "rgba(17, 21, 28, 0.2)",
      "rgba(17, 21, 28, 0.28)",
      "rgba(255, 199, 44, 0.42)",
      "rgba(255, 199, 44, 0.55)"
    ];
    const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)];

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
      size: 5 + Math.floor(Math.random() * 3) * 3, // 5, 8 u 11 px: pixelado
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
