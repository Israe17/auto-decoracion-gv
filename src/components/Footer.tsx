import Link from "next/link";
import { ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";

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
        <p>Accesorios automotrices, cotizacion e instalacion en Liberia.</p>
      </div>
      <div className="footer__links">
        <strong>Explorar</strong>
        <Link href="/catalogo">
          Catalogo <ArrowRight size={15} />
        </Link>
        <Link href="/catalogo#categorias">
          Categorias <ArrowRight size={15} />
        </Link>
        <Link href="/admin">
          Panel admin <ArrowRight size={15} />
        </Link>
      </div>
      <div className="footer__contact">
        <strong>Contacto</strong>
        <span>
          <MapPin size={18} /> Liberia, Guanacaste
        </span>
        <span>
          <Phone size={18} /> Numero del negocio
        </span>
        <span>
          <MessageCircle size={18} /> WhatsApp para cotizaciones
        </span>
      </div>
    </footer>
  );
}
