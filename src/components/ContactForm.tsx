"use client";

import { FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { contactWhatsAppUrl } from "@/lib/whatsapp";

export function ContactForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const vehicleParts = [
      String(form.get("make") || "").trim(),
      String(form.get("model") || "").trim(),
      String(form.get("year") || "").trim()
    ].filter(Boolean);

    const url = contactWhatsAppUrl({
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      vehicle: vehicleParts.join(" "),
      message: String(form.get("message") || "").trim()
    });

    window.open(url, "_blank", "noopener");
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div>
        <h2>¿No encontró lo que busca?</h2>
        <p>
          Cuéntenos qué necesita y lo conseguimos con nuestros distribuidores de
          confianza. El mensaje nos llega directo al WhatsApp del negocio.
        </p>
      </div>

      <div className="form-grid">
        <label>
          Nombre
          <input name="name" required placeholder="Su nombre" />
        </label>
        <label>
          Teléfono (opcional)
          <input name="phone" type="tel" placeholder="8888 8888" />
        </label>
      </div>

      <div className="form-grid form-grid--three">
        <label>
          Marca
          <input name="make" placeholder="Toyota" />
        </label>
        <label>
          Modelo
          <input name="model" placeholder="Hilux" />
        </label>
        <label>
          Año
          <input name="year" type="number" placeholder="2022" />
        </label>
      </div>

      <label>
        ¿Qué anda buscando?
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Ej: cobertor de batea para Hilux 2022, o polarizado para sedán"
        />
      </label>

      <button className="button button--primary" type="submit">
        <MessageCircle size={18} /> Enviar por WhatsApp
      </button>
    </form>
  );
}
