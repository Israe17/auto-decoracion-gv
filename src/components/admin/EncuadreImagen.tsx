"use client";

import { PointerEvent as ReactPointerEvent, useRef } from "react";
import { Check, Move, X } from "lucide-react";

// Editor de encuadre compartido por los campos de imagen del admin.
//
// La foto elegida se muestra dentro de un marco con la proporcion REAL
// del recuadro donde va a vivir en el sitio, con el mismo ajuste `cover`
// que usa la web. Se arrastra para acomodarla y al confirmar se recorta
// en un canvas con la MISMA matematica que object-position: lo que se ve
// en el marco es exactamente lo que se sube, y el sitio no necesita
// guardar ninguna posicion.

export type Borrador = {
  archivo: File;
  url: string;
  ancho: number;
  alto: number;
  // foco del encuadre en porcentajes, igual que object-position
  x: number;
  y: number;
};

export function cargarBorrador(archivo: File): Promise<Borrador> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () =>
      resolver({
        archivo,
        url,
        ancho: imagen.naturalWidth,
        alto: imagen.naturalHeight,
        x: 50,
        y: 50
      });
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No se pudo leer la imagen."));
    };
    imagen.src = url;
  });
}

export async function recortarBorrador(borrador: Borrador, ancho: number, alto: number): Promise<File> {
  const imagen = new Image();
  imagen.src = borrador.url;
  await imagen.decode();

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no permite recortar imagenes.");

  const escala = Math.max(ancho / borrador.ancho, alto / borrador.alto);
  const dw = borrador.ancho * escala;
  const dh = borrador.alto * escala;
  ctx.drawImage(imagen, (ancho - dw) * (borrador.x / 100), (alto - dh) * (borrador.y / 100), dw, dh);

  const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, "image/webp", 0.92));
  if (!blob) throw new Error("No se pudo generar el recorte.");
  const nombre = borrador.archivo.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
  return new File([blob], nombre, { type: "image/webp" });
}

export function EditorDeEncuadre({
  borrador,
  ancho,
  alto,
  ocupado,
  progreso,
  tarjeta,
  onCambiar,
  onConfirmar,
  onCancelar
}: {
  borrador: Borrador;
  ancho: number;
  alto: number;
  ocupado: boolean;
  /** "Foto 2 de 5" cuando hay una cola de imagenes. */
  progreso?: string;
  /** Con esto el marco se viste de tarjeta de producto REAL (mismas
      clases del sitio) y la foto se acomoda viendo el card completo. */
  tarjeta?: { nombre?: string; categoria?: string; precio?: string };
  onCambiar: (borrador: Borrador) => void;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const marcoRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);

  // Cuanto sobresale la foto del marco (px del marco) en cada eje con el
  // ajuste `cover`. Si no sobra nada en un eje, arrastrar ahi no hace
  // nada — igual que en la web.
  function sobrantes() {
    const marco = marcoRef.current?.getBoundingClientRect();
    if (!marco) return { x: 0, y: 0 };
    const escala = Math.max(marco.width / borrador.ancho, marco.height / borrador.alto);
    return {
      x: Math.max(0, borrador.ancho * escala - marco.width),
      y: Math.max(0, borrador.alto * escala - marco.height)
    };
  }

  function onPointerDown(event: ReactPointerEvent) {
    event.currentTarget.setPointerCapture(event.pointerId);
    arrastreRef.current = { x: event.clientX, y: event.clientY, fx: borrador.x, fy: borrador.y };
  }

  function onPointerMove(event: ReactPointerEvent) {
    const inicio = arrastreRef.current;
    if (!inicio) return;
    const sobra = sobrantes();
    // Arrastrar la foto hacia la derecha mueve el foco a la izquierda:
    // mismo gesto que mover una foto con el dedo.
    const nx = sobra.x ? inicio.fx - ((event.clientX - inicio.x) / sobra.x) * 100 : 50;
    const ny = sobra.y ? inicio.fy - ((event.clientY - inicio.y) / sobra.y) * 100 : 50;
    onCambiar({ ...borrador, x: Math.min(100, Math.max(0, nx)), y: Math.min(100, Math.max(0, ny)) });
  }

  function onPointerUp() {
    arrastreRef.current = null;
  }

  const chica = borrador.ancho < ancho || borrador.alto < alto;
  const calzaExacto = Math.abs(borrador.ancho / borrador.alto - ancho / alto) < 0.02;

  const marco = (
    <div
      ref={marcoRef}
      className={`image-editor__marco${tarjeta ? " product-card__image" : ""}`}
      style={{ aspectRatio: `${ancho} / ${alto}` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={borrador.url}
        alt=""
        draggable={false}
        style={{ objectPosition: `${borrador.x}% ${borrador.y}%` }}
      />
      {!calzaExacto && (
        <span className="image-editor__pista">
          <Move size={14} /> Arrastre para acomodar
        </span>
      )}
    </div>
  );

  return (
    <div className="image-editor">
      {progreso && <span className="image-editor__progreso">{progreso}</span>}

      {tarjeta ? (
        // Vista previa del card real: mismas clases que ProductCard, sin
        // enlaces. Lo que se acomoda aqui es lo que se vera en la tienda.
        <div className="image-editor__tarjeta">
          <article className="product-card image-editor__card">
            {marco}
            <div className="product-card__body">
              <div className="product-card__meta">
                <span className="product-card__category">
                  {tarjeta.categoria || "Categoría"}
                </span>
              </div>
              <h3 className="image-editor__nombre">{tarjeta.nombre || "Nombre del producto"}</h3>
              <div className="price-row">
                <strong>{tarjeta.precio || "Consultar precio"}</strong>
              </div>
            </div>
          </article>
        </div>
      ) : (
        marco
      )}

      <div className="image-editor__datos">
        <span>
          Su imagen: <strong>{borrador.ancho}×{borrador.alto} px</strong>
        </span>
        <span>
          Recuadro: <strong>{ancho}×{alto} px</strong>
        </span>
        {calzaExacto && <span className="image-editor__ok">Calza exacto</span>}
        {chica && (
          <span className="image-editor__aviso">Más pequeña que lo recomendado: puede verse borrosa.</span>
        )}
      </div>

      <div className="image-editor__acciones">
        <button
          className="button button--primary image-editor__boton"
          type="button"
          disabled={ocupado}
          onClick={onConfirmar}
        >
          <Check size={16} /> Usar así
        </button>
        <button
          className="button button--secondary image-editor__boton"
          type="button"
          disabled={ocupado}
          onClick={onCancelar}
        >
          <X size={16} /> Cancelar
        </button>
      </div>
    </div>
  );
}
