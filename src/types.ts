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
  featured?: boolean;
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
