"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function AdminSuccessToast({
  message,
  onClose
}: {
  message: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="admin-success-layer" aria-live="polite">
      <div className="admin-success-toast" role="status">
        <span className="admin-success-toast__icon" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="21" />
            <path d="m16 27 7 7 14-16" />
          </svg>
        </span>
        <span className="admin-success-toast__copy">
          <strong>Cambio confirmado</strong>
          <span>{message}</span>
        </span>
        <button type="button" onClick={onClose} aria-label="Cerrar confirmacion">
          <X size={17} />
        </button>
        <span className="admin-success-toast__progress" aria-hidden="true" />
      </div>
    </div>,
    document.body
  );
}
