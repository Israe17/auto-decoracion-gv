"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ArrowUpRight, Menu, MessageCircle, X } from "lucide-react";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { business } from "@/lib/business";
import { SearchBox } from "./SearchBox";

const links = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto y ubicación" },
  { href: "/contacto#preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/admin", label: "Panel admin" }
];

// Menu movil de pantalla completa (estilo Hamburger Menu Overlay):
// el panel se despliega desde arriba y los enlaces entran en cascada
// con GSAP; la salida se anima en reversa antes de desmontar.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const close = useCallback(() => {
    const tl = tlRef.current;
    if (tl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      tl.eventCallback("onReverseComplete", () => setOpen(false));
      // La salida es mas rapida que la entrada.
      tl.timeScale(1.8).reverse();
    } else {
      setOpen(false);
    }
  }, []);

  // Cierra al navegar a otra pagina.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea el scroll del fondo y cierra con Escape.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Animacion de entrada (y su reversa para salir).
  useEffect(() => {
    if (!open) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = overlayRef.current;
    if (!el) return;

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { clipPath: "circle(0% at calc(100% - 44px) 44px)" },
      { clipPath: "circle(150% at calc(100% - 44px) 44px)", duration: 0.55, ease: "power3.inOut" }
    );
    tl.fromTo(
      el.querySelectorAll(".menu-overlay__links a"),
      { autoAlpha: 0, y: 26 },
      { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.06 },
      "-=0.15"
    );
    tl.fromTo(
      el.querySelectorAll(".menu-overlay__search, .menu-overlay__footer"),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.08 },
      "-=0.3"
    );
    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [open]);

  return (
    <>
      <button
        className="nav__menu-btn"
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Menu size={20} />
      </button>

      {open &&
        createPortal(
          <div className="menu-overlay" ref={overlayRef} role="dialog" aria-modal="true">
            <div className="menu-overlay__header">
              <span className="menu-overlay__brand">
                <img src="/gv-system-logo.png" alt="" />
                Auto Decoración G&V
              </span>
              <button type="button" aria-label="Cerrar menú" onClick={close}>
                <X size={22} />
              </button>
            </div>

            <div className="menu-overlay__search">
              <SearchBox className="search-box search-box--menu" />
            </div>

            <nav className="menu-overlay__links" aria-label="Menú principal">
              {links.map((link, index) => (
                <Link key={link.href} href={link.href} onClick={close}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  {link.label}
                  <ArrowUpRight size={22} />
                </Link>
              ))}
            </nav>

            <div className="menu-overlay__footer">
              <a
                className="button button--primary"
                href={generalWhatsAppUrl()}
                target="_blank"
                rel="noopener"
              >
                <MessageCircle size={18} /> Cotizar por WhatsApp
              </a>
              <p>
                {business.city} · Lun a vie {business.hours[0].time}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
