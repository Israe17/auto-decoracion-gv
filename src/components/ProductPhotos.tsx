"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Galeria del detalle de producto, patron Airbnb: en movil la foto va a
// sangre completa con un contador "1/N" y el volver flota encima en un
// circulo de vidrio; se desliza con el dedo (scroll-snap real, sin JS de
// gestos). En escritorio la misma pista funciona con las miniaturas
// como control: tocar una desplaza la pista hasta esa foto.
export function ProductPhotos({
  images,
  name,
  discount
}: {
  images: string[];
  name: string;
  discount: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);

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

  function irA(index: number) {
    const track = trackRef.current;
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="product-gallery">
      <div className="product-fotos">
        <Link href="/catalogo" className="product-fotos__volver" aria-label="Volver al catálogo">
          <ArrowLeft size={19} />
        </Link>

        {discount > 0 && <span className="badge badge--discount">−{discount}%</span>}

        <div className="product-fotos__pista" ref={trackRef}>
          {images.map((image, index) => (
            <div className="product-fotos__foto" key={`${image}-${index}`}>
              <Image
                src={image}
                alt={index === 0 ? name : `${name} — foto ${index + 1}`}
                fill
                sizes="(max-width: 980px) 100vw, 55vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <span className="product-fotos__contador" aria-live="polite">
            {Math.min(activa + 1, images.length)} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="product-gallery__thumbs" aria-label="Imagenes del producto">
          {images.map((image, index) => (
            <button
              type="button"
              key={`th-${image}-${index}`}
              className={index === activa ? "is-activa" : undefined}
              onClick={() => irA(index)}
              aria-label={`Ver foto ${index + 1}`}
            >
              <Image src={image} alt="" fill sizes="110px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
