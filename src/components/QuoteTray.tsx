"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { quoteWhatsAppUrl } from "@/lib/whatsapp";
import { QuoteItem } from "@/types";

const key = "gv-quote";

export function QuoteTray() {
  const [items, setItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    const read = () => setItems(JSON.parse(localStorage.getItem(key) || "[]"));
    read();
    window.addEventListener("gv-quote-updated", read);
    return () => window.removeEventListener("gv-quote-updated", read);
  }, []);

  if (!items.length) return null;

  return (
    <aside className="quote-tray">
      <div>
        <strong>{items.length} producto(s)</strong>
        <span>Listos para cotizar</span>
      </div>
      <a href={quoteWhatsAppUrl(items)} target="_blank" className="button button--primary">
        <MessageCircle size={18} /> WhatsApp
      </a>
      <button
        aria-label="Vaciar cotizacion"
        onClick={() => {
          localStorage.removeItem(key);
          setItems([]);
        }}
      >
        <Trash2 size={18} />
      </button>
    </aside>
  );
}
