"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox({ className = "search-box" }: { className?: string }) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") || "").trim();
    router.push(query ? `/catalogo?q=${encodeURIComponent(query)}` : "/catalogo");
  }

  return (
    <form className={className} onSubmit={handleSubmit} role="search">
      <Search size={18} />
      <input name="q" placeholder="Buscar productos..." aria-label="Buscar productos" />
    </form>
  );
}
