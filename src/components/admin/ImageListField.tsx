"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
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
  alto = 1000
}: {
  name: string;
  label: string;
  defaultValue: string[];
  folder: string;
  /** Medida del recuadro donde viven estas imagenes en el sitio. */
  ancho?: number;
  alto?: number;
}) {
  const inputId = useId();
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

  const posicion = total - cola.length;

  return (
    <div className="image-field">
      <span className="image-field__label">{label}</span>

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
                <div className="image-upload__overlay">
                  <button
                    type="button"
                    className="image-upload__overlay-btn image-upload__overlay-btn--danger"
                    onClick={() => removeAt(index)}
                    aria-label="Quitar imagen"
                  >
                    <Trash2 size={16} />
                  </button>
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

      <textarea
        className="image-field__url"
        name={name}
        rows={2}
        value={urls.join("\n")}
        onChange={(event) => setUrls(event.target.value.split("\n"))}
        placeholder="o pegue una URL por linea"
      />
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
