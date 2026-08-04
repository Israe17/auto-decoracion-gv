"use client";

import { HelpCircle } from "lucide-react";
import { ModuloGuia, pedirGuia } from "@/lib/guia";

// Repite el recorrido del modulo cuando se quiera. La guia sale sola la
// primera vez; este boton es para volver a verla.
export function GuiaBoton({ modulo, ancla }: { modulo: ModuloGuia; ancla?: string }) {
  return (
    <button
      type="button"
      className="guia-boton"
      data-guia={ancla}
      title="Ver la guía de este módulo"
      onClick={() => pedirGuia(modulo)}
    >
      <HelpCircle size={16} /> Guía
    </button>
  );
}
