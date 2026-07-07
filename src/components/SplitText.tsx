"use client";

import { ElementType, Fragment, useEffect, useRef } from "react";
import gsap from "gsap";

// Título que entra animándose letra por letra (stagger) con GSAP.
// Adaptado de React Bits SplitText SIN el plugin de pago de GSAP: parte
// el texto en palabras/letras a mano y las anima. Re-anima cuando cambia
// `text`. Respeta prefers-reduced-motion y deja el texto accesible.
export function SplitText({
  text,
  as: Tag = "h1" as ElementType,
  className = "",
  delay = 38,
  duration = 0.7
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

    const chars = el.querySelectorAll<HTMLElement>(".split-char");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, yPercent: 60 },
        {
          opacity: 1,
          yPercent: 0,
          duration,
          ease: "power3.out",
          stagger: delay / 1000,
          force3D: true
        }
      );
    }, el);

    return () => ctx.revert();
  }, [text, delay, duration]);

  const words = text.split(" ");

  return (
    <Tag ref={ref} className={`split-parent ${className}`.trim()} aria-label={text}>
      {words.map((word, wi) => (
        <Fragment key={`${word}-${wi}`}>
          <span className="split-word" aria-hidden="true">
            {Array.from(word).map((char, ci) => (
              <span className="split-char" key={ci}>
                {char}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  );
}
