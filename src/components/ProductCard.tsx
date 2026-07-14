import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { Product } from "@/types";
import { ProductActions } from "./ProductActions";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/productos/${product.slug}`} className="product-card__image">
        {(product.oldPrice || product.featured) && (
          <span className="badge">{product.oldPrice ? "Oferta" : "Destacado"}</span>
        )}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 50vw, (max-width: 1200px) 33vw, 300px"
        />
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        {product.isOwnBrand && <span className="product-card__brand">G&amp;V System</span>}
        <Link href={`/productos/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price-row">
          {product.oldPrice && <del>{formatCRC(product.oldPrice)}</del>}
          <strong>
            {product.saleMode === "price_quote" ? formatCRC(product.price) : "Consultar precio"}
          </strong>
        </div>
        <div className="stock-row">
          <PackageCheck size={16} />
          {product.status === "available" ? "Disponible" : "Bajo pedido"}
        </div>
        <ProductActions product={product} />
      </div>
    </article>
  );
}
