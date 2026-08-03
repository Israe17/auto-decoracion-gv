"use client";

import { CSSProperties, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle, Zap } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import gsap from "gsap";
import { business } from "@/lib/business";
import { useVehiculoCliente } from "@/lib/vehiculo";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

// Formato determinista (independiente del locale): enteros con punto de miles.
const nf = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

type Stat = { value: number; prefix?: string; suffix?: string; label: string };

// Hero centrado estilo Estetica Dalay (su seccion de conversion): tarjeta
// glass sobre un aura tenue con textura de puntos, badge, titular con
// acento, prueba social con count-up, CTA protagonista y chips de
// contacto reales. Reveal escalonado fail-safe: sin JS o con
// reduced-motion todo queda visible.
export function HeroShell({
  productsCount,
  categoriesCount,
  years
}: {
  productsCount: number;
  categoriesCount: number;
  years: number;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const vehiculo = useVehiculoCliente();

  const stats: Stat[] = [
    { value: years, label: "años de experiencia" },
    { value: productsCount, prefix: "+", label: "productos en línea" },
    { value: categoriesCount, label: "líneas de catálogo" }
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nums = Array.from(root.querySelectorAll<HTMLElement>("[data-count]"));
    const runCount = (el: HTMLElement) => {
      const value = parseFloat(el.dataset.count || "0");
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const proxy = { n: 0 };
      el.textContent = `${prefix}${nf(0)}${suffix}`;
      gsap.to(proxy, {
        n: value,
        duration: 1.1,
        ease: "power2.out",
        onUpdate() {
          el.textContent = `${prefix}${nf(proxy.n)}${suffix}`;
        }
      });
    };

    if (reduce) return;

    // El hero esta en el primer viewport: no se esconde (evita parpadeo),
    // solo corre el count-up. Si por alguna razon esta mas abajo, reveal
    // escalonado al entrar.
    const inView = root.getBoundingClientRect().top < window.innerHeight * 0.85;
    if (inView) {
      nums.forEach(runCount);
      return;
    }

    root.classList.add("cta-anim");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          root.classList.add("is-in");
          nums.forEach(runCount);
          io.disconnect();
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const d = (delay: string) => ({ "--d": delay }) as CSSProperties;
  const hours = business.hours[0];

  return (
    <section ref={rootRef} className="hero-cta" aria-label="Auto Decoración G&V">
      <span className="hero-cta__aura" aria-hidden="true" />

      <div className="hero-cta__card">
        <span className="hero-cta__badge" data-reveal>
          <Zap size={15} /> Cotización en minutos por WhatsApp
        </span>

        <h2 className="hero-cta__title" data-reveal style={d(".06s")}>
          Todo para su vehículo, <em>instalado por expertos</em>
        </h2>

        <ul className="hero-cta__stats" data-reveal style={d(".12s")}>
          {stats.map((stat) => (
            <li className="hero-cta__stat" key={stat.label}>
              <span className="hero-cta__stat-value">
                <b
                  data-count={stat.value}
                  data-prefix={stat.prefix ?? ""}
                  data-suffix={stat.suffix ?? ""}
                >
                  {`${stat.prefix ?? ""}${nf(stat.value)}${stat.suffix ?? ""}`}
                </b>
              </span>
              <span className="hero-cta__stat-label">{stat.label}</span>
            </li>
          ))}
        </ul>

        <p className="hero-cta__sub" data-reveal style={d(".18s")}>
          Accesorios, polarizado e instalación profesional en Liberia desde
          2008. Cuéntenos qué necesita y le cotizamos por WhatsApp.
        </p>

        <div className="hero-cta__actions" data-reveal style={d(".24s")}>
          <a
            className="button button--primary hero-cta__cta"
            href={generalWhatsAppUrl(vehiculo)}
            target="_blank"
            rel="noopener"
          >
            <MessageCircle size={18} /> Cotizar por WhatsApp
          </a>
          <Link className="button button--secondary hero-cta__catalog" href="/catalogo">
            Ver catálogo <ArrowRight size={18} />
          </Link>
        </div>

        <div className="hero-cta__chips" data-reveal style={d(".3s")}>
          <a
            className="hero-cta__chip"
            href={business.mapsUrl}
            target="_blank"
            rel="noopener"
          >
            <span className="hero-cta__chip-ico">
              <MapPin size={18} />
            </span>
            <span className="hero-cta__chip-body">
              <strong>{business.city}</strong>
              <small>Ver en Google Maps</small>
            </span>
            <ArrowRight size={16} className="hero-cta__chip-arrow" aria-hidden="true" />
          </a>

          <div className="hero-cta__chip hero-cta__chip--static">
            <span className="hero-cta__chip-ico">
              <Clock size={18} />
            </span>
            <span className="hero-cta__chip-body">
              <strong>{hours.days}</strong>
              <small>{hours.time}</small>
            </span>
          </div>

          <a
            className="hero-cta__chip"
            href={business.instagramUrl}
            target="_blank"
            rel="noopener"
          >
            <span className="hero-cta__chip-ico">
              <FaInstagram size={18} aria-hidden="true" />
            </span>
            <span className="hero-cta__chip-body">
              <strong>Síganos en Instagram</strong>
              <small>Trabajos del taller</small>
            </span>
            <ArrowRight size={16} className="hero-cta__chip-arrow" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
