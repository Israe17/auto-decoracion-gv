"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useState } from "react";
import { ImageUp, Link2, Loader2, Trash2 } from "lucide-react";
import { uploadAdminImage } from "@/lib/storage";
import {
  Borrador,
  EditorDeEncuadre,
  cargarBorrador,
  recortarBorrador
} from "@/components/admin/EncuadreImagen";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  required,
  folder,
  ancho = 1200,
  alto = 800
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  folder: string;
  /** Medida del recuadro donde vive esta imagen en el sitio. */
  ancho?: number;
  alto?: number;
}) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue || "");
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pending = Boolean(borrador || uploading);

  // Si el mismo campo pasa de un registro a otro, su vista previa debe
  // seguir el valor real del registro y no conservar la imagen anterior.
  useEffect(() => {
    setValue(defaultValue || "");
    setBorrador(null);
    setError(null);
  }, [defaultValue]);

  // El object URL del borrador se libera al reemplazarlo o desmontar.
  useEffect(() => {
    const url = borrador?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [borrador?.url]);

  async function elegirArchivo(archivo: File | undefined) {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setError(null);
    try {
      setBorrador(await cargarBorrador(archivo));
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo leer la imagen.");
    }
  }

  async function confirmarRecorte() {
    if (!borrador) return;
    setUploading(true);
    setError(null);
    try {
      const recorte = await recortarBorrador(borrador, ancho, alto);
      const url = await uploadAdminImage(recorte, folder);
      setValue(url);
      setBorrador(null);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo subir la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="image-field" data-image-pending={pending ? "true" : undefined}>
      <span className="image-field__label">{label}</span>

      <div
        className={`image-upload${dragging ? " image-upload--dragging" : ""}${
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
          elegirArchivo(event.dataTransfer.files?.[0]);
        }}
      >
        {borrador ? (
          <EditorDeEncuadre
            borrador={borrador}
            ancho={ancho}
            alto={alto}
            ocupado={uploading}
            onCambiar={setBorrador}
            onConfirmar={confirmarRecorte}
            onCancelar={() => setBorrador(null)}
          />
        ) : value ? (
          <div className="image-upload__preview-card" style={{ aspectRatio: `${ancho} / ${alto}` }}>
            <img key={value} src={value} alt="" className="image-upload__preview" />
            <div className="image-upload__overlay">
              <label htmlFor={inputId} className="image-upload__overlay-btn">
                <ImageUp size={16} /> Cambiar
              </label>
              <button
                type="button"
                className="image-upload__overlay-btn image-upload__overlay-btn--danger"
                onClick={() => setValue("")}
              >
                <Trash2 size={16} /> Quitar
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor={inputId} className="image-upload__dropzone">
            <span className="image-upload__icon">
              <ImageUp size={24} />
            </span>
            <strong>Arrastre una imagen aquí</strong>
            <span className="image-upload__hint">o haga clic para elegir un archivo</span>
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
          hidden
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            elegirArchivo(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      {/* Via avanzada plegada. El input sigue montado siempre: el
          formulario lee este campo al guardar. */}
      <details className="image-field__avanzado">
        <summary>
          <Link2 size={13} /> Pegar URL de imagen
        </summary>
        <input
          className="image-field__url"
          name={name}
          value={value}
          required={required}
          onChange={(event) => setValue(event.target.value)}
          // Este input vive plegado dentro del <details>, asi que el globo
          // del navegador no se ve: sin esto el formulario se quedaba
          // trabado sin explicar que faltaba la foto.
          onInvalid={() => setError("Suba la foto antes de guardar.")}
          placeholder="https://..."
        />
      </details>
      {pending && (
        <span className="image-upload__pending" role="status">
          Confirme el recorte con “Usar así” antes de continuar.
        </span>
      )}
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
