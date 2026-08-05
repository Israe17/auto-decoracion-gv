import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, LayoutGrid, PackageSearch } from "lucide-react";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
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

  // Productos puestos en la categoria GENERAL, no en una subcategoria: sin
  // esto quedaban invisibles aqui (la pagina solo mostraba subcategorias) y
  // solo aparecian entrando a "Ver todo".
  const sueltos = products.filter((product) => product.categorySlug === slug);

  return (
    <>
      <section className="page-hero page-hero--catalog">
        <span className="eyebrow">Categoría</span>
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>

      <section className="section category-subcategories">
        <Link href="/catalogo" className="text-link category-subcategories__back">
          <ArrowLeft size={18} /> Volver al catálogo
        </Link>
        <div className="section-head section-head--left">
          <div>
            <span className="section-head__pill">
              <LayoutGrid size={14} /> Subcategorías
            </span>
            <h2>
              Elija el tipo que <em>busca.</em>
            </h2>
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

      {sueltos.length > 0 && (
        <section className="section section--tight">
          <div className="section-head section-head--left">
            <div>
              <span className="section-head__pill">
                <PackageSearch size={14} /> {category.name}
              </span>
              <h2>
                También en esta <em>categoría.</em>
              </h2>
            </div>
            <Link href={`/catalogo?categoria=${slug}`} className="text-link">
              Ver todo <ArrowRight size={18} />
            </Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {sueltos.map((product) => (
              // La portada de la pagina ya dice la categoria: todos estos
              // productos son de ella y repetirla en cada tarjeta sobra.
              <ProductCard key={product.id} product={product} ocultarCategoria />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
