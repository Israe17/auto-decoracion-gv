import { ContactRequest, Product, QuoteItem, SaleMode } from "@/types";
import { business } from "./business";
import { formatCRC, productHasPublicPrice } from "./catalog";
import { siteUrl } from "./seo";
import type { ClienteGuardado } from "./cliente";
import type { VehiculoCliente } from "./vehiculo";

// El numero vive en business.ts, no en una variable de entorno: asi cambiarlo
// es un commit y no depende de la configuracion del despliegue.
const businessNumber = business.whatsappNumber;
const SALUDO = "Hola Auto Decoración G&V";

export function whatsAppUrl(message: string) {
  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}

// --- Piezas compartidas: todos los mensajes se ven igual -------------------

// `null` descarta la linea; `""` SI se conserva, es un renglon en blanco
// que separa los bloques del mensaje.
function texto(lineas: (string | null | undefined)[]) {
  return lineas.filter((linea) => typeof linea === "string").join("\n");
}

/** Con vehiculo elegido lo escribe; sin el, deja las lineas para completar. */
function bloqueVehiculo(vehiculo?: VehiculoCliente | null) {
  const partes = [vehiculo?.make, vehiculo?.model, vehiculo?.year]
    .map((parte) => (parte || "").trim())
    .filter(Boolean);

  if (partes.length) return [`🚗 Vehículo: ${partes.join(" ")}`];
  return ["🚗 Mi vehículo es:", "Marca:", "Modelo:", "Año:"];
}

/** Nunca imprime ₡0: sin precio publico el producto va "a consultar". */
function lineaPrecio(item: { saleMode: SaleMode; price?: number; oldPrice?: number }) {
  if (!productHasPublicPrice(item)) return "💰 Precio: a consultar";

  const precio = formatCRC(item.price);
  if (item.oldPrice && item.oldPrice > (item.price as number)) {
    const ahorro = item.oldPrice - (item.price as number);
    return `💰 Precio: ${precio} (antes ${formatCRC(item.oldPrice)} · ahorra ${formatCRC(ahorro)})`;
  }
  return `💰 Precio: ${precio}`;
}

/** Quien escribe. Vacio cuando el cliente aun no dejo sus datos. */
function bloqueCliente(cliente?: ClienteGuardado | null) {
  if (!cliente?.name?.trim()) return [];
  return [
    `🙋 Nombre: ${cliente.name.trim()}`,
    cliente.phone?.trim() ? `📞 Teléfono: ${cliente.phone.trim()}` : null,
    ""
  ].filter((linea): linea is string => linea !== null);
}

function enlaceFicha(slug: string) {
  return `${siteUrl}/productos/${slug}`;
}

function marcaDelProducto(product: Pick<Product, "isOwnBrand" | "brandName">) {
  if (product.isOwnBrand) return "G&V System (línea propia)";
  return product.brandName || "";
}

// --- Mensajes del sitio ----------------------------------------------------

export function generalWhatsAppUrl(vehiculo?: VehiculoCliente | null) {
  const partes = [vehiculo?.make, vehiculo?.model, vehiculo?.year]
    .map((parte) => (parte || "").trim())
    .filter(Boolean);

  return whatsAppUrl(
    texto([
      `${SALUDO}, quiero información sobre un producto o servicio.`,
      partes.length ? "" : null,
      partes.length ? `🚗 Mi vehículo: ${partes.join(" ")}` : null
    ])
  );
}

export function serviceWhatsAppUrl(service: string, vehiculo?: VehiculoCliente | null) {
  return whatsAppUrl(
    texto([
      `${SALUDO}, quiero cotizar un servicio del taller.`,
      "",
      `🛠️ Servicio: ${service}`,
      "",
      ...bloqueVehiculo(vehiculo)
    ])
  );
}

export function contactWhatsAppUrl(data: {
  name: string;
  phone: string;
  vehicle: string;
  message: string;
}) {
  return whatsAppUrl(
    texto([
      `${SALUDO}, ando buscando algo que no encontré en el catálogo.`,
      "",
      `🙋 Nombre: ${data.name}`,
      data.phone ? `📞 Teléfono: ${data.phone}` : null,
      data.vehicle ? `🚗 Vehículo: ${data.vehicle}` : null,
      "",
      `🔎 Lo que busco: ${data.message}`
    ])
  );
}

export function productWhatsAppUrl(
  product: Product,
  vehiculo?: VehiculoCliente | null,
  cliente?: ClienteGuardado | null
) {
  const marca = marcaDelProducto(product);
  const compatibilidad =
    product.compatibilityMode === "universal"
      ? "Universal / varios vehículos"
      : product.vehicles
          .map((vehicle) => {
            const anos =
              vehicle.fromYear && vehicle.toYear ? ` ${vehicle.fromYear}-${vehicle.toYear}` : "";
            return `${vehicle.make} ${vehicle.model}${anos}`;
          })
          .join(", ");

  return whatsAppUrl(
    texto([
      `${SALUDO}, quiero cotizar este producto.`,
      "",
      ...bloqueCliente(cliente),
      `🛒 ${product.name}`,
      `🏷️ Categoría: ${product.categoryName}`,
      marca ? `🏭 Marca: ${marca}` : null,
      lineaPrecio(product),
      compatibilidad ? `🔧 Compatibilidad: ${compatibilidad}` : null,
      "",
      ...bloqueVehiculo(vehiculo),
      "",
      `🔗 ${enlaceFicha(product.slug)}`
    ])
  );
}

export function quoteWhatsAppUrl(
  items: QuoteItem[],
  vehiculo?: VehiculoCliente | null,
  cliente?: ClienteGuardado | null
) {
  const lineas = items.flatMap((item, index) => [
    `${index + 1}. 🛒 ${item.name}${item.quantity > 1 ? ` (${item.quantity} unidades)` : ""}`,
    `   ${lineaPrecio(item)}`,
    `   🔗 ${enlaceFicha(item.slug)}`
  ]);

  // Solo se suma cuando TODOS tienen precio publico: un total a medias
  // confunde mas de lo que ayuda.
  const todosConPrecio = items.length > 0 && items.every((item) => productHasPublicPrice(item));
  const total = todosConPrecio
    ? items.reduce((suma, item) => suma + (item.price as number) * item.quantity, 0)
    : null;

  return whatsAppUrl(
    texto([
      `${SALUDO}, quiero cotizar estos productos.`,
      "",
      ...bloqueCliente(cliente),
      ...lineas,
      total !== null ? "" : null,
      total !== null ? `💰 Total aproximado: ${formatCRC(total)}` : null,
      "",
      ...bloqueVehiculo(vehiculo)
    ])
  );
}

// Compartir la ficha con un tercero: wa.me SIN número de destino (el que
// comparte elige el contacto). Distinto de productWhatsAppUrl, que cotiza
// escribiendo AL negocio.
export function productShareWhatsAppUrl(product: Product) {
  const message = texto([
    "Mire este producto de Auto Decoración G&V:",
    "",
    `🛒 ${product.name}`,
    lineaPrecio(product),
    "",
    `🔗 ${enlaceFicha(product.slug)}`
  ]);

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// Responder AL CLIENTE que dejó una solicitud en el formulario de
// contacto: el destino es su teléfono, no el del negocio. Números de
// Costa Rica de 8 dígitos reciben el prefijo 506.
export function clientWhatsAppUrl(
  request: Pick<ContactRequest, "name" | "phone" | "vehicle" | "message">
) {
  const digits = (request.phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const full = digits.length === 8 ? `506${digits}` : digits;

  const message = texto([
    `Hola ${request.name}, le escribimos de Auto Decoración G&V sobre su solicitud.`,
    "",
    request.vehicle ? `🚗 Vehículo: ${request.vehicle}` : null,
    request.message ? `🔎 Nos pidió: ${request.message}` : null
  ]);

  return `https://wa.me/${full}?text=${encodeURIComponent(message)}`;
}
