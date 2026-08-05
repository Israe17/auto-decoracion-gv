"use client";

import { useState } from "react";
import { Loader2, Move, Star } from "lucide-react";
import { Product } from "@/types";
import { encuadreDe } from "@/lib/catalog";
import {
  Borrador,
  EditorDeEncuadre,
  cargarBorradorDeUrl,
  focoDeBorrador
} from "@/components/admin/EncuadreImagen";

// Las fotos del producto dentro del detalle del panel: se ven con SU
// encuadre y se pueden reacomodar en el momento, sin entrar a editar el
// producto ni volver a subir nada.
export function AdminDetailFotos({
  product,
  onGuardar
}: {
  product: Product;
  onGuardar: (imageFocus: Record<string, string>) => Promise<void>;
}) {
  const [focos, setFocos] = useState<Record<string, string>>(product.imageFocus || {});
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function abrir(url: string) {
    setError(null);
    try {
      setEditando(url);
      setBorrador(await cargarBorradorDeUrl(url, focos[url]));
    } catch {
      setEditando(null);
      setError("No se pudo abrir esa foto para acomodarla.");
    }
  }

  async function guardar() {
    if (!borrador || !editando) return;
    const siguiente = { ...focos, [editando]: focoDeBorrador(borrador) };
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(siguiente);
      setFocos(siguiente);
      setBorrador(null);
      setEditando(null);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo guardar el encuadre.");
    } finally {
      setGuardando(false);
    }
  }

  if (!product.images.length) return null;

  return (
    <section className="admin-detail-section">
      <h3>
        Fotos
        <span className="admin-detail-section__count">{product.images.length}</span>
      </h3>

      {borrador ? (
        <div className="admin-detail-encuadre">
          <EditorDeEncuadre
            borrador={borrador}
            ancho={1100}
            alto={1000}
            ocupado={guardando}
            completa
            etiquetaConfirmar="Guardar encuadre"
            progreso="Acomodando esta foto"
            tarjeta={{ nombre: product.name, categoria: product.categoryName }}
            onCambiar={setBorrador}
            onConfirmar={guardar}
            onCancelar={() => {
              setBorrador(null);
              setEditando(null);
            }}
          />
          {guardando && (
            <span className="admin-detail-fotos__guardando">
              <Loader2 size={15} className="image-upload__spinner" /> Guardando…
            </span>
          )}
        </div>
      ) : (
        <div className="admin-detail-fotos">
          {product.images.map((url, index) => (
            <figure
              key={`${url}-${index}`}
              className={`admin-detail-foto${index === 0 ? " is-portada" : ""}`}
            >
              <img
                src={url}
                alt=""
                style={{ objectPosition: encuadreDe({ imageFocus: focos }, url) }}
              />
              {index === 0 && (
                <figcaption className="admin-detail-foto__portada">
                  <Star size={11} /> Portada
                </figcaption>
              )}
              <button
                type="button"
                className="admin-detail-foto__accion"
                onClick={() => abrir(url)}
                aria-label={`Acomodar la foto ${index + 1}`}
                title="Acomodar la foto"
              >
                <Move size={15} />
              </button>
            </figure>
          ))}
        </div>
      )}

      {!borrador && (
        <p className="admin-detail-fotos__pista">
          La foto está guardada entera. Con el cursor de mover elige qué parte se ve en la
          tienda, y se puede cambiar las veces que quiera. Para agregar o quitar fotos, o
          cambiar la portada, use «Editar».
        </p>
      )}
      {error && <span className="image-upload__error">{error}</span>}
    </section>
  );
}
