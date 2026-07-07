"use client";

import { ElementType, PointerEvent, useEffect, useRef, useState } from "react";
import { Film, MessageCircle, Speaker, Wrench } from "lucide-react";
import { serviceWhatsAppUrl } from "@/lib/whatsapp";

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

function ServiceContent({ service }: { service: Service }) {
  return (
    <>
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
    </>
  );
}

// Baraja de tarjetas deslizables (estilo Sliding Cards): arrastre la de
// arriba hacia un lado y aparece la siguiente. Con profundidad 3D en las
// de atrás y puntos de posición.
function SlidingDeck() {
  const [order, setOrder] = useState(SERVICES.map((_, i) => i));
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const flyingRef = useRef(false);

  function onDown(event: PointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("a") || flyingRef.current) return;
    startX.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onMove(event: PointerEvent<HTMLElement>) {
    if (!dragging) return;
    setX(event.clientX - startX.current);
  }

  function onUp() {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(x) > 80) {
      flyingRef.current = true;
      setX(x > 0 ? 720 : -720);
      window.setTimeout(() => {
        setOrder((o) => [...o.slice(1), o[0]]);
        setX(0);
        flyingRef.current = false;
      }, 300);
    } else {
      setX(0);
    }
  }

  function goTo(cardIndex: number) {
    setOrder((o) => {
      const pos = o.indexOf(cardIndex);
      return [...o.slice(pos), ...o.slice(0, pos)];
    });
  }

  const front = order[0];

  return (
    <div className="services-deck">
      <div className="sliding-cards">
        {order.map((cardIndex, pos) => {
          const isFront = pos === 0;
          const style = isFront
            ? {
                transform: `translateX(${x}px) rotate(${x * 0.05}deg)`,
                transition: dragging ? "none" : "transform 320ms ease",
                zIndex: SERVICES.length
              }
            : {
                transform: `translateY(${pos * 12}px) scale(${1 - pos * 0.05})`,
                zIndex: SERVICES.length - pos
              };
          return (
            <article
              className={`service-card sliding-card${isFront ? " is-front" : ""}`}
              key={SERVICES[cardIndex].title}
              style={style}
              onPointerDown={isFront ? onDown : undefined}
              onPointerMove={isFront ? onMove : undefined}
              onPointerUp={isFront ? onUp : undefined}
              onPointerCancel={isFront ? onUp : undefined}
            >
              <ServiceContent service={SERVICES[cardIndex]} />
            </article>
          );
        })}
      </div>

      <div className="sliding-cards__dots" role="tablist" aria-label="Servicios">
        {SERVICES.map((service, i) => (
          <button
            key={service.title}
            type="button"
            aria-label={service.title}
            aria-selected={i === front}
            className={i === front ? "is-active" : ""}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      <p className="sliding-cards__hint">Deslice para ver los servicios</p>
    </div>
  );
}

// Servicios: en escritorio la cuadrícula con glare; en celular una baraja
// de tarjetas deslizables.
export function ServicesShowcase() {
  const [deck, setDeck] = useState(false);

  useEffect(() => {
    setDeck(window.matchMedia("(max-width: 640px)").matches);
  }, []);

  if (deck) return <SlidingDeck />;

  return (
    <div className="service-grid">
      {SERVICES.map((service) => (
        <article className="service-card glare-host" key={service.title}>
          <span className="glare" aria-hidden="true" />
          <ServiceContent service={service} />
        </article>
      ))}
    </div>
  );
}
