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

// Linea de tiempo del taller (adaptacion propia estilo Lightswind
// Timeline): espina central que se llena con el degradado de marca en
// sincronia con el scroll (scrub) y entradas que se activan al entrar al
// viewport. Con reduced-motion todo queda visible y la espina llena.
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
    const observers: IntersectionObserver[] = [];
    const ctx = gsap.context(() => {
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
              scrub: true
            }
          }
        );
      }

      entries.forEach((entry) => {
        const card = entry.querySelector<HTMLElement>(".wtl__card, .wtl__cta");
        if (card) gsap.set(card, { autoAlpha: 0, y: 26 });
        const io = new IntersectionObserver(
          ([hit]) => {
            if (!hit.isIntersecting) return;
            io.disconnect();
            entry.classList.add("is-active");
            if (card) {
              gsap.to(card, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" });
            }
          },
          { rootMargin: "0px 0px -12% 0px" }
        );
        io.observe(entry);
        observers.push(io);
      });
    }, root);

    return () => {
      observers.forEach((io) => io.disconnect());
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
          <span className="wtl__node">
            <step.icon />
          </span>
          <div className="wtl__card">
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
