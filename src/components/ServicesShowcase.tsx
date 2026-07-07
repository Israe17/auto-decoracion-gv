"use client";

import { ElementType, useRef } from "react";
import { Film, MessageCircle, Speaker, Wrench } from "lucide-react";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";
import { useIsStackMode, useScrollStack } from "./useScrollStack";

type Service = {
  icon: ElementType;
  title: string;
  text: string;
  cta: string;
  topic: string;
};

const SERVICES: Service[] = [
  {
    icon: Film,
    title: "Polarizado",
    text: "Reduzca el calor, gane privacidad y mejore la apariencia de su vehículo con un acabado uniforme y duradero.",
    cta: "Cotizar polarizado",
    topic: "polarizado"
  },
  {
    icon: Speaker,
    title: "Audio y video",
    text: "Pantallas, cámaras de reversa y sistemas de sonido instalados con conexiones limpias y seguras.",
    cta: "Cotizar instalación",
    topic: "instalacion de audio y video"
  },
  {
    icon: Wrench,
    title: "Accesorios y 4x4",
    text: "Defensas, estribos, barras LED, racks y suspensión con montaje profesional y seguro.",
    cta: "Cotizar instalación",
    topic: "instalacion de accesorios"
  }
];

// Servicios: en escritorio la cuadrícula con glare; en celular las
// tarjetas se APILAN al hacer scroll (Scroll Stack sobre el Lenis global).
export function ServicesShowcase() {
  const stack = useIsStackMode();
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollStack(rootRef, stack);

  if (stack) {
    return (
      <div className="scroll-stack service-stack" ref={rootRef}>
        {SERVICES.map((service) => (
          <article className="scroll-stack-card service-card" key={service.title}>
            <service.icon />
            <h3>{service.title}</h3>
            <p>{service.text}</p>
            <a
              className="button button--secondary"
              href={serviceWhatsAppUrl(service.topic)}
              target="_blank"
              rel="noopener"
            >
              <MessageCircle size={17} /> {service.cta}
            </a>
          </article>
        ))}
        <div className="scroll-stack-end" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="service-grid">
      {SERVICES.map((service) => (
        <article className="service-card glare-host" key={service.title}>
          <span className="glare" aria-hidden="true" />
          <service.icon />
          <h3>{service.title}</h3>
          <p>{service.text}</p>
          <a
            className="button button--secondary"
            href={serviceWhatsAppUrl(service.topic)}
            target="_blank"
            rel="noopener"
          >
            <MessageCircle size={17} /> {service.cta}
          </a>
        </article>
      ))}
    </div>
  );
}
