"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Confirmacion de los CRUD del admin: modal centrado que se cierra solo.
// Dos segundos alcanzan para leerlo y no estorban cuando el dueno esta
// cargando varios productos seguidos; un toque o Escape lo cierran antes.
const DURACION = 2000;

export function AdminSuccessDialog({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  const [montado, setMontado] = useState(false);

  useEffect(() => setMontado(true), []);

  useEffect(() => {
    const cierre = window.setTimeout(onClose, DURACION);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(cierre);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  if (!montado) return null;

  return createPortal(
    <div className="admin-success" role="status" aria-live="polite" onClick={onClose}>
      <div className="admin-success__card">
        <span className="admin-success__icon" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="22" />
            <path d="m15 27 8 8 15-17" />
          </svg>
        </span>
        <strong>Cambio guardado</strong>
        <span className="admin-success__detalle">{message}</span>
        <span className="admin-success__barra" aria-hidden="true" />
      </div>
    </div>,
    document.body
  );
}
