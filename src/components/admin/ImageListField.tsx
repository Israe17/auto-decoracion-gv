"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImageUp, Link2, Loader2, Star, Trash2 } from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { uploadAdminImage } from "@/lib/storage";
import {
  Borrador,
  EditorDeEncuadre,
  cargarBorrador,
  recortarBorrador
} from "@/components/admin/EncuadreImagen";

export function ImageListField({
  name,
  label,
  defaultValue,
  folder,
  ancho = 1100,
  alto = 1000,
  tarjeta
}: {
  name: string;
  /** Omitir cuando el encabezado del paso ya dice lo mismo. */
  label?: string;
  defaultValue: string[];
  folder: string;
  /** Medida del recuadro donde viven estas imagenes en el sitio. */
  ancho?: number;
  alto?: number;
  /** Datos base para la vista previa del card (se completan con lo que
      ya este escrito en el formulario al abrir el editor). */
  tarjeta?: { nombre?: string; categoria?: string };
}) {
  const inputId = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState<{ nombre?: string; categoria?: string; precio?: string }>();
  const [urls, setUrls] = useState<string[]>(defaultValue.filter(Boolean));
  // Al soltar varias fotos se encuadran UNA POR UNA: la primera entra al
  // editor y las demas esperan en cola.
  const [cola, setCola] = useState<File[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const url = borrador?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [borrador?.url]);

  // Lee lo que el dueno YA escribio en este mismo formulario (nombre,
  // precio, modo de venta) para que la vista previa del card muestre su
  // producto y no un generico.
  function leerFormulario() {
    if (!tarjeta) return;
    const form = raizRef.current?.closest("form");
    const valor = (campo: string) =>
      (form?.elements.namedItem(campo) as HTMLInputElement | null)?.value?.trim() || "";
    const precioCrudo = Number(valor("price"));
    const modo = valor("saleMode");
    setVista({
      nombre: valor("name") || tarjeta.nombre,
      categoria: tarjeta.categoria,
      precio:
        modo !== "quote_only" && precioCrudo > 0 ? formatCRC(precioCrudo) : "Consultar precio"
    });
  }

  async function abrirSiguiente(pendientes: File[]) {
    const [siguiente, ...resto] = pendientes;
    setCola(resto);
    if (!siguiente) {
      setBorrador(null);
      setTotal(0);
      return;
    }
    try {
      setBorrador(await cargarBorrador(siguiente));
    } catch {
      setError("No se pudo leer una de las imagenes.");
      abrirSiguiente(resto);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const imagenes = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!imagenes.length) {
      setError("Los archivos deben ser imagenes.");
      return;
    }
    setError(null);
    setTotal(imagenes.length);
    leerFormulario();
    abrirSiguiente(imagenes);
  }

  async function confirmarRecorte() {
    if (!borrador) return;
    setUploading(true);
    setError(null);
    try {
      const recorte = await recortarBorrador(borrador, ancho, alto);
      const url = await uploadAdminImage(recorte, folder);
      setUrls((current) => [...current, url]);
      abrirSiguiente(cola);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo subir la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  // La PRIMERA foto es la portada de la tarjeta: reordenar importa.
  function mover(index: number, delta: number) {
    setUrls((current) => {
      const destino = index + delta;
      if (destino < 0 || destino >= current.length) return current;
      const copia = [...current];
      [copia[index], copia[destino]] = [copia[destino], copia[index]];
      return copia;
    });
  }

  const posicion = total - cola.length;

  return (
    <div className="image-field" ref={raizRef}>
      {label && <span className="image-field__label">{label}</span>}

      <div
        className={`image-upload image-upload--list${dragging ? " image-upload--dragging" : ""}${
          uploading ? " image-upload--busy" : ""
        }`}
        onDragOver={(event: DragEvent) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event: DragEvent) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
      >
        {urls.length > 0 && !borrador && (
          <div className="image-upload__thumbs">
            {urls.map((url, index) => (
              <div key={`${url}-${index}`} className="image-upload__preview-card image-upload__preview-card--sm">
                <img src={url} alt="" className="image-upload__preview" />
                {index === 0 && (
                  <span className="image-upload__portada">
                    <Star size={11} /> Portada
                  </span>
                )}
                <div className="image-upload__overlay">
                  {index > 0 && (
                    <button
                      type="button"
                      className="image-upload__overlay-btn"
                      onClick={() => mover(index, -1)}
                      aria-label="Mover antes"
                    >
                      <ArrowLeft size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="image-upload__overlay-btn image-upload__overlay-btn--danger"
                    onClick={() => removeAt(index)}
                    aria-label="Quitar imagen"
                  >
                    <Trash2 size={16} />
                  </button>
                  {index < urls.length - 1 && (
                    <button
                      type="button"
                      className="image-upload__overlay-btn"
                      onClick={() => mover(index, 1)}
                      aria-label="Mover despues"
                    >
                      <ArrowRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {borrador ? (
          <EditorDeEncuadre
            borrador={borrador}
            ancho={ancho}
            alto={alto}
            ocupado={uploading}
            progreso={total > 1 ? `Foto ${posicion} de ${total}` : undefined}
            tarjeta={tarjeta ? vista ?? tarjeta : undefined}
            onCambiar={setBorrador}
            onConfirmar={confirmarRecorte}
            onCancelar={() => abrirSiguiente(cola)}
          />
        ) : (
          <label htmlFor={inputId} className="image-upload__dropzone image-upload__dropzone--compact">
            <span className="image-upload__icon">
              <ImageUp size={20} />
            </span>
            <strong>Arrastre imágenes aquí</strong>
            <span className="image-upload__hint">o haga clic para elegir archivos</span>
            <span className="image-upload__medida">Recuadro: {ancho}×{alto} px</span>
            <span className="image-upload__portada-pista">La primera foto será la portada de la tarjeta.</span>
          </label>
        )}

        {uploading && (
          <div className="image-upload__loading">
            <Loader2 size={20} className="image-upload__spinner" />
            Subiendo...
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <details className="image-field__avanzado">
        <summary>
          <Link2 size={13} /> Pegar URLs de imagen
        </summary>
        <textarea
          className="image-field__url"
          name={name}
          rows={2}
          value={urls.join("\n")}
          onChange={(event) => setUrls(event.target.value.split("\n"))}
          placeholder="una URL por línea"
        />
      </details>
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
