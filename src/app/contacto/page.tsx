import type { Metadata } from "next";
import { Clock, MapPin, MessageCircle, Store } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Faq } from "@/components/Faq";
import { business } from "@/lib/business";
import { generalWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contacto y ubicación | Auto Decoración G&V",
  description:
    "Visítenos en Liberia, Guanacaste, escríbanos por WhatsApp o cuéntenos qué producto anda buscando y se lo conseguimos."
};

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Contacto</span>
        <h1>Visítenos en Liberia o escríbanos por WhatsApp</h1>
        <p>
          Tenemos producto en el local listo para llevar, y lo que no esté en
          existencia se lo conseguimos con nuestros distribuidores de confianza.
        </p>
      </section>

      <section className="section section--tight">
        <div className="contact-layout">
          <div className="contact-info">
            <div className="contact-card">
              <div className="contact-card__row">
                <MapPin size={20} />
                <div>
                  <strong>Ubicación</strong>
                  <span>{business.address}</span>
                  <a href={business.mapsUrl} target="_blank" rel="noopener">
                    Ver en Google Maps
                  </a>
                </div>
              </div>
              <div className="contact-card__row">
                <Clock size={20} />
                <div>
                  <strong>Horario</strong>
                  {business.hours.map((slot) => (
                    <span key={slot.days}>
                      {slot.days}: {slot.time}
                    </span>
                  ))}
                </div>
              </div>
              <div className="contact-card__row">
                <Store size={20} />
                <div>
                  <strong>En el local</strong>
                  <span>
                    Venta de accesorios, polarizado e instalación de todo lo que
                    vendemos.
                  </span>
                </div>
              </div>
              <a
                className="button button--primary"
                href={generalWhatsAppUrl()}
                target="_blank"
                rel="noopener"
              >
                <MessageCircle size={18} /> Escribir por WhatsApp
              </a>
            </div>

            <div className="contact-map">
              <iframe
                src={business.mapsEmbedUrl}
                title={`Mapa de ${business.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <section className="section" id="preguntas-frecuentes">
        <div className="section__header">
          <div>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2>Lo que más nos consultan</h2>
          </div>
        </div>
        <Faq />
      </section>
    </>
  );
}
