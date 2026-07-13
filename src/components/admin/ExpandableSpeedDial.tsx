"use client";

import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

export type SpeedDialAction = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
};

export function ExpandableSpeedDial({ actions }: { actions: SpeedDialAction[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    firstActionRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className={`admin-speed-dial__control${open ? " is-open" : ""}`}>
      {open && (
        <button
          type="button"
          className="admin-speed-dial__scrim"
          aria-label="Cerrar selector de secciones"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="admin-speed-dial__actions" role="menu" aria-label="Secciones de administración">
        {actions.map((action, index) => (
          <button
            key={action.label}
            ref={index === 0 ? firstActionRef : undefined}
            type="button"
            role="menuitem"
            className={`admin-speed-dial__action${action.active ? " admin-speed-dial__action--active" : ""}`}
            style={{ "--action-index": index } as CSSProperties}
            aria-current={action.active ? "page" : undefined}
            tabIndex={open ? 0 : -1}
            onClick={() => {
              action.onClick();
              setOpen(false);
              triggerRef.current?.focus();
            }}
          >
            <span className="admin-speed-dial__label">{action.label}</span>
            <span className="admin-speed-dial__icon">{action.icon}</span>
          </button>
        ))}
      </div>

      <button
        ref={triggerRef}
        type="button"
        className="admin-speed-dial__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Cambiar sección"
        onClick={() => setOpen((current) => !current)}
      >
        <Plus className="admin-speed-dial__plus" size={28} />
      </button>
    </div>
  );
}
