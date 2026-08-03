"use client";

import { Product, QuoteItem } from "@/types";

// Cualquier boton "Cotizar" del sitio (tarjeta, ficha o bandeja) pide la
// cotizacion disparando este evento; el dialogo vive UNA sola vez en el
// layout y lo escucha. Mismo patron de eventos que la bandeja, sin
// providers ni props atravesando media aplicacion.
export type PedidoDeCotizacion =
  | { tipo: "producto"; producto: Product }
  | { tipo: "bandeja"; items: QuoteItem[] };

export const EVENTO_COTIZAR = "gv-cotizar";

export function pedirCotizacion(pedido: PedidoDeCotizacion) {
  window.dispatchEvent(new CustomEvent<PedidoDeCotizacion>(EVENTO_COTIZAR, { detail: pedido }));
}
