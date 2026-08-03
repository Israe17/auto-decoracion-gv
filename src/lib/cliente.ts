"use client";

import { useEffect, useState } from "react";

// Datos con los que el cliente se identifica al cotizar. Se recuerdan en
// su navegador para que la segunda cotizacion sea de un solo toque; la
// copia que le sirve al negocio vive en Supabase (tabla de solicitudes).
export type ClienteGuardado = { name: string; phone: string };

const CLAVE = "gv-cliente";
const EVENTO = "gv-cliente-actualizado";

export function leerCliente(): ClienteGuardado | null {
  if (typeof window === "undefined") return null;
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const valor = JSON.parse(crudo) as ClienteGuardado;
    return valor.name?.trim() ? valor : null;
  } catch {
    return null;
  }
}

export function guardarCliente(cliente: ClienteGuardado) {
  if (typeof window === "undefined") return;
  if (!cliente.name.trim()) return;
  localStorage.setItem(
    CLAVE,
    JSON.stringify({ name: cliente.name.trim(), phone: cliente.phone.trim() })
  );
  window.dispatchEvent(new Event(EVENTO));
}

export function useCliente() {
  // Arranca vacio: leer localStorage en el primer render rompe la
  // hidratacion.
  const [cliente, setCliente] = useState<ClienteGuardado | null>(null);

  useEffect(() => {
    const leer = () => setCliente(leerCliente());
    leer();
    window.addEventListener(EVENTO, leer);
    return () => window.removeEventListener(EVENTO, leer);
  }, []);

  return cliente;
}
