"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import {
  EVENTO_GUIA,
  EVENTO_GUIA_FIN,
  ModuloGuia,
  PasoGuia,
  RECORRIDOS,
  marcarGuiaVista
} from "@/lib/guia";

// Motor del recorrido guiado: vive UNA vez en el panel y escucha el evento
// `gv-guia`. Motor propio y no una libreria de tours porque el proyecto no
// usa Tailwind y todo sale de los tokens de globals.css: una libreria
// habria que repintarla entera igual.

type Caja = { top: number; left: number; width: number; height: number };

const MARGEN = 8;
const ANCHO_GLOBO = 340;

function medir(ancla: string): Caja | null {
  const nodo = document.querySelector<HTMLElement>(`[data-guia="${ancla}"]`);
  if (!nodo) return null;

  const r = nodo.getBoundingClientRect();
  // Ancla presente pero sin caja (pestaña oculta en movil, lista vacia):
  // ese paso no tiene nada que enseñar.
  if (r.width < 4 || r.height < 4) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function GuiaTour() {
  const [modulo, setModulo] = useState<ModuloGuia | null>(null);
  const [indice, setIndice] = useState(0);
  const [caja, setCaja] = useState<Caja | null>(null);
  const [montado, setMontado] = useState(false);
  // El globo se coloca con su alto REAL: calcular la posicion a ojo lo
  // sacaba de la pantalla en anclas altas (una tarjeta de oferta).
  const globoRef = useRef<HTMLDivElement>(null);
  const [altoGlobo, setAltoGlobo] = useState(0);

  useEffect(() => setMontado(true), []);

  // Solo los pasos cuya ancla existe de verdad en pantalla.
  const pasos: PasoGuia[] = useMemo(() => {
    if (!modulo || !montado) return [];
    return RECORRIDOS[modulo].pasos.filter((paso) => medir(paso.ancla));
  }, [modulo, montado]);

  const paso = pasos[indice];

  const cerrar = useCallback(() => {
    if (modulo) marcarGuiaVista(modulo);
    setModulo(null);
    setIndice(0);
    setCaja(null);
    window.dispatchEvent(new CustomEvent(EVENTO_GUIA_FIN));
  }, [modulo]);

  useEffect(() => {
    function alPedir(evento: Event) {
      const pedido = (evento as CustomEvent<ModuloGuia>).detail;
      setIndice(0);
      setCaja(null);
      setModulo(pedido);
    }

    window.addEventListener(EVENTO_GUIA, alPedir);
    return () => window.removeEventListener(EVENTO_GUIA, alPedir);
  }, []);

  // Lleva el ancla a la vista y la mide. Con Lenis de por medio,
  // `scrollIntoView` pelea con el scroll suave: se calcula la posicion y se
  // salta ahi de un solo, y se mide en el frame siguiente.
  useLayoutEffect(() => {
    if (!paso) return;

    let frame = 0;
    const nodo = document.querySelector<HTMLElement>(`[data-guia="${paso.ancla}"]`);
    if (nodo) {
      const r = nodo.getBoundingClientRect();
      const fuera = r.top < 90 || r.bottom > window.innerHeight - 90;
      if (fuera) {
        const destino = window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
        window.scrollTo({ top: Math.max(0, destino), behavior: "auto" });
      }
    }

    frame = window.requestAnimationFrame(() => setCaja(medir(paso.ancla)));
    return () => window.cancelAnimationFrame(frame);
  }, [paso]);

  useLayoutEffect(() => {
    if (globoRef.current) setAltoGlobo(globoRef.current.offsetHeight);
  }, [caja, paso]);

  // Si la ventana cambia de tamaño o el usuario scrollea, el foco sigue al
  // elemento en vez de quedarse en un hueco vacio.
  useEffect(() => {
    if (!paso) return;

    const seguir = () => setCaja(medir(paso.ancla));
    window.addEventListener("resize", seguir);
    window.addEventListener("scroll", seguir, { passive: true });
    return () => {
      window.removeEventListener("resize", seguir);
      window.removeEventListener("scroll", seguir);
    };
  }, [paso]);

  const avanzar = useCallback(() => {
    setIndice((actual) => {
      if (actual + 1 >= pasos.length) {
        cerrar();
        return actual;
      }
      return actual + 1;
    });
  }, [cerrar, pasos.length]);

  useEffect(() => {
    if (!modulo) return;

    function alTeclear(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrar();
      }
      if (evento.key === "ArrowRight" || evento.key === "Enter") {
        evento.preventDefault();
        avanzar();
      }
      if (evento.key === "ArrowLeft") {
        evento.preventDefault();
        setIndice((actual) => Math.max(0, actual - 1));
      }
    }

    document.addEventListener("keydown", alTeclear);
    return () => document.removeEventListener("keydown", alTeclear);
  }, [avanzar, cerrar, modulo]);

  // Un modulo sin ninguna ancla a la vista no abre nada Y NO se da por
  // visto: hoy la lista esta vacia, pero cuando tenga contenido la guia si
  // tiene algo que enseñar y debe salir entonces.
  useEffect(() => {
    if (modulo && montado && pasos.length === 0) {
      setModulo(null);
      setIndice(0);
      setCaja(null);
      window.dispatchEvent(new CustomEvent(EVENTO_GUIA_FIN));
    }
  }, [modulo, montado, pasos.length]);

  if (!montado || !modulo || !paso || !caja) return null;

  const anchoGlobo = Math.min(ANCHO_GLOBO, window.innerWidth - 24);
  const movil = window.innerWidth <= 640;
  const alto = altoGlobo || 240;

  // Debajo del ancla; si no cabe, encima; y pase lo que pase, dentro de la
  // pantalla (hay anclas mas altas que la ventana).
  let arriba = caja.top + caja.height + 14;
  if (arriba + alto > window.innerHeight - 12) arriba = caja.top - alto - 14;
  arriba = Math.min(Math.max(12, arriba), Math.max(12, window.innerHeight - alto - 12));

  const estiloGlobo: React.CSSProperties = movil
    ? { left: 12, right: 12, bottom: 12, width: "auto" }
    : {
        width: anchoGlobo,
        top: arriba,
        left: Math.min(
          Math.max(12, caja.left + caja.width / 2 - anchoGlobo / 2),
          window.innerWidth - anchoGlobo - 12
        )
      };

  return createPortal(
    <div className="guia" role="dialog" aria-modal="true" aria-label={RECORRIDOS[modulo].titulo}>
      {/* El foco es un solo recuadro con una sombra enorme: oscurece todo
          lo demas sin apilar capas ni recortes. */}
      <div
        className="guia__foco"
        style={{
          top: caja.top - MARGEN,
          left: caja.left - MARGEN,
          width: caja.width + MARGEN * 2,
          height: caja.height + MARGEN * 2
        }}
        aria-hidden="true"
      />

      <div className="guia__globo" ref={globoRef} style={estiloGlobo} data-lenis-prevent>
        <div className="guia__encabezado">
          <span>
            {RECORRIDOS[modulo].titulo} · Paso {indice + 1} de {pasos.length}
          </span>
          <button type="button" aria-label="Cerrar la guía" onClick={cerrar}>
            <X size={16} />
          </button>
        </div>

        <strong>{paso.titulo}</strong>
        <p>{paso.texto}</p>

        <div className="guia__pasos" aria-hidden="true">
          {pasos.map((otro, i) => (
            <span key={otro.ancla} className={i <= indice ? "is-active" : ""} />
          ))}
        </div>

        <div className="guia__acciones">
          <button type="button" className="guia__saltar" onClick={cerrar}>
            {indice === 0 ? "Saltar guía" : "Cerrar"}
          </button>
          <div>
            {indice > 0 && (
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setIndice((actual) => Math.max(0, actual - 1))}
              >
                <ArrowLeft size={16} /> Atrás
              </button>
            )}
            <button type="button" className="button button--primary" onClick={avanzar}>
              {indice + 1 >= pasos.length ? (
                <>
                  <Check size={16} /> Listo
                </>
              ) : (
                <>
                  Siguiente <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
