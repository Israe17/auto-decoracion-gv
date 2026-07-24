"use client";

import { ChangeEvent, DragEvent, useId, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { uploadAdminImage } from "@/lib/storage";

export function ImageListField({
  name,
  label,
  defaultValue,
  folder
}: {
  name: string;
  label: string;
  defaultValue: string[];
  folder: string;
}) {
  const inputId = useId();
  const [urls, setUrls] = useState<string[]>(defaultValue.filter(Boolean));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const images = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (!images.length) {
      setError("Los archivos deben ser imagenes.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded = await Promise.all(images.map((file) => uploadAdminImage(file, folder)));
      setUrls((current) => [...current, ...uploaded]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudieron subir una o mas imagenes. Intente de nuevo."
      );
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

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
        {urls.length > 0 && (
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

        <label htmlFor={inputId} className="image-upload__dropzone image-upload__dropzone--compact">
          <span className="image-upload__icon">
            <ImageUp size={20} />
          </span>
          <strong>Arrastre imágenes aquí</strong>
          <span className="image-upload__hint">o haga clic para elegir archivos</span>
        </label>

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
