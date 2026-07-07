"use client";

import { ElementType, Fragment, useEffect, useRef } from "react";
import gsap from "gsap";

// Título que entra palabra por palabra desde arriba, desenfocado y se va
// enfocando (blur → nítido). Adaptado de React Bits BlurText a GSAP (sin
// la dependencia de motion). Re-anima al cambiar `text`, texto accesible
// (aria-label) y respeta prefers-reduced-motion.
export function BlurText({
  text,
  as: Tag = "h1" as ElementType,
  className = "",
  delay = 120,
  duration = 0.55
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = el.querySelectorAll<HTMLElement>(".blur-word");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { filter: "blur(10px)", opacity: 0, y: -26 },
        {
          filter: "blur(0px)",
          opacity: 1,
          y: 0,
          duration,
          ease: "power2.out",
          stagger: delay / 1000
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, delay, duration]);

  const words = text.split(" ");

  return (
    <Tag ref={ref} className={`blur-parent ${className}`.trim()} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={`${word}-${wi}`}>
          <span className="blur-word" aria-hidden="true">
            {word}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
