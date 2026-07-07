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

// Banner promocional del carrusel del home, administrado desde el admin.
export type Promo = {
  id: string;
  title: string;
  image: string;
  link?: string;
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
