"use client";

import { ChangeEvent, DragEvent, useEffect, useId, useRef, useState } from "react";
import { ImageUp, Link2, Loader2, Move, Star, Trash2 } from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { uploadAdminImage } from "@/lib/storage";
import {
  Borrador,
  EditorDeEncuadre,
  cargarBorrador,
  cargarBorradorDeUrl,
  focoDeBorrador,
  prepararOriginal
} from "@/components/admin/EncuadreImagen";

export function ImageListField({
  name,
  focusName,
  label,
  defaultValue,
  defaultFocus,
  folder,
  ancho = 1100,
  alto = 1000,
  max = 8,
  tarjeta
}: {
  name: string;
  /** Campo oculto donde viaja el encuadre de cada foto (JSON). */
  focusName: string;
  /** Omitir cuando el encabezado del paso ya dice lo mismo. */
  label?: string;
  defaultValue: string[];
  defaultFocus?: Record<string, string>;
  folder: string;
  /** Medida del recuadro donde viven estas imagenes en el sitio. */
  ancho?: number;
  alto?: number;
  /** Cuantas fotos admite la galeria de este elemento. */
  max?: number;
  /** Datos base para la vista previa del card (se completan con lo que
      ya este escrito en el formulario al abrir el editor). */
  tarjeta?: { nombre?: string; categoria?: string };
}) {
  const inputId = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState<{ nombre?: string; categoria?: string; precio?: string }>();
  const [urls, setUrls] = useState<string[]>(defaultValue.filter(Boolean).slice(0, max));
  // Encuadre por foto, con la URL como llave: reordenar o quitar no lo
  // descuadra.
  const [focos, setFocos] = useState<Record<string, string>>(defaultFocus || {});
  // Al soltar varias fotos se encuadran UNA POR UNA: la primera entra al
  // editor y las demas esperan en cola.
  const [cola, setCola] = useState<File[]>([]);
  const [borrador, setBorrador] = useState<Borrador | null>(null);
  // Cuando se reabre el encuadre de una foto YA subida, aqui va su URL.
  const [acomodando, setAcomodando] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pending = Boolean(borrador || uploading || cola.length);

  useEffect(() => {
    // Solo se liberan los blobs de archivos nuevos; las fotos ya subidas
    // se abren por su URL de siempre.
    const url = borrador?.archivo ? borrador.url : undefined;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [borrador?.url, borrador?.archivo]);

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
    setAcomodando(null);
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

    // Solo entran las que caben: mejor avisar aqui que dejar al dueño
    // encuadrando fotos que despues se iban a descartar.
    const espacio = max - urls.length;
    if (espacio <= 0) {
      setError(`Ya tiene el maximo de ${max} fotos. Quite alguna para agregar otra.`);
      return;
    }

    const entran = imagenes.slice(0, espacio);
    setError(
      entran.length < imagenes.length
        ? `Caben ${max} fotos: se tomaron las primeras ${entran.length}.`
        : null
    );
    setTotal(entran.length);
    leerFormulario();
    abrirSiguiente(entran);
  }

  // Sube la foto TAL CUAL y guarda aparte el encuadre elegido.
  async function confirmarFoto() {
    if (!borrador) return;

    // Reacomodar una foto que ya está subida: no se vuelve a subir nada.
    if (acomodando) {
      setFocos((current) => ({ ...current, [acomodando]: focoDeBorrador(borrador) }));
      setBorrador(null);
      setAcomodando(null);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const original = await prepararOriginal(borrador);
      const url = await uploadAdminImage(original, folder);
      const foco = focoDeBorrador(borrador);
      setUrls((current) => [...current, url].slice(0, max));
      setFocos((current) => ({ ...current, [url]: foco }));
      abrirSiguiente(cola);
    } catch (fallo) {
      setError(fallo instanceof Error ? fallo.message : "No se pudo subir la imagen. Intente de nuevo.");
    } finally {
      setUploading(false);
    }
  }

  async function acomodar(url: string) {
    setError(null);
    leerFormulario();
    try {
      setAcomodando(url);
      setBorrador(await cargarBorradorDeUrl(url, focos[url]));
    } catch {
      setAcomodando(null);
      setError("No se pudo abrir esa foto para acomodarla.");
    }
  }

  function removeAt(index: number) {
    setUrls((current) => current.filter((_, i) => i !== index));
  }

  // La PRIMERA foto es la portada de la tarjeta: se elige de un toque, sin
  // tener que ir moviendola de puesto una por una.
  function hacerPortada(index: number) {
    setUrls((current) => {
      if (index <= 0 || index >= current.length) return current;
      const copia = [...current];
      const [elegida] = copia.splice(index, 1);
      return [elegida, ...copia];
    });
  }

  const posicion = total - cola.length;

  return (
    <div
      className="image-field"
      ref={raizRef}
      data-image-pending={pending ? "true" : undefined}
    >
      <div className="image-field__cabecera">
        {label && <span className="image-field__label">{label}</span>}
        <span className={`image-field__cuenta${urls.length >= max ? " is-lleno" : ""}`}>
          {urls.length} de {max} fotos
        </span>
      </div>

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
              <div
                key={`${url}-${index}`}
                className={`image-upload__preview-card image-upload__preview-card--sm${
                  index === 0 ? " is-portada" : ""
                }`}
              >
                {/* La miniatura se ve con SU encuadre: lo que se acomoda
                    aqui es lo que sale en la tienda. */}
                <img
                  src={url}
                  alt=""
                  className="image-upload__preview"
                  style={{ objectPosition: focos[url] || "50% 50%" }}
                />
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
                      onClick={() => hacerPortada(index)}
                      aria-label="Usar como portada"
                      title="Usar como portada"
                    >
                      <Star size={15} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="image-upload__overlay-btn"
                    onClick={() => acomodar(url)}
                    aria-label="Acomodar la foto"
                    title="Acomodar la foto"
                  >
                    <Move size={15} />
                  </button>
                  <button
                    type="button"
                    className="image-upload__overlay-btn image-upload__overlay-btn--danger"
                    onClick={() => removeAt(index)}
                    aria-label="Quitar imagen"
                    title="Quitar imagen"
                  >
                    <Trash2 size={15} />
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
            completa
            etiquetaConfirmar={acomodando ? "Guardar encuadre" : "Usar así"}
            progreso={
              acomodando
                ? "Acomodando una foto ya subida"
                : total > 1
                  ? `Foto ${posicion} de ${total}`
                  : undefined
            }
            tarjeta={tarjeta ? vista ?? tarjeta : undefined}
            onCambiar={setBorrador}
            onConfirmar={confirmarFoto}
            onCancelar={() => (acomodando ? (setBorrador(null), setAcomodando(null)) : abrirSiguiente(cola))}
          />
        ) : (
          <label
            htmlFor={inputId}
            className={`image-upload__dropzone image-upload__dropzone--compact${
              urls.length >= max ? " is-lleno" : ""
            }`}
          >
            <span className="image-upload__icon">
              <ImageUp size={20} />
            </span>
            {urls.length >= max ? (
              <>
                <strong>Ya tiene las {max} fotos</strong>
                <span className="image-upload__hint">Quite alguna si quiere cambiarla por otra.</span>
              </>
            ) : (
              <>
                <strong>Arrastre las fotos aquí</strong>
                <span className="image-upload__hint">
                  o haga clic para elegirlas — puede escoger varias de una vez (faltan{" "}
                  {max - urls.length})
                </span>
              </>
            )}
            <span className="image-upload__medida">Recuadro del sitio: {ancho}×{alto} px</span>
            <span className="image-upload__portada-pista">
              La foto se guarda completa: usted elige qué parte se ve y puede cambiarlo cuando
              quiera. La portada es la primera, y se cambia con la estrella.
            </span>
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

      {/* Solo viajan los encuadres de las fotos que siguen en la lista. */}
      <input
        type="hidden"
        name={focusName}
        value={JSON.stringify(
          Object.fromEntries(urls.filter((url) => focos[url]).map((url) => [url, focos[url]]))
        )}
      />

      <details className="image-field__avanzado">
        <summary>
          <Link2 size={13} /> Pegar URLs de imagen
        </summary>
        <textarea
          className="image-field__url"
          name={name}
          rows={2}
          value={urls.join("\n")}
          onChange={(event) => setUrls(event.target.value.split("\n").slice(0, max))}
          placeholder="una URL por línea"
        />
      </details>
      {pending && (
        <span className="image-upload__pending" role="status">
          Confirme cada foto antes de continuar.
        </span>
      )}
      {error && <span className="image-upload__error">{error}</span>}
    </div>
  );
}
