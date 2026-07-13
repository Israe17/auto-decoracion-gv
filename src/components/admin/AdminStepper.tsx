"use client";

import { Children, ReactNode, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Save } from "lucide-react";

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function AdminStepper({
  steps,
  children,
  submitLabel
}: {
  steps: string[];
  children: ReactNode;
  submitLabel: string;
}) {
  const [step, setStep] = useState(0);
  const panelsRef = useRef<HTMLDivElement>(null);
  const panels = Children.toArray(children);

  function validateCurrent() {
    const panel = panelsRef.current?.children[step];
    if (!panel) return true;
    const fields = Array.from(panel.querySelectorAll<Field>("input, select, textarea"));
    const invalid = fields.find((field) => !field.checkValidity());
    if (!invalid) return true;
    invalid.reportValidity();
    invalid.focus();
    return false;
  }

  function advance() {
    if (validateCurrent()) setStep((current) => Math.min(steps.length - 1, current + 1));
  }

  function submit() {
    if (validateCurrent()) panelsRef.current?.closest("form")?.requestSubmit();
  }

  return (
    <div className="admin-stepper">
      <div className="admin-stepper__progress" aria-label={`Paso ${step + 1} de ${steps.length}`}>
        {steps.map((label, index) => (
          <span key={label} className={index <= step ? "is-active" : ""} />
        ))}
      </div>
      <p className="admin-stepper__count">Paso {step + 1} de {steps.length}</p>
      <h3 className="admin-stepper__title">{steps[step]}</h3>

      <div className="admin-stepper__panels" ref={panelsRef}>
        {panels.map((panel, index) => (
          <section key={index} className="admin-stepper__panel" hidden={index !== step}>
            {panel}
          </section>
        ))}
      </div>

      <div className="admin-stepper__nav">
        {step > 0 && (
          <button type="button" className="button button--secondary" onClick={() => setStep((current) => current - 1)}>
            <ChevronLeft size={18} /> Atrás
          </button>
        )}
        {step < steps.length - 1 ? (
          <button type="button" className="button button--primary" onClick={advance}>
            Continuar <ArrowRight size={18} />
          </button>
        ) : (
          <button type="button" className="button button--primary" onClick={submit}>
            <Save size={18} /> {submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
