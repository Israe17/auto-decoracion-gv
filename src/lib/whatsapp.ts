import { Product, QuoteItem } from "@/types";
import { formatCRC } from "./catalog";

const businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "50600000000";

export function whatsAppUrl(message: string) {
  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}

export function generalWhatsAppUrl() {
  return whatsAppUrl(
    "Hola Auto Decoracion G&V, quiero informacion sobre un producto o servicio."
  );
}

export function serviceWhatsAppUrl(service: string) {
  return whatsAppUrl(
    [
      `Hola Auto Decoracion G&V, quiero cotizar el servicio de ${service}.`,
      "",
      "Mi vehiculo es:",
      "Marca:",
      "Modelo:",
      "Ano:"
    ].join("\n")
  );
}

export function contactWhatsAppUrl(data: {
  name: string;
  phone: string;
  vehicle: string;
  message: string;
}) {
  return whatsAppUrl(
    [
      "Hola Auto Decoracion G&V, ando buscando algo que no encontre en el catalogo:",
      "",
      `Nombre: ${data.name}`,
      data.phone ? `Telefono: ${data.phone}` : "",
      data.vehicle ? `Vehiculo: ${data.vehicle}` : "",
      "",
      `Lo que busco: ${data.message}`
    ]
      .filter(Boolean)
      .join("\n")
  );
}

export function productWhatsAppUrl(product: Product, origin = "") {
  const vehicleText =
    product.compatibilityMode === "universal"
      ? "Universal / varios vehiculos"
      : product.vehicles
          .map((vehicle) => {
            const years =
              vehicle.fromYear && vehicle.toYear
                ? ` ${vehicle.fromYear}-${vehicle.toYear}`
                : "";
            return `${vehicle.make} ${vehicle.model}${years}`;
          })
          .join(", ");

  const message = [
    "Hola Auto Decoracion G&V, quiero cotizar este producto:",
    "",
    `Producto: ${product.name}`,
    `Categoria: ${product.categoryName}`,
    `Precio mostrado: ${formatCRC(product.price)}`,
    `Compatibilidad: ${vehicleText}`,
    "",
    "Mi vehiculo es:",
    "Marca:",
    "Modelo:",
    "Ano:",
    "",
    origin ? `Link: ${origin}/productos/${product.slug}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}

export function quoteWhatsAppUrl(items: QuoteItem[]) {
  const lines = items.map((item, index) => {
    const price = item.saleMode === "price_quote" ? ` - ${formatCRC(item.price)}` : "";
    return `${index + 1}. ${item.name} x${item.quantity}${price}`;
  });

  const message = [
    "Hola Auto Decoracion G&V, quiero cotizar estos productos:",
    "",
    ...lines,
    "",
    "Mi vehiculo es:",
    "Marca:",
    "Modelo:",
    "Ano:"
  ].join("\n");

  return `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;
}
