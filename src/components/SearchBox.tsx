"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { fetchPublicCatalog } from "@/lib/store";
import { normalize } from "@/lib/text";
import { Product } from "@/types";

const MAX_SUGGESTIONS = 5;

type SearchBoxProps = {
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

export function SearchBox({
  className = "search-box",
  onOpenChange
}: SearchBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const boxRef = useRef<HTMLFormElement>(null);
  const loadRef = useRef<Promise<Product[]> | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [matches, setMatches] = useState<Product[]>([]);

  // Carga el catalogo una sola vez, al primer foco.
  function ensureProducts() {
    if (!loadRef.current) {
      loadRef.current = fetchPublicCatalog()
        .then((data) => data.products)
        .catch(() => []);
    }
    return loadRef.current;
  }

  async function handleChange(value: string) {
    setQuery(value);
    const term = normalize(value.trim());
    if (term.length < 2) {
      setMatches([]);
      setOpen(false);
      return;
    }
    // Si la carga tarda (red lenta), no bloquea al usuario: Enter siempre
    // funciona y las sugerencias apareceran cuando haya datos.
    const products = await Promise.race([
      ensureProducts(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]);
    if (!products) return;
    const found = products
      .filter((product) =>
        normalize(
          [product.name, product.categoryName, product.tags.join(" ")].join(" ")
        ).includes(term)
      )
      .slice(0, MAX_SUGGESTIONS);
    setMatches(found);
    setOpen(true);
  }

  // Cierra al hacer clic fuera y al navegar.
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOpen(false);
    const term = query.trim();
    router.push(term ? `/catalogo?q=${encodeURIComponent(term)}` : "/catalogo");
  }

  return (
    <form ref={boxRef} className={className} onSubmit={handleSubmit} role="search">
      <Search size={18} />
      <input
        name="q"
        placeholder="Buscar productos..."
        aria-label="Buscar productos"
        autoComplete="off"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        onFocus={() => {
          void ensureProducts();
          if (matches.length) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />

      {open && (
        <div className="search-suggest" role="listbox">
          {matches.length ? (
            <>
              {matches.map((product) => (
                <Link
                  key={product.id}
                  className="search-suggest__item"
                  href={`/productos/${product.slug}`}
                  onClick={() => setOpen(false)}
                >
                  <Image src={product.images[0]} alt={product.name} width={42} height={42} />
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.categoryName}</small>
                  </span>
                  <em>
                    {product.saleMode === "price_quote"
                      ? formatCRC(product.price)
                      : "Cotizar"}
                  </em>
                </Link>
              ))}
              <button className="search-suggest__all" type="submit">
                Ver todos los resultados <ArrowRight size={15} />
              </button>
            </>
          ) : (
            <div className="search-suggest__empty">
              Sin coincidencias. <Link href="/contacto">Cuéntenos qué busca</Link> y
              se lo conseguimos.
            </div>
          )}
        </div>
      )}
    </form>
  );
}
