"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Image sequence scrubbed por scroll (patron del helper de GreenSock):
// dibuja en un canvas el fotograma correspondiente al avance del scroll.
const FRAME_COUNT = 48;
const SIZE = 420;

const urls = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/sequence/logo/${String(i + 1).padStart(4, "0")}.png`
);

export function LogoSequence({ trigger }: { trigger: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const playhead = { frame: (FRAME_COUNT - 1) / 2 };
    let curFrame = -1;

    const images = urls.map((url) => {
      const img = new Image();
      img.src = url;
      return img;
    });

    const updateImage = () => {
      const frame = Math.round(playhead.frame);
      const image = images[frame];
      if (!image || !image.complete || !image.naturalWidth) return;
      if (frame === curFrame) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      curFrame = frame;
    };

    // Dibuja apenas cargue el fotograma que toca
    images.forEach((img) => {
      img.onload = () => {
        curFrame = -1;
        updateImage();
      };
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateImage();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const tween = gsap.fromTo(
      playhead,
      { frame: 0 },
      {
        frame: FRAME_COUNT - 1,
        ease: "none",
        onUpdate: updateImage,
        scrollTrigger: {
          trigger,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="compat-hero__canvas"
      role="img"
      aria-label="Logo Auto Decoración G&V"
    />
  );
}
