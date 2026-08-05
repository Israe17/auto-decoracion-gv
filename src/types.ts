export type SaleMode = "price_quote" | "quote_only";

export type ProductStatus = "available" | "on_request" | "sold_out";

export type CompatibilityMode = "universal" | "specific";

export type VehicleCompatibility = {
  make: string;
  model: string;
  fromYear?: number;
  toYear?: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  // Slug de la categoría madre. Vacío = categoría principal; con valor =
  // subcategoría dentro de esa madre.
  parent?: string;
};

export type Brand = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  saleMode: SaleMode;
  price?: number;
  oldPrice?: number;
  status: ProductStatus;
  compatibilityMode: CompatibilityMode;
  vehicles: VehicleCompatibility[];
  images: string[];
  // Qué parte de cada foto se ve dentro del recuadro del sitio, en el
  // formato de `object-position` ("50% 30%"). La foto se guarda ENTERA:
  // esto solo dice cómo encuadrarla, así que se puede reacomodar cuando
  // se quiera sin volver a subirla. Va con la URL como llave —y no por
  // posición— para que reordenar o quitar fotos no descuadre el resto.
  // Sin entrada = centrada.
  imageFocus?: Record<string, string>;
  description: string;
  tags: string[];
  // Marca comercial del producto. La linea propia usa G&V System.
  brandId?: string;
  brandName?: string;
  isOwnBrand?: boolean;
  // Complemento: producto que se vende aparte pero acompaña a otro (el
  // extra de un producto padre). El hijo es el que apunta al padre, asi la
  // tarjeta pinta su etiqueta sin recorrer el catalogo entero; el nombre va
  // denormalizado igual que `categoryName` y `brandName`.
  parentProductId?: string;
  parentProductName?: string;
  featured?: boolean;
  // Fechas YYYY-MM-DD en horario de Costa Rica. Sin fecha = visible de inmediato o sin vencimiento.
  featuredFrom?: string;
  featuredUntil?: string;
  // Un numero menor se muestra primero en la portada.
  featuredOrder?: number;
};

export type VehicleModel = {
  id: string;
  make: string;
  model: string;
  fromYear?: number;
  toYear?: number;
};

// Pagina del proveedor donde el negocio consigue el producto. Dato PRIVADO:
// por eso no es un campo de Product (la tabla `products` la lee cualquiera,
// es el catalogo publico) sino su propia tabla `product_sources`, sin
// politica para el anonimo. `id` es el id del producto.
export type ProductSource = {
  id: string;
  url: string;
};

// Lamina promocional del carrusel del home, administrada desde el admin:
// arte + titulo + subtitulo + boton de accion.
export type Promo = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  ctaLabel?: string;
  order?: number;
  active?: boolean;
};

export type QuoteItem = {
  id: string;
  name: string;
  categoryName: string;
  price?: number;
  // Opcional a proposito: los carritos ya guardados en el navegador del
  // cliente no lo traen y deben seguir funcionando.
  oldPrice?: number;
  saleMode: SaleMode;
  quantity: number;
  slug: string;
};

// Solicitud del formulario "¿No encontró lo que busca?": ademas de abrir
// WhatsApp, se guarda para que el negocio tenga su base de clientes.
export type ContactRequest = {
  id: string;
  name: string;
  phone?: string;
  vehicle?: string;
  message: string;
  // ISO al momento de enviar; el admin la muestra en hora local.
  createdAt: string;
};

// Foto de un trabajo del taller para la galeria publica. La forma decide
// el recorte al subirla y la altura de la pieza en el mosaico.
export type GalleryShape = "vertical" | "cuadrada" | "horizontal";

export type GalleryItem = {
  id: string;
  image: string;
  title?: string;
  description?: string;
  shape: GalleryShape;
  // Un numero menor se muestra primero.
  order?: number;
  createdAt?: string;
};
