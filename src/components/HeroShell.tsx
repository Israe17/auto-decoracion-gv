import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { BlurText } from "@/components/BlurText";
import { VehicleFinder } from "@/components/VehicleFinder";
import { generalWhatsAppUrl } from "@/lib/whatsapp";
import { VehicleModel } from "@/types";

// Hero estilo Estetica Dalay ("hero limpio"): copy sobre el fondo claro a
// la izquierda (titular BlurText que entra palabra por palabra) y la
// ACCION desde el primer viewport a la derecha — el buscador por vehiculo
// en tarjeta flotante, equivalente del formulario de reserva de Dalay.
export function HeroShell({ vehicles }: { vehicles: VehicleModel[] }) {
  return (
    <section className="hero-shell">
      <div className="hero-copy">
        <span className="eyebrow">Auto Decoración G&amp;V</span>
        <BlurText text="Todo para su vehículo, instalado por expertos" />
        <p>
          Accesorios, polarizado e instalación profesional en Liberia desde
          2008. Lo tenemos en el local o se lo conseguimos.
        </p>
        <div className="hero-actions">
          <a
            className="button button--primary"
            href={generalWhatsAppUrl()}
            target="_blank"
            rel="noopener"
          >
            <MessageCircle size={18} /> Cotizar por WhatsApp
          </a>
          <Link className="button button--secondary" href="/catalogo">
            Ver catálogo <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <div className="hero-panel">
        <VehicleFinder vehicles={vehicles} />
      </div>
    </section>
  );
}
