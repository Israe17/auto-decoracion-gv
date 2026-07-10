import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import {
  categories as seedCategories,
  childCategories,
  findCategoryBySlug
} from "@/lib/catalog";
import { fetchPublicCatalog } from "@/lib/store";

export const revalidate = 60;

export function generateStaticParams() {
  return seedCategories
    .filter((category) => !category.parent)
    .map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { categories } = await fetchPublicCatalog();
  const category = findCategoryBySlug(categories, slug);
  if (!category) return { title: "Categoría" };
  const title = `${category.name} — Auto Decoración G&V`;
  return {
    title,
    description: category.description,
    openGraph: {
      title,
      description: category.description,
      images: [{ url: category.image }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: category.description,
      images: [category.image]
    }
  };
}

export default async function CategoryPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { categories, products } = await fetchPublicCatalog();
  const category = findCategoryBySlug(categories, slug);

  if (!category) notFound();

  const children = childCategories(categories, slug);

  // Sin subcategorías (subcategoría o categoría plana) → catálogo filtrado.
  if (!children.length) {
    redirect(`/catalogo?categoria=${slug}`);
  }

  const countFor = (categorySlug: string) =>
    products.filter((product) => product.categorySlug === categorySlug).length;

  return (
    <>
      <section className="page-hero page-hero--catalog">
        <span className="eyebrow">Categoría</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>

      <section className="section section--tight">
        <Link href="/catalogo" className="text-link">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <span className="eyebrow">Subcategorías</span>
            <h2>Elija el tipo que busca</h2>
          </div>
          <Link href={`/catalogo?categoria=${slug}`} className="text-link">
            Ver todo <ArrowRight size={18} />
          </Link>
        </div>
        <div className="category-grid">
          {children.map((child) => (
            <CategoryCard
              key={child.id}
              category={child}
              href={`/catalogo?categoria=${child.slug}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}
