import { Search } from "lucide-react";

export function VehicleFinder({ compact = false }: { compact?: boolean }) {
  return (
    <form className={compact ? "vehicle-finder vehicle-finder--compact" : "vehicle-finder"}>
      {!compact && (
        <div>
          <span className="eyebrow">Encuentre piezas mas rapido</span>
          <h3>Datos del vehiculo</h3>
        </div>
      )}
      <label>
        Marca
        <select>
          <option>Toyota</option>
          <option>Nissan</option>
          <option>Mitsubishi</option>
          <option>Ford</option>
        </select>
      </label>
      <label>
        Modelo
        <select>
          <option>Hilux</option>
          <option>Frontier</option>
          <option>Fortuner</option>
          <option>Montero</option>
        </select>
      </label>
      <label>
        Ano
        <select>
          <option>2026</option>
          <option>2025</option>
          <option>2024</option>
          <option>2023</option>
        </select>
      </label>
      <button type="button" className="button button--primary">
        <Search size={17} /> Buscar
      </button>
    </form>
  );
}
