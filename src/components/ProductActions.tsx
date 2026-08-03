"use client";

import { MessageCircle, Plus } from "lucide-react";
import { useVehiculoCliente } from "@/lib/vehiculo";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import { Product, QuoteItem } from "@/types";

function addToQuote(product: Product) {
  const key = "gv-quote";
  const current = JSON.parse(localStorage.getItem(key) || "[]") as QuoteItem[];
  const existing = current.find((item) => item.id === product.id);
  const next = existing
    ? current.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    : [
        ...current,
        {
          id: product.id,
          name: product.name,
          categoryName: product.categoryName,
          price: product.price,
          // Se guarda para que el mensaje de la bandeja pueda mostrar la
          // oferta (antes / ahorro) sin volver a consultar el catalogo.
          oldPrice: product.oldPrice,
          saleMode: product.saleMode,
          quantity: 1,
          slug: product.slug
        }
      ];

  localStorage.setItem(key, JSON.stringify(next));
  window.dispatchEvent(new Event("gv-quote-updated"));
}

export function ProductActions({
  product,
  compact = false
}: {
  product: Product;
  compact?: boolean;
}) {
  const vehiculo = useVehiculoCliente();

  return (
    <div className="product-actions">
      <a
        className="button button--primary"
        href={productWhatsAppUrl(product, vehiculo)}
        target="_blank"
        aria-label={`Cotizar ${product.name} por WhatsApp`}
        title="Cotizar por WhatsApp"
      >
        <MessageCircle size={18} />
        <span className="product-action__label product-action__label--mobile">Cotizar</span>
        <span className="product-action__label product-action__label--desktop">
          {compact ? "Cotizar" : "Cotizar por WhatsApp"}
        </span>
      </a>
      <button
        className="button button--secondary"
        onClick={() => addToQuote(product)}
        aria-label={`Agregar ${product.name} a la cotizacion`}
        title="Agregar a la cotizacion"
      >
        <Plus size={18} />
        <span className="product-action__label product-action__label--mobile">Agregar</span>
        <span className="product-action__label product-action__label--desktop">
          {compact ? "Agregar" : "Agregar a cotizacion"}
        </span>
      </button>
    </div>
  );
}
