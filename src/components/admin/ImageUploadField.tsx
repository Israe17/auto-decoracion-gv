"use client";

import { ChangeEvent, DragEvent, useId, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
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
    } catch {
      setError("No se pudo subir la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label>
      {label}
      <div
        className={`image-upload${dragging ? " image-upload--dragging" : ""}`}
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
          <img src={value} alt="" className="image-upload__preview" />
        ) : (
          <span className="image-upload__placeholder">
            <ImageUp size={22} />
          </span>
        )}
        <div className="image-upload__body">
          <input
            name={name}
            value={value}
            required={required}
            onChange={(event) => setValue(event.target.value)}
            placeholder="https://... o arrastre una imagen aqui"
          />
          <label htmlFor={inputId} className="button button--secondary image-upload__button">
            {uploading ? <Loader2 size={16} className="image-upload__spinner" /> : <ImageUp size={16} />}
            {uploading ? "Subiendo..." : "Subir imagen"}
          </label>
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
      </div>
      {error && <span className="image-upload__error">{error}</span>}
    </label>
  );
}
