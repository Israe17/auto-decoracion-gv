"use client";

import { ReactNode } from "react";
import { pedirCotizacion } from "@/lib/cotizar";
import { Product } from "@/types";

// El CTA del panel de la ficha vive en un server component: este boton
// cliente abre el dialogo de cotizacion rapida con ese producto.
export function ProductQuoteLink({
  product,
  className = "button button--primary",
  children
}: {
  product: Product;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => pedirCotizacion({ tipo: "producto", producto: product })}
    >
      {children}
    </button>
  );
}
