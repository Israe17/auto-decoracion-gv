"use client";

import { useEffect, useState } from "react";

// El vehiculo que el cliente eligio en el sitio (buscador del inicio,
// filtros del catalogo o formulario de contacto). Se guarda para que los
// mensajes de WhatsApp salgan ya con marca, modelo y ano: el dueno no
// tiene que preguntarlo. Mismo patron que la bandeja de cotizacion
// (localStorage + evento propio), sin providers ni contextos.
export type VehiculoCliente = { make: string; model: string; year: string };

const CLAVE = "gv-vehiculo";
const EVENTO = "gv-vehiculo-actualizado";

export function vehiculoTexto(vehiculo?: VehiculoCliente | null) {
  if (!vehiculo) return "";
  return [vehiculo.make, vehiculo.model, vehiculo.year]
    .map((parte) => (parte || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function leerVehiculo(): VehiculoCliente | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const valor = JSON.parse(crudo) as VehiculoCliente;
    return vehiculoTexto(valor) ? valor : null;
  } catch {
    return null;
  }
}

export function guardarVehiculo(vehiculo: VehiculoCliente) {
  if (typeof window === "undefined") return;
  // Sin ningun dato no se guarda nada: el mensaje debe caer a las lineas
  // en blanco para que el cliente las complete.
  if (!vehiculoTexto(vehiculo)) {
    localStorage.removeItem(CLAVE);
  } else {
    localStorage.setItem(CLAVE, JSON.stringify(vehiculo));
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function useVehiculoCliente() {
  // Arranca vacio a proposito: leer localStorage en el primer render
  // rompe la hidratacion. El href se completa en el efecto.
  const [vehiculo, setVehiculo] = useState<VehiculoCliente | null>(null);

  useEffect(() => {
    const leer = () => setVehiculo(leerVehiculo());
    leer();
    window.addEventListener(EVENTO, leer);
    return () => window.removeEventListener(EVENTO, leer);
  }, []);

  return vehiculo;
}
