"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { VehicleFinder, VehicleQuery } from "@/components/VehicleFinder";
import { categoryScope, childCategories, topCategories } from "@/lib/catalog";
import { normalize } from "@/lib/text";
import { Category, Product, VehicleModel } from "@/types";

type Filters = {
  q: string;
  categoria: string;
  marca: string;
  modelo: string;
  ano: string;
  precioVisible: boolean;
  soloCotizar: boolean;
  disponible: boolean;
  bajoPedido: boolean;
};

function vehicleMatches(product: Product, filters: Filters) {
  if (!filters.marca && !filters.modelo && !filters.ano) return true;
  if (product.compatibilityMode === "universal") return true;

  return product.vehicles.some((vehicle) => {
    if (filters.marca && normalize(vehicle.make) !== normalize(filters.marca)) {
      return false;
    }
    if (filters.modelo && normalize(vehicle.model) !== normalize(filters.modelo)) {
      return false;
    }
    if (filters.ano) {
      const year = Number(filters.ano);
      if (vehicle.fromYear && year < vehicle.fromYear) return false;
      if (vehicle.toYear && year > vehicle.toYear) return false;
    }
    return true;
  });
}

export function CatalogExplorer({
  products,
  categories,
  vehicles
}: {
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => ({
    q: searchParams.get("q") || "",
    categoria: searchParams.get("categoria") || "",
    marca: searchParams.get("marca") || "",
    modelo: searchParams.get("modelo") || "",
    ano: searchParams.get("ano") || "",
    precioVisible: true,
    soloCotizar: true,
    disponible: true,
    bajoPedido: true
  }));

  // Si la URL cambia desde afuera (busqueda del header, link de categoria),
  // sincroniza los filtros.
  useEffect(() => {
    setFilters((current) => ({
      ...current,
      q: searchParams.get("q") || "",
      categoria: searchParams.get("categoria") || "",
      marca: searchParams.get("marca") || "",
      modelo: searchParams.get("modelo") || "",
      ano: searchParams.get("ano") || ""
    }));
  }, [searchParams]);

  function apply(next: Partial<Filters>) {
    const merged = { ...filters, ...next };
    setFilters(merged);

    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.categoria) params.set("categoria", merged.categoria);
    if (merged.marca) params.set("marca", merged.marca);
    if (merged.modelo) params.set("modelo", merged.modelo);
    if (merged.ano) params.set("ano", merged.ano);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const results = useMemo(() => {
    const term = normalize(filters.q.trim());

    return products.filter((product) => {
      if (term) {
        const haystack = normalize(
          [product.name, product.categoryName, product.description, product.tags.join(" ")].join(" ")
        );
        if (!haystack.includes(term)) return false;
      }
      if (
        filters.categoria &&
        !categoryScope(categories, filters.categoria).includes(product.categorySlug)
      ) {
        return false;
      }
      if (!vehicleMatches(product, filters)) return false;
      if (!filters.precioVisible && product.saleMode === "price_quote") return false;
      if (!filters.soloCotizar && product.saleMode === "quote_only") return false;
      if (!filters.disponible && product.status === "available") return false;
      if (!filters.bajoPedido && product.status === "on_request") return false;
      return true;
    });
  }, [products, filters, categories]);

  const hasVehicleFilter = Boolean(filters.marca || filters.modelo || filters.ano);
  const hasAnyFilter =
    Boolean(filters.q || filters.categoria) || hasVehicleFilter;

  const vehicleLabel = [filters.marca, filters.modelo, filters.ano]
    .filter(Boolean)
    .join(" ");

  function clearAll() {
    apply({ q: "", categoria: "", marca: "", modelo: "", ano: "" });
  }

  return (
    <div className="catalog-layout">
      <aside className="filters">
        <div className="filters__title">
          <SlidersHorizontal size={18} />
          Filtros
        </div>

        <VehicleFinder
          compact
          vehicles={vehicles}
          initial={{ make: filters.marca, model: filters.modelo, year: filters.ano }}
          key={`${filters.marca}|${filters.modelo}|${filters.ano}`}
          onSearch={(query: VehicleQuery) =>
            apply({ marca: query.make, modelo: query.model, ano: query.year })
          }
        />

        <div className="filter-block">
          <strong>Categoría</strong>
          <select
            value={filters.categoria}
            onChange={(event) => apply({ categoria: event.target.value })}
          >
            <option value="">Todas las categorías</option>
            {topCategories(categories).map((category) => {
              const children = childCategories(categories, category.slug);
              if (!children.length) {
                return (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                );
              }
              return (
                <optgroup key={category.id} label={category.name}>
                  <option value={category.slug}>Toda la categoría</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.slug}>
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </div>

        <div className="filter-block">
          <strong>Modo de venta</strong>
          <label>
            <input
              type="checkbox"
              checked={filters.precioVisible}
              onChange={(event) => apply({ precioVisible: event.target.checked })}
            />{" "}
            Precio + cotizar
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.soloCotizar}
              onChange={(event) => apply({ soloCotizar: event.target.checked })}
            />{" "}
            Solo cotizar
          </label>
        </div>
        <div className="filter-block">
          <strong>Estado</strong>
          <label>
            <input
              type="checkbox"
              checked={filters.disponible}
              onChange={(event) => apply({ disponible: event.target.checked })}
            />{" "}
            Disponible
          </label>
          <label>
            <input
              type="checkbox"
              checked={filters.bajoPedido}
              onChange={(event) => apply({ bajoPedido: event.target.checked })}
            />{" "}
            Bajo pedido
          </label>
        </div>
      </aside>

      <div>
        <div className="catalog-toolbar">
          <span>
            {results.length} producto(s)
            {vehicleLabel ? ` para ${vehicleLabel}` : ""}
          </span>
          {hasAnyFilter && (
            <button className="catalog-clear" type="button" onClick={clearAll}>
              <X size={15} /> Limpiar filtros
            </button>
          )}
        </div>

        {hasVehicleFilter && results.length > 0 && (
          <p className="catalog-compat-note">
            Mostrando productos compatibles con su vehículo y productos
            universales.
          </p>
        )}

        {results.length > 0 ? (
          <div className="product-grid product-grid--catalog">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <PackageSearch size={34} />
            <h3>No lo tenemos publicado{vehicleLabel ? ` para ${vehicleLabel}` : ""}</h3>
            <p>
              El catálogo en línea es una selección: trabajamos con
              distribuidores de confianza y es muy posible que se lo consigamos.
            </p>
            <Link className="button button--primary" href="/contacto">
              Cuéntenos qué busca
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
