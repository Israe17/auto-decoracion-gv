"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Film,
  MessageCircle,
  PackageSearch,
  Speaker,
  Wrench
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";

const STEPS = [
  {
    icon: Film,
    title: "Polarizado",
    text: "Menos calor y más privacidad, con acabado uniforme y duradero.",
    cta: "Cotizar polarizado",
    topic: "polarizado"
  },
  {
    icon: Speaker,
    title: "Audio y video",
    text: "Pantallas, cámaras de reversa y sonido con conexiones limpias.",
    cta: "Cotizar instalación",
    topic: "instalacion de audio y video"
  },
  {
    icon: Wrench,
    title: "Accesorios y 4x4",
    text: "Defensas, barras LED, racks y suspensión con montaje seguro.",
    cta: "Cotizar instalación",
    topic: "instalacion de accesorios"
  },
  {
    icon: PackageSearch,
    title: "Repuestos y piezas",
    text: "Si no está en el local, se lo conseguimos por usted.",
    cta: "Solicitar pieza",
    topic: "conseguir un repuesto o pieza"
  }
];

// Linea de tiempo del taller (adaptacion propia del Industrial Vertical
// Timeline de Lightswind): espina central que se llena con el degradado
// de marca al scrollear (scrub), numero fantasma por paso, nodo cuadrado
// redondeado que hace "pop" al activarse y contenido sin caja que entra
// deslizandose desde su lado. Con reduced-motion todo queda visible.
export function WorkshopTimeline() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const progress = root.querySelector<HTMLElement>(".wtl__progress");
    const entries = root.querySelectorAll<HTMLElement>(".wtl__entry");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (progress) progress.style.height = "100%";
      entries.forEach((entry) => entry.classList.add("is-active"));
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const mobile = window.matchMedia("(max-width: 720px)").matches;
    const ctx = gsap.context(() => {
      const activated = new Set<HTMLElement>();

      function activate(entry: HTMLElement) {
        if (activated.has(entry)) return;
        activated.add(entry);
        entry.classList.add("is-active");
        const node = entry.querySelector<HTMLElement>(".wtl__node");
        const num = entry.querySelector<HTMLElement>(".wtl__num");
        const body = entry.querySelector<HTMLElement>(".wtl__body, .wtl__cta");
        const tl = gsap.timeline();
        if (node) {
          tl.to(node, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(2)" });
        }
        if (num) {
          tl.to(num, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.1);
        }
        if (body) {
          tl.to(
            body,
            mobile
              ? { autoAlpha: 1, y: 0, duration: 0.55, ease: "power2.out" }
              : {
                  autoAlpha: 1,
                  x: 0,
                  duration: 0.6,
                  ease: "power2.out"
                },
            0.16
          );
        }
      }

      // Estados iniciales ocultos.
      entries.forEach((entry) => {
        const node = entry.querySelector<HTMLElement>(".wtl__node");
        const num = entry.querySelector<HTMLElement>(".wtl__num");
        const body = entry.querySelector<HTMLElement>(".wtl__body, .wtl__cta");
        const fromX = entry.classList.contains("wtl__entry--left") ? -36 : 36;
        if (node) gsap.set(node, { autoAlpha: 0, scale: 0.4 });
        if (num) gsap.set(num, { autoAlpha: 0, y: 18 });
        if (body) gsap.set(body, mobile ? { autoAlpha: 0, y: 24 } : { autoAlpha: 0, x: fromX });
      });

      // Cada paso "hace pop" EXACTAMENTE cuando la espina de progreso
      // alcanza su nodo: se calculan umbrales (posicion del centro de cada
      // nodo dentro de la espina) y el onUpdate del scrub los dispara en
      // orden, uno por uno, al ritmo del scroll.
      const spine = root.querySelector<HTMLElement>(".wtl__spine");
      const rootRect = root.getBoundingClientRect();
      const spineRect = spine?.getBoundingClientRect();
      const spineTop = spineRect ? spineRect.top - rootRect.top : 0;
      const spineHeight = spineRect ? spineRect.height : root.offsetHeight;
      const thresholds = Array.from(entries).map((entry) => {
        const node = entry.querySelector<HTMLElement>(".wtl__node");
        if (!node) return 1;
        const r = node.getBoundingClientRect();
        const center = r.top - rootRect.top + r.height / 2;
        return Math.min(1, Math.max(0, (center - spineTop) / spineHeight));
      });

      if (progress) {
        gsap.fromTo(
          progress,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              end: "bottom 58%",
              scrub: true,
              onUpdate: (self) => {
                entries.forEach((entry, i) => {
                  if (self.progress >= thresholds[i]) activate(entry);
                });
              }
            }
          }
        );
      }
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div className="wtl" ref={rootRef}>
      <span className="wtl__spine" aria-hidden="true">
        <span className="wtl__progress" />
      </span>
      {STEPS.map((step, index) => (
        <article
          className={`wtl__entry ${index % 2 ? "wtl__entry--right" : "wtl__entry--left"}`}
          key={step.title}
        >
          <span className="wtl__num" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="wtl__node">
            <step.icon />
          </span>
          <div className="wtl__body">
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <a
              className="text-link"
              href={serviceWhatsAppUrl(step.topic)}
              target="_blank"
              rel="noopener"
            >
              {step.cta} <ArrowRight size={16} />
            </a>
          </div>
        </article>
      ))}
      <div className="wtl__entry wtl__entry--cta">
        <span className="wtl__node">
          <MessageCircle />
        </span>
        <div className="wtl__cta">
          <a
            className="button button--primary"
            href={serviceWhatsAppUrl("servicios del taller")}
            target="_blank"
            rel="noopener"
          >
            <MessageCircle size={18} /> Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
