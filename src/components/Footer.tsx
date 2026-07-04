import Link from "next/link";
import { ArrowRight, Clock, MapPin, MessageCircle } from "lucide-react";
import { business } from "@/lib/business";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <Link className="brand brand--footer" href="/">
          <span className="brand__mark">
            <img src="/gv-system-logo.ico" alt="" />
          </span>
          <span>
            <strong>Auto Decoracion</strong>
            <small>G&V System</small>
          </span>
        </Link>
        <p>
          Accesorios automotrices en {business.city}: venta en el local y bajo
          pedido, con polarizado e instalación profesional en nuestro taller.
        </p>
      </div>
      <div className="footer__links">
        <strong>Explorar</strong>
        <Link href="/catalogo">
          Catálogo <ArrowRight size={15} />
        </Link>
        <Link href="/#servicios">
          Servicios <ArrowRight size={15} />
        </Link>
        <Link href="/contacto">
          Contacto y ubicación <ArrowRight size={15} />
        </Link>
        <Link href="/contacto#preguntas-frecuentes">
          Preguntas frecuentes <ArrowRight size={15} />
        </Link>
        <Link href="/admin">
          Panel admin <ArrowRight size={15} />
        </Link>
      </div>
      <div className="footer__contact">
        <strong>Contacto</strong>
        <a href={business.mapsUrl} target="_blank" rel="noopener">
          <MapPin size={18} /> {business.address}
        </a>
        <span>
          <Clock size={18} /> {business.hours[0].days}: {business.hours[0].time}
        </span>
        <a href={generalWhatsAppUrl()} target="_blank" rel="noopener">
          <MessageCircle size={18} /> WhatsApp para cotizaciones
        </a>
      </div>
    </footer>
  );
}
