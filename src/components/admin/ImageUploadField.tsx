"use client";

import { ChangeEvent, DragEvent, useId, useState } from "react";
import { ImageUp, Loader2, Trash2 } from "lucide-react";
import { uploadAdminImage } from "@/lib/storage";

export function ImageUploadField({
  name,
  label,
  defaultValue,
  required,
  folder
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  folder: string;
}) {
  const inputId = useId();
  const [value, setValue] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const url = await uploadAdminImage(file, folder);
      setValue(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo subir la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="image-field">
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
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        {value ? (
          <div className="image-upload__preview-card">
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
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      <input
        className="image-field__url"
        name={name}
        value={value}
        required={required}
        onChange={(event) => setValue(event.target.value)}
        placeholder="o pegue una URL de imagen"
      />
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
