"use client";

import { ReactNode } from "react";
import { useVehiculoCliente } from "@/lib/vehiculo";
import { productWhatsAppUrl } from "@/lib/whatsapp";
import { Product } from "@/types";

// El CTA del panel de la ficha vive en un server component y ahi no se
// puede leer el vehiculo que el cliente eligio (vive en su navegador).
// Este enlace minimo lo lee y arma el mensaje completo.
export function ProductQuoteLink({
  product,
  className = "button button--primary",
  children
}: {
  product: Product;
  className?: string;
  children: ReactNode;
}) {
  const vehiculo = useVehiculoCliente();

  return (
    <a
      className={className}
      href={productWhatsAppUrl(product, vehiculo)}
      target="_blank"
      rel="noopener"
    >
      {children}
    </a>
  );
}
