"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Plus } from "lucide-react";
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
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="product-actions">
      <a className="button button--primary" href={productWhatsAppUrl(product, origin)} target="_blank">
        <MessageCircle size={18} /> Cotizar por WhatsApp
      </a>
      <button className="button button--secondary" onClick={() => addToQuote(product)}>
        <Plus size={18} /> {compact ? "Agregar" : "Agregar a cotizacion"}
      </button>
    </div>
  );
}
