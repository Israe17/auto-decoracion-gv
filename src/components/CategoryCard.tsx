import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";

export function CategoryCard({
  category,
  href
}: {
  category: Category;
  href?: string;
}) {
  // Categoría madre → página de la categoría (muestra sus subcategorías);
  // subcategoría o categoría plana → catálogo filtrado. Se puede forzar
  // con `href`.
  const target =
    href || (category.parent ? `/catalogo?categoria=${category.slug}` : `/categoria/${category.slug}`);

  return (
    <Link className="category-card" href={target}>
      <img src={category.image} alt={category.name} />
      <span className="category-card__overlay" />
      <div>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <span>
          Ver ahora <ArrowRight size={17} />
        </span>
      </div>
    </Link>
  );
}
