import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link className="category-card" href={`/catalogo?categoria=${category.slug}`}>
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
