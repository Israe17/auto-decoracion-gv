"use client";

import { MouseEvent, PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

// Galeria del detalle de producto, patron Airbnb: en movil la foto va a
// sangre completa con un contador "1/N" y el volver flota encima en un
// circulo de vidrio; se desliza con el dedo (scroll-snap real, sin JS de
// gestos). En escritorio la misma pista funciona con las miniaturas
// como control: tocar una desplaza la pista hasta esa foto.
//
// Ademas: la foto se amplia al pasar el mouse (el zoom sigue al cursor),
// se abre a pantalla completa al tocarla, y la tira de miniaturas se
// desliza con flechas o con la rueda.
export function ProductPhotos({
  images,
  focos,
  name,
  discount
}: {
  images: string[];
  /** Encuadre guardado por foto (`object-position`). La foto esta entera:
      esto solo dice que parte se ve dentro del recuadro. */
  focos?: Record<string, string>;
  name: string;
  discount: number;
}) {
  const foco = (image: string) => focos?.[image] || "50% 50%";
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);
  // Indice abierto a pantalla completa; null = visor cerrado.
  const [visor, setVisor] = useState<number | null>(null);
  const [tira, setTira] = useState({ izquierda: false, derecha: false });

  // El contador sigue al scroll: la foto activa es la mas cercana al
  // borde izquierdo de la pista.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setActiva(Math.round(track.scrollLeft / track.clientWidth));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const irA = useCallback((index: number) => {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  // --- Tira de miniaturas ---

  // Si la tira se sale por algun lado, hay flecha de ese lado. Se recalcula
  // al scrollear, al cambiar de tamaño la ventana y al cargar las fotos.
  const medirTira = useCallback(() => {
    const el = thumbsRef.current;
    if (!el) return;
    const sobra = el.scrollWidth - el.clientWidth;
    setTira({
      izquierda: el.scrollLeft > 4,
      derecha: sobra > 4 && el.scrollLeft < sobra - 4
    });
  }, []);

  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;
    medirTira();
    el.addEventListener("scroll", medirTira, { passive: true });
    window.addEventListener("resize", medirTira);
    // Las miniaturas de next/image llegan tarde y cambian el ancho util.
    const t = window.setTimeout(medirTira, 500);
    return () => {
      el.removeEventListener("scroll", medirTira);
      window.removeEventListener("resize", medirTira);
      window.clearTimeout(t);
    };
  }, [medirTira, images.length]);

  function correrTira(sentido: 1 | -1) {
    const el = thumbsRef.current;
    if (!el) return;
    el.scrollBy({ left: sentido * Math.max(el.clientWidth * 0.8, 160), behavior: "smooth" });
  }

  // Con la rueda vertical sobre la tira, se corre de lado: es lo que
  // espera quien usa mouse, que no tiene eje horizontal.
  //
  // El listener se pone a mano y con `passive: false`: React registra
  // `wheel` como pasivo, asi que desde `onWheel` el `preventDefault` no
  // hace nada y la pagina bajaria al mismo tiempo que corre la tira.
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;

    function onWheel(event: WheelEvent) {
      const tira = thumbsRef.current;
      if (!tira || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const sobra = tira.scrollWidth - tira.clientWidth;
      if (sobra <= 0) return;
      // Solo se traga el gesto si la tira todavia puede correr hacia ese
      // lado; si no, se deja pasar y la pagina sigue bajando.
      const haciaAdelante = event.deltaY > 0;
      if (
        (haciaAdelante && tira.scrollLeft >= sobra - 1) ||
        (!haciaAdelante && tira.scrollLeft <= 1)
      ) {
        return;
      }
      event.preventDefault();
      tira.scrollLeft += event.deltaY;
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [images.length]);

  // La miniatura activa se mantiene a la vista sin mover la pagina: se
  // desplaza SOLO la tira (con Lenis, `scrollIntoView` arrastraria toda la
  // ventana).
  useEffect(() => {
    const el = thumbsRef.current;
    const boton = el?.children[activa] as HTMLElement | undefined;
    if (!el || !boton) return;
    const izq = boton.offsetLeft;
    const der = izq + boton.offsetWidth;
    if (izq < el.scrollLeft) el.scrollTo({ left: izq - 12, behavior: "smooth" });
    else if (der > el.scrollLeft + el.clientWidth) {
      el.scrollTo({ left: der - el.clientWidth + 12, behavior: "smooth" });
    }
  }, [activa]);

  // --- Zoom que sigue al cursor ---

  function moverZoom(event: MouseEvent<HTMLElement>) {
    const el = event.currentTarget;
    const caja = el.getBoundingClientRect();
    el.style.setProperty("--zx", `${((event.clientX - caja.left) / caja.width) * 100}%`);
    el.style.setProperty("--zy", `${((event.clientY - caja.top) / caja.height) * 100}%`);
  }

  // --- Abrir a pantalla completa ---

  // Guarda el punto donde empezo el gesto: en movil la pista se desliza
  // con el dedo y ese arrastre termina en `click`. Sin esto, pasar de foto
  // abriria el visor.
  const inicio = useRef<{ x: number; y: number } | null>(null);

  function alBajar(event: PointerEvent<HTMLElement>) {
    inicio.current = { x: event.clientX, y: event.clientY };
  }

  function abrirVisor(index: number, event: MouseEvent<HTMLElement>) {
    const p = inicio.current;
    if (p && Math.hypot(event.clientX - p.x, event.clientY - p.y) > 8) return;
    setVisor(index);
  }

  const cerrarVisor = useCallback(() => {
    setVisor((abierto) => {
      // Al cerrar, la pista se queda en la foto que se estaba viendo.
      if (abierto !== null) irA(abierto);
      return null;
    });
  }, [irA]);

  useEffect(() => {
    if (visor === null) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") cerrarVisor();
      if (event.key === "ArrowRight") setVisor((i) => (i === null ? i : (i + 1) % images.length));
      if (event.key === "ArrowLeft") {
        setVisor((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previo;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [visor, images.length, cerrarVisor]);

  return (
    <div className="product-gallery">
      <div className="product-fotos">
        <Link href="/catalogo" className="product-fotos__volver" aria-label="Volver al catálogo">
          <ArrowLeft size={19} />
        </Link>

        {discount > 0 && <span className="badge badge--discount">−{discount}%</span>}

        <div className="product-fotos__pista" ref={trackRef}>
          {images.map((image, index) => (
            <button
              type="button"
              className="product-fotos__foto"
              key={`${image}-${index}`}
              onMouseMove={moverZoom}
              onPointerDown={alBajar}
              onClick={(event) => abrirVisor(index, event)}
              aria-label={`Ampliar la foto ${index + 1} de ${name}`}
            >
              <Image
                src={image}
                alt={index === 0 ? name : `${name} — foto ${index + 1}`}
                fill
                sizes="(max-width: 980px) 100vw, 55vw"
                priority={index === 0}
                style={{ objectPosition: foco(image) }}
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <span className="product-fotos__contador" aria-live="polite">
            {Math.min(activa + 1, images.length)} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery__tira">
          <button
            type="button"
            className="product-gallery__flecha"
            onClick={() => correrTira(-1)}
            disabled={!tira.izquierda}
            aria-label="Ver las fotos anteriores"
          >
            <ChevronLeft size={18} />
          </button>

          <div
            className="product-gallery__thumbs"
            ref={thumbsRef}
            /* Lenis escucha la rueda en `window`: sin esto el
               `preventDefault` de aqui no lo frena y la pagina baja a la
               vez que corre la tira. Cuando la tira llega al tope el
               gesto se deja pasar y la pagina sigue bajando. */
            data-lenis-prevent
            aria-label="Imagenes del producto"
          >
            {images.map((image, index) => (
              <button
                type="button"
                key={`th-${image}-${index}`}
                className={index === activa ? "is-activa" : undefined}
                onClick={() => irA(index)}
                aria-label={`Ver foto ${index + 1}`}
                aria-current={index === activa}
              >
                <Image src={image} alt="" fill sizes="110px" style={{ objectPosition: foco(image) }} />
              </button>
            ))}
          </div>

          <button
            type="button"
            className="product-gallery__flecha"
            onClick={() => correrTira(1)}
            disabled={!tira.derecha}
            aria-label="Ver las fotos siguientes"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {visor !== null &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="visor" role="dialog" aria-modal="true" aria-label={`Fotos de ${name}`}>
            <button
              type="button"
              className="visor__dismiss"
              aria-label="Cerrar"
              onClick={cerrarVisor}
            />
            <div className="visor__marco" data-lenis-prevent>
              <Image
                src={images[visor]}
                alt={`${name} — foto ${visor + 1}`}
                fill
                sizes="100vw"
                priority
              />
            </div>

            <button type="button" className="visor__cerrar" aria-label="Cerrar" onClick={cerrarVisor}>
              <X size={20} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="visor__nav visor__nav--prev"
                  aria-label="Foto anterior"
                  onClick={() => setVisor((i) => (i! - 1 + images.length) % images.length)}
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="visor__nav visor__nav--next"
                  aria-label="Foto siguiente"
                  onClick={() => setVisor((i) => (i! + 1) % images.length)}
                >
                  <ChevronRight size={22} />
                </button>
                <span className="visor__contador">
                  {visor + 1} / {images.length}
                </span>
              </>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
