"use client";

import { Check, ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
};

type MenuPosition = { left: number; top?: number; bottom?: number; width: number };

export function CustomSelect({
  value,
  defaultValue = "",
  onChange,
  options,
  ariaLabel,
  name,
  disabled = false,
  className = ""
}: {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const currentValue = value ?? internalValue;
  const selected = options.find((option) => option.value === currentValue) ?? options[0];

  useEffect(() => {
    if (value === undefined) setInternalValue(defaultValue);
  }, [defaultValue, value]);

  function placeMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const visibleBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(250, Math.max(120, options.length * 42 + 12));
    setMenuPosition(
      visibleBelow < Math.min(menuHeight, 180) && rect.top > visibleBelow
        ? { left: rect.left, bottom: window.innerHeight - rect.top + 8, width: rect.width }
        : { left: rect.left, top: rect.bottom + 8, width: rect.width }
    );
  }

  function toggleMenu() {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    placeMenu();
    setOpen(true);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function reposition() {
      if (open) placeMenu();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, options.length]);

  function selectOption(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        placeMenu();
        setOpen(true);
      }
    }
  }

  const isDark = className.includes("custom-select--dark");
  const menu = open && menuPosition && typeof document !== "undefined" ? createPortal(
    <div
      aria-label={ariaLabel}
      className={`custom-select__menu custom-select__menu--portal${isDark ? " custom-select__menu--dark" : ""}`}
      id={listboxId}
      ref={menuRef}
      role="listbox"
      style={menuPosition}
    >
      {options.map((option) => {
        const isSelected = option.value === currentValue;
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
    </div>,
    document.body
  ) : null;

  return (
    <div className={`custom-select${open ? " custom-select--open" : ""} ${className}`.trim()} ref={rootRef}>
      {name && <input name={name} type="hidden" value={currentValue} />}
      <button
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="custom-select__trigger"
        disabled={disabled}
        onClick={toggleMenu}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span>{selected?.label}</span>
        <ChevronDown aria-hidden="true" size={18} />
      </button>
      {menu}
    </div>
  );
}
