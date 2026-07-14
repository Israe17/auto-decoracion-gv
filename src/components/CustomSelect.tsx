"use client";

import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className={`custom-select${open ? " custom-select--open" : ""}`} ref={rootRef}>
      <button
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="custom-select__trigger"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        type="button"
      >
        <span>{selected?.label}</span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>

      {open && (
        <div aria-label={ariaLabel} className="custom-select__menu" id={listboxId} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                aria-selected={isSelected}
                className="custom-select__option"
                disabled={option.disabled}
                key={option.value || "all"}
                onClick={() => selectOption(option.value)}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected && <Check aria-hidden="true" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
