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

export type QuoteItem = {
  id: string;
  name: string;
  categoryName: string;
  price?: number;
  saleMode: SaleMode;
  quantity: number;
  slug: string;
};
