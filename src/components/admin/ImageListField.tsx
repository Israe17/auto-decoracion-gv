"use client";

import { ChangeEvent, DragEvent, useId, useState } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
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
  const [urls, setUrls] = useState<string[]>(defaultValue);
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
    } catch {
      setError("No se pudieron subir una o mas imagenes. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label>{label}</label>
      <textarea
        name={name}
        rows={3}
        value={urls.join("\n")}
        onChange={(event) => setUrls(event.target.value.split("\n"))}
        placeholder="Una URL por linea, o suba imagenes abajo"
      />
      <div
        className={`image-upload image-upload--list${dragging ? " image-upload--dragging" : ""}`}
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
        <label htmlFor={inputId} className="button button--secondary image-upload__button">
          {uploading ? <Loader2 size={16} className="image-upload__spinner" /> : <ImageUp size={16} />}
          {uploading ? "Subiendo..." : "Subir imagenes"}
        </label>
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
        {urls.some(Boolean) && (
          <div className="image-upload__thumbs">
            {urls
              .map((url, index) => ({ url, index }))
              .filter((item) => item.url)
              .map(({ url, index }) => (
                <span key={`${url}-${index}`} className="image-upload__thumb">
                  <img src={url} alt="" />
                  <button type="button" onClick={() => removeAt(index)} aria-label="Quitar imagen">
                    <X size={13} />
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
