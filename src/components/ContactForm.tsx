"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { contactWhatsAppUrl } from "@/lib/whatsapp";
import { VehicleModel } from "@/types";

// Valor centinela: el vehiculo del cliente no esta en el catalogo y
// escribe el dato a mano. Nunca viaja en el mensaje.
const OTRO = "__otro__";
const fallbackLatestYear = 2030;
const fallbackFirstYear = 1990;

export function ContactForm({ vehicles = [] }: { vehicles?: VehicleModel[] }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customYear, setCustomYear] = useState("");

  const makes = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.make))),
    [vehicles]
  );

  const models = useMemo(
    () =>
      Array.from(
        new Set(
          vehicles.filter((v) => !make || v.make === make).map((v) => v.model)
        )
      ),
    [vehicles, make]
  );

  const years = useMemo(() => {
    const selected = vehicles.find((v) => v.make === make && v.model === model);
    const from = selected?.fromYear ?? fallbackFirstYear;
    const to = selected?.toYear ?? fallbackLatestYear;
    const list: number[] = [];
    for (let y = to; y >= from; y--) list.push(y);
    return list;
  }, [vehicles, make, model]);

  const makeIsCustom = make === OTRO || makes.length === 0;
  const modelIsCustom = makeIsCustom || model === OTRO;
  const yearIsCustom = year === OTRO;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const vehicleParts = [
      (makeIsCustom ? customMake : make).trim(),
      (modelIsCustom ? customModel : model).trim(),
      (yearIsCustom ? customYear : year).trim()
    ].filter(Boolean);

    const url = contactWhatsAppUrl({
      name: String(form.get("name") || "").trim(),
      phone: String(form.get("phone") || "").trim(),
      vehicle: vehicleParts.join(" "),
      message: String(form.get("message") || "").trim()
    });

    window.open(url, "_blank", "noopener");
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div>
        <h2>¿No encontró lo que busca?</h2>
        <p>
          Cuéntenos qué necesita y para cuál vehículo. Recibimos su mensaje
          directamente en WhatsApp y le respondemos con precio y disponibilidad.
        </p>
      </div>

      <div className="form-grid">
        <label>
          Nombre
          <input name="name" required placeholder="Su nombre" />
        </label>
        <label>
          Teléfono (opcional)
          <input name="phone" type="tel" placeholder="8888 8888" />
        </label>
      </div>

      <div className="form-grid form-grid--three">
        <label>
          Marca
          {makes.length > 0 ? (
            <CustomSelect
              ariaLabel="Marca"
              options={[
                { label: "Elegir marca", value: "" },
                ...makes.map((item) => ({ label: item, value: item })),
                { label: "Otra marca…", value: OTRO }
              ]}
              value={make}
              onChange={(value) => {
                setMake(value);
                setModel("");
                setYear("");
              }}
            />
          ) : (
            <input
              value={customMake}
              onChange={(event) => setCustomMake(event.target.value)}
              placeholder="Toyota"
            />
          )}
          {make === OTRO && (
            <input
              value={customMake}
              onChange={(event) => setCustomMake(event.target.value)}
              placeholder="Escriba la marca"
              autoFocus
            />
          )}
        </label>
        <label>
          Modelo
          {makeIsCustom ? (
            <input
              value={customModel}
              onChange={(event) => setCustomModel(event.target.value)}
              placeholder="Hilux"
            />
          ) : (
            <>
              <CustomSelect
                ariaLabel="Modelo"
                options={[
                  { label: "Elegir modelo", value: "" },
                  ...models.map((item) => ({ label: item, value: item })),
                  { label: "Otro modelo…", value: OTRO }
                ]}
                value={model}
                onChange={(value) => {
                  setModel(value);
                  setYear("");
                }}
              />
              {model === OTRO && (
                <input
                  value={customModel}
                  onChange={(event) => setCustomModel(event.target.value)}
                  placeholder="Escriba el modelo"
                  autoFocus
                />
              )}
            </>
          )}
        </label>
        <label>
          Año
          {modelIsCustom ? (
            <input
              value={customYear}
              onChange={(event) => setCustomYear(event.target.value)}
              type="number"
              placeholder="2022"
            />
          ) : (
            <>
              <CustomSelect
                ariaLabel="Año"
                options={[
                  { label: "Elegir año", value: "" },
                  ...years.map((item) => ({ label: String(item), value: String(item) })),
                  { label: "Otro año…", value: OTRO }
                ]}
                value={year}
                onChange={setYear}
              />
              {year === OTRO && (
                <input
                  value={customYear}
                  onChange={(event) => setCustomYear(event.target.value)}
                  type="number"
                  placeholder="Escriba el año"
                  autoFocus
                />
              )}
            </>
          )}
        </label>
      </div>

      <label>
        ¿Qué anda buscando?
        <textarea
          name="message"
          rows={4}
          required
          placeholder="Ej: cobertor de batea para Hilux 2022, o polarizado para sedán"
        />
      </label>

      <button className="button button--primary" type="submit">
        <MessageCircle size={18} /> Solicitar cotización
      </button>
    </form>
  );
}
