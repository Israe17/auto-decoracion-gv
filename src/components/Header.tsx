import Image from "next/image";
import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { SearchBox } from "./SearchBox";

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
            <Image src="/gv-system-logo.png" alt="Auto Decoracion G&V" width={64} height={64} priority />
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
          <SearchBox />
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
