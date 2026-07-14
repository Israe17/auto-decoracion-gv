"use client";

import { MessageCircle } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { business } from "@/lib/business";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloat() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <a
        className="instagram-float"
        href={business.instagramUrl}
        target="_blank"
        rel="noopener"
        aria-label="Abrir Instagram de Auto Decoracion G&V"
        title="Instagram"
      >
        <FaInstagram aria-hidden="true" size={25} />
      </a>
      <a
        className="wa-float"
        href={generalWhatsAppUrl()}
        target="_blank"
        rel="noopener"
        aria-label="Escribir por WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle size={26} />
      </a>
    </>
  );
}
