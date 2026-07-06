"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, MessageCircle, X } from "lucide-react";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

const links = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/contacto", label: "Contacto y ubicación" },
  { href: "/contacto#preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/admin", label: "Panel admin" }
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Cierra al navegar a otra pagina.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquea el scroll del fondo mientras el menu esta abierto.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        className="nav__menu-btn"
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      {open &&
        createPortal(
          <div
            className="mobile-menu__backdrop"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <nav
              className="mobile-menu"
              aria-label="Menú principal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobile-menu__header">
                <strong>Menú</strong>
                <button type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="mobile-menu__links">
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    {link.label} <ArrowRight size={17} />
                  </Link>
                ))}
              </div>

              <a
                className="button button--primary"
                href={generalWhatsAppUrl()}
                target="_blank"
                rel="noopener"
              >
                <MessageCircle size={18} /> Cotizar por WhatsApp
              </a>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
