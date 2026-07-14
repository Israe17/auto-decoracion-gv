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
  description: string;
  tags: string[];
  // Marca comercial del producto. La linea propia usa G&V System.
  brandName?: string;
  isOwnBrand?: boolean;
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
  saleMode: SaleMode;
  quantity: number;
  slug: string;
};
