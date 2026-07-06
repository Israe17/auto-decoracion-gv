import Link from "next/link";
import { MessageCircle, Search, UserRound } from "lucide-react";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  return (
    <header className="site-header">
      <div className="topbar">
        <span>Liberia, Guanacaste — venta, instalación y polarizado profesional</span>
        <strong>Cotización rápida por WhatsApp</strong>
      </div>
      <div className="nav">
        <Link className="brand" href="/">
          <span className="brand__mark">
            <img src="/gv-system-logo.ico" alt="" />
          </span>
          <span>
            <strong>Auto Decoracion</strong>
            <small>G&V System</small>
          </span>
        </Link>
        <nav className="nav__links" aria-label="Navegacion principal">
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/#servicios">Servicios</Link>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <div className="nav__tools">
          <label className="search-box">
            <Search size={18} />
            <input placeholder="Buscar productos..." />
          </label>
          <Link className="quote-link" href="/catalogo">
            <MessageCircle size={18} />
            Cotizar
          </Link>
          <Link className="icon-link" href="/admin" aria-label="Panel admin">
            <UserRound size={20} />
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
