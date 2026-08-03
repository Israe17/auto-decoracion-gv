"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Car, MessageCircle, Pencil, User, X } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { formatCRC } from "@/lib/catalog";
import { guardarCliente, leerCliente, type ClienteGuardado } from "@/lib/cliente";
import { EVENTO_COTIZAR, type PedidoDeCotizacion } from "@/lib/cotizar";
import { fetchVehicles } from "@/lib/store";
import { saveContactRequest } from "@/lib/store";
import { guardarVehiculo, leerVehiculo, vehiculoTexto, type VehiculoCliente } from "@/lib/vehiculo";
import { productWhatsAppUrl, quoteWhatsAppUrl } from "@/lib/whatsapp";
import { VehicleModel } from "@/types";

// Marca/modelo/ano fuera del catalogo: el cliente los escribe.
const OTRO = "__otro__";
const PRIMER_ANO = 1990;
const ULTIMO_ANO = 2030;

function tituloDelPedido(pedido: PedidoDeCotizacion) {
  if (pedido.tipo === "producto") return pedido.producto.name;
  const total = pedido.items.reduce((suma, item) => suma + item.quantity, 0);
  return `${total} producto(s) de su lista`;
}

// Lo que el negocio vera en la pestana Solicitudes del admin.
function resumenDelPedido(pedido: PedidoDeCotizacion) {
  if (pedido.tipo === "producto") {
    const precio =
      pedido.producto.saleMode === "price_quote" && typeof pedido.producto.price === "number"
        ? ` (${formatCRC(pedido.producto.price)})`
        : "";
    return `Cotización desde el sitio: ${pedido.producto.name}${precio}`;
  }
  const lista = pedido.items
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ");
  return `Cotización de varios productos: ${lista}`;
}

export function QuoteDialog() {
  const [pedido, setPedido] = useState<PedidoDeCotizacion | null>(null);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [editando, setEditando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [otraMarca, setOtraMarca] = useState("");
  const [otroModelo, setOtroModelo] = useState("");
  const [otroAno, setOtroAno] = useState("");
  const [error, setError] = useState("");
  const nombreRef = useRef<HTMLInputElement>(null);

  // Abrir: cualquier boton "Cotizar" dispara el evento.
  useEffect(() => {
    function abrir(evento: Event) {
      const detalle = (evento as CustomEvent<PedidoDeCotizacion>).detail;
      const cliente = leerCliente();
      const vehiculo = leerVehiculo();

      setNombre(cliente?.name || "");
      setTelefono(cliente?.phone || "");
      setMake(vehiculo?.make || "");
      setModel(vehiculo?.model || "");
      setYear(vehiculo?.year || "");
      setOtraMarca("");
      setOtroModelo("");
      setOtroAno("");
      setError("");
      // Con datos completos se abre en modo confirmar: un solo toque.
      setEditando(!(cliente?.name && vehiculoTexto(vehiculo)));
      setPedido(detalle);
    }

    window.addEventListener(EVENTO_COTIZAR, abrir);
    return () => window.removeEventListener(EVENTO_COTIZAR, abrir);
  }, []);

  // Los modelos se piden una sola vez, al abrir por primera vez.
  useEffect(() => {
    if (!pedido || vehicles.length) return;
    let vivo = true;
    fetchVehicles()
      .then((lista) => vivo && setVehicles(lista))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [pedido, vehicles.length]);

  useEffect(() => {
    if (!pedido) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const foco = window.setTimeout(() => nombreRef.current?.focus(), 60);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPedido(null);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(foco);
      document.body.style.overflow = previo;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [pedido]);

  const marcas = useMemo(
    () => Array.from(new Set(vehicles.map((item) => item.make))),
    [vehicles]
  );

  const modelos = useMemo(
    () =>
      Array.from(
        new Set(vehicles.filter((item) => !make || item.make === make).map((item) => item.model))
      ),
    [vehicles, make]
  );

  const anos = useMemo(() => {
    const elegido = vehicles.find((item) => item.make === make && item.model === model);
    const desde = elegido?.fromYear ?? PRIMER_ANO;
    const hasta = elegido?.toYear ?? ULTIMO_ANO;
    const lista: number[] = [];
    for (let ano = hasta; ano >= desde; ano--) lista.push(ano);
    return lista;
  }, [vehicles, make, model]);

  if (!pedido) return null;

  const marcaLibre = make === OTRO || marcas.length === 0;
  const modeloLibre = marcaLibre || model === OTRO;
  const anoLibre = year === OTRO;

  const vehiculo: VehiculoCliente = {
    make: (marcaLibre ? otraMarca : make).trim(),
    model: (modeloLibre ? otroModelo : model).trim(),
    year: (anoLibre ? otroAno : year).trim()
  };
  const cliente: ClienteGuardado = { name: nombre.trim(), phone: telefono.trim() };

  function enviar(event?: FormEvent) {
    event?.preventDefault();
    if (!cliente.name) {
      setError("Escriba su nombre para continuar.");
      setEditando(true);
      return;
    }
    if (!vehiculoTexto(vehiculo)) {
      setError("Indique su vehículo para poder cotizarle bien.");
      setEditando(true);
      return;
    }

    setEnviando(true);
    guardarCliente(cliente);
    guardarVehiculo(vehiculo);

    // La solicitud queda en la base de clientes, pero WhatsApp se abre
    // igual si el guardado falla: la venta manda.
    saveContactRequest({
      id: `solicitud-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: cliente.name,
      phone: cliente.phone,
      vehicle: vehiculoTexto(vehiculo),
      message: resumenDelPedido(pedido as PedidoDeCotizacion),
      createdAt: new Date().toISOString()
    }).catch(() => {});

    const url =
      (pedido as PedidoDeCotizacion).tipo === "producto"
        ? productWhatsAppUrl(
            (pedido as Extract<PedidoDeCotizacion, { tipo: "producto" }>).producto,
            vehiculo,
            cliente
          )
        : quoteWhatsAppUrl(
            (pedido as Extract<PedidoDeCotizacion, { tipo: "bandeja" }>).items,
            vehiculo,
            cliente
          );

    window.open(url, "_blank", "noopener");
    setEnviando(false);
    setPedido(null);
  }

  const resumenCliente = [cliente.name, cliente.phone].filter(Boolean).join(" · ");

  return createPortal(
    <div className="quote-dialog-backdrop" role="presentation">
      <button
        type="button"
        className="quote-dialog__dismiss"
        aria-label="Cerrar"
        onClick={() => setPedido(null)}
      />
      <div
        className="quote-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-dialog-title"
        data-lenis-prevent
      >
        <div className="quote-dialog__header">
          <div>
            <span className="quote-dialog__kicker">Cotización rápida</span>
            <strong id="quote-dialog-title">{tituloDelPedido(pedido)}</strong>
          </div>
          <button type="button" aria-label="Cerrar" onClick={() => setPedido(null)}>
            <X size={18} />
          </button>
        </div>

        <form className="quote-dialog__body" onSubmit={enviar}>
          {editando ? (
            <>
              <p className="quote-dialog__intro">
                Déjenos su nombre y su vehículo: le respondemos por WhatsApp con
                precio, disponibilidad e instalación.
              </p>

              <div className="form-grid">
                <label>
                  Nombre
                  <input
                    ref={nombreRef}
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    placeholder="Su nombre"
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  Teléfono (opcional)
                  <input
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="8888 8888"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
              </div>

              <div className="form-grid form-grid--three">
                <label>
                  Marca
                  {marcas.length > 0 ? (
                    <CustomSelect
                      ariaLabel="Marca"
                      options={[
                        { label: "Elegir marca", value: "" },
                        ...marcas.map((item) => ({ label: item, value: item })),
                        { label: "Otra marca…", value: OTRO }
                      ]}
                      value={make}
                      onChange={(valor) => {
                        setMake(valor);
                        setModel("");
                        setYear("");
                      }}
                    />
                  ) : (
                    <input
                      value={otraMarca}
                      onChange={(event) => setOtraMarca(event.target.value)}
                      placeholder="Toyota"
                    />
                  )}
                  {make === OTRO && (
                    <input
                      value={otraMarca}
                      onChange={(event) => setOtraMarca(event.target.value)}
                      placeholder="Escriba la marca"
                    />
                  )}
                </label>
                <label>
                  Modelo
                  {marcaLibre ? (
                    <input
                      value={otroModelo}
                      onChange={(event) => setOtroModelo(event.target.value)}
                      placeholder="Hilux"
                    />
                  ) : (
                    <>
                      <CustomSelect
                        ariaLabel="Modelo"
                        options={[
                          { label: "Elegir modelo", value: "" },
                          ...modelos.map((item) => ({ label: item, value: item })),
                          { label: "Otro modelo…", value: OTRO }
                        ]}
                        value={model}
                        onChange={(valor) => {
                          setModel(valor);
                          setYear("");
                        }}
                      />
                      {model === OTRO && (
                        <input
                          value={otroModelo}
                          onChange={(event) => setOtroModelo(event.target.value)}
                          placeholder="Escriba el modelo"
                        />
                      )}
                    </>
                  )}
                </label>
                <label>
                  Año
                  {modeloLibre ? (
                    <input
                      value={otroAno}
                      onChange={(event) => setOtroAno(event.target.value)}
                      inputMode="numeric"
                      placeholder="2022"
                    />
                  ) : (
                    <>
                      <CustomSelect
                        ariaLabel="Año"
                        options={[
                          { label: "Elegir año", value: "" },
                          ...anos.map((item) => ({ label: String(item), value: String(item) })),
                          { label: "Otro año…", value: OTRO }
                        ]}
                        value={year}
                        onChange={setYear}
                      />
                      {year === OTRO && (
                        <input
                          value={otroAno}
                          onChange={(event) => setOtroAno(event.target.value)}
                          inputMode="numeric"
                          placeholder="Escriba el año"
                        />
                      )}
                    </>
                  )}
                </label>
              </div>
            </>
          ) : (
            <div className="quote-dialog__resumen">
              <p className="quote-dialog__intro">
                Enviamos su cotización con estos datos:
              </p>
              <div className="quote-dialog__dato">
                <User size={16} />
                <span>{resumenCliente}</span>
              </div>
              <div className="quote-dialog__dato">
                <Car size={16} />
                <span>{vehiculoTexto(vehiculo)}</span>
              </div>
              <button
                type="button"
                className="quote-dialog__cambiar"
                onClick={() => setEditando(true)}
              >
                <Pencil size={14} /> Cambiar mis datos
              </button>
            </div>
          )}

          {error && <span className="quote-dialog__error">{error}</span>}

          <button className="button button--primary" type="submit" disabled={enviando}>
            <MessageCircle size={18} /> Enviar por WhatsApp
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
