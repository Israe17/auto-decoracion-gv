"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Trash2 } from "lucide-react";
import { pedirCotizacion } from "@/lib/cotizar";
import { QuoteItem } from "@/types";

const key = "gv-quote";

export function QuoteTray() {
  const pathname = usePathname();
  const [items, setItems] = useState<QuoteItem[]>([]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const read = () => setItems(JSON.parse(localStorage.getItem(key) || "[]"));
    read();
    window.addEventListener("gv-quote-updated", read);
    return () => window.removeEventListener("gv-quote-updated", read);
  }, [pathname]);

  if (pathname.startsWith("/admin") || !items.length) return null;

  return (
    <aside className="quote-tray">
      <div>
        <strong>{items.length} producto(s)</strong>
        <span>Listos para cotizar</span>
      </div>
      <button
        type="button"
        className="button button--primary"
        onClick={() => pedirCotizacion({ tipo: "bandeja", items })}
      >
        <MessageCircle size={18} /> WhatsApp
      </button>
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
