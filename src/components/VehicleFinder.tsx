"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import gsap from "gsap";
import { VehicleModel } from "@/types";

export type VehicleQuery = { make: string; model: string; year: string };

const fallbackLatestYear = 2030;

export function VehicleFinder({
  vehicles,
  compact = false,
  initial,
  onSearch
}: {
  vehicles: VehicleModel[];
  compact?: boolean;
  initial?: Partial<VehicleQuery>;
  onSearch?: (query: VehicleQuery) => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [make, setMake] = useState(initial?.make || "");
  const [model, setModel] = useState(initial?.model || "");
  const [year, setYear] = useState(initial?.year || "");

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))),
    [vehicles]
  );

  const models = useMemo(
    () => vehicles.filter((v) => !make || v.make === make),
    [vehicles, make]
  );

  const years = useMemo(() => {
    const selected = vehicles.find((v) => v.make === make && v.model === model);
    const from = selected?.fromYear ?? 2000;
    const to = selected?.toYear ?? fallbackLatestYear;
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  }, [vehicles, make, model]);

  useEffect(() => {
    const form = formRef.current;
    if (!form || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const bounds = form.getBoundingClientRect();
    const isAlreadyVisible = bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0;
    if (isAlreadyVisible) return;

    let observer!: IntersectionObserver;
    const ctx = gsap.context(() => {
      gsap.set(form, { autoAlpha: 0, y: 28 });
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          observer.disconnect();
          gsap.to(form, { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.out" });
        },
        { rootMargin: "0px 0px -12% 0px" }
      );
      observer.observe(form);
    }, form);

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  function handleSearch() {
    const query = { make, model, year };
    if (onSearch) {
      onSearch(query);
      return;
    }
    const params = new URLSearchParams();
    if (make) params.set("marca", make);
    if (model) params.set("modelo", model);
    if (year) params.set("ano", year);
    router.push(`/catalogo?${params.toString()}`);
  }

  return (
    <form
      ref={formRef}
      className={compact ? "vehicle-finder vehicle-finder--compact" : "vehicle-finder"}
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
    >
      {!compact && (
        <div>
          <h3>Busque por su vehículo</h3>
        </div>
      )}
      <label>
        Marca
        <select
          value={make}
          onChange={(event) => {
            setMake(event.target.value);
            setModel("");
            setYear("");
          }}
        >
          <option value="">Todas</option>
          {makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        Modelo
        <select
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
            setYear("");
          }}
        >
          <option value="">Todos</option>
          {models.map((item) => (
            <option key={item.id} value={item.model}>
              {item.model}
            </option>
          ))}
        </select>
      </label>
      <label>
        Año
        <select value={year} onChange={(event) => setYear(event.target.value)}>
          <option value="">Todos</option>
          {years.map((item) => (
            <option key={item} value={String(item)}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="button button--primary">
        <Search size={17} /> Buscar
      </button>
    </form>
  );
}
