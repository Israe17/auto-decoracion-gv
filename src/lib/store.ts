import { Brand, Category, ContactRequest, Product, Promo, VehicleModel } from "@/types";
import { categories as seedCategories, products as seedProducts } from "./catalog";
import { requireSupabase, supabaseEnabled } from "./supabase";
import { getFeaturedStatus } from "./featured";

const PRODUCTS = "products";
const CATEGORIES = "categories";
const VEHICLES = "vehicles";
const PROMOS = "promos";
const BRANDS = "brands";
const CONTACT_REQUESTS = "contact_requests";

const localKeys = {
  products: "gv-admin-products",
  categories: "gv-admin-categories",
  vehicles: "gv-admin-vehicles",
  promos: "gv-admin-promos",
  brands: "gv-admin-brands",
  requests: "gv-contact-requests"
};
const LOCAL_MIGRATION_DONE = "gv-admin-supabase-migrated";

export const seedBrands: Brand[] = [];

export const seedPromos: Promo[] = [
  {
    id: "promo-marca",
    title: "Todo para su vehículo, instalado por expertos",
    subtitle:
      "Accesorios, polarizado e instalación profesional en Liberia desde 2008. Lo tenemos en el local o se lo conseguimos.",
    image: "/hero/vehiculo.jpg",
    link: "/catalogo",
    ctaLabel: "Ver catálogo",
    order: 1,
    active: true
  },
  {
    id: "promo-audio-video",
    title: "Convierta su auto en su espacio favorito",
    subtitle:
      "Pantallas, cámaras de reversa, parlantes y amplificadores. Le conseguimos el equipo y se lo instalamos con conexiones limpias.",
    image: "/hero/audio-video.jpg",
    link: "/catalogo?categoria=audio-video",
    ctaLabel: "Cotizar audio y video",
    order: 2,
    active: true
  },
  {
    id: "promo-iluminacion",
    title: "Iluminación para cualquier aventura",
    subtitle:
      "Barras LED, faros auxiliares y halógenos. Le asesoramos, conseguimos el producto y lo instalamos.",
    image: "/hero/iluminacion.jpg",
    link: "/catalogo?categoria=iluminacion",
    ctaLabel: "Ver iluminación",
    order: 3,
    active: true
  }
];

export const seedVehicles: VehicleModel[] = [
  { id: "toyota-hilux", make: "Toyota", model: "Hilux", fromYear: 2016, toYear: 2026 },
  { id: "nissan-frontier", make: "Nissan", model: "Frontier", fromYear: 2021, toYear: 2026 },
  { id: "toyota-fortuner", make: "Toyota", model: "Fortuner", fromYear: 2017, toYear: 2026 },
  { id: "mitsubishi-montero", make: "Mitsubishi", model: "Montero", fromYear: 2015, toYear: 2025 },
  { id: "isuzu-dmax", make: "Isuzu", model: "D-Max", fromYear: 2020, toYear: 2026 },
  { id: "nissan-navara", make: "Nissan", model: "Navara", fromYear: 2008, toYear: 2014 },
  { id: "jeep-wrangler", make: "Jeep", model: "Wrangler", fromYear: 2007, toYear: 2018 }
];

// `undefined` no es JSON valido; el round-trip lo elimina antes de guardar.
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Cada tabla guarda el documento completo en `data` (jsonb), asi que leer
// una tabla es traer esa columna y devolverla tal cual.
async function listCollection<T>(name: string): Promise<T[]> {
  const { data, error } = await requireSupabase().from(name).select("data");
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.data as T);
}

async function revalidarCatalogoPublico() {
  if (typeof window === "undefined") return;

  try {
    const {
      data: { session }
    } = await requireSupabase().auth.getSession();
    const response = await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(result?.error || "No se pudo actualizar el catalogo publico.");
    }
  } catch (error) {
    // La escritura ya fue verificada. Si solo falla la invalidacion, no se
    // presenta el guardado como fallido; la revalidacion normal de 60 s sigue
    // siendo el respaldo.
    console.warn("El cambio se guardo, pero no se pudo refrescar el catalogo.", error);
  }
}

async function guardar<T extends { id: string }>(tabla: string, fila: T): Promise<T> {
  const limpia = clean(fila);
  const { data, error } = await requireSupabase()
    .from(tabla)
    .upsert({ id: fila.id, data: limpia })
    .select("data")
    .single();
  if (error) throw new Error(error.message);
  const guardada = data?.data as T | undefined;
  if (!guardada || guardada.id !== fila.id) {
    throw new Error("La base de datos no confirmo el cambio.");
  }
  await revalidarCatalogoPublico();
  return guardada;
}

async function borrar(tabla: string, id: string) {
  const { data, error } = await requireSupabase()
    .from(tabla)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("La base de datos no confirmo la eliminacion.");
  await revalidarCatalogoPublico();
}

function sortProducts(products: Product[]) {
  return [...products].sort(
    (a, b) => {
      const stateOrder = { active: 0, scheduled: 1, expired: 2, none: 3 };
      const stateDifference = stateOrder[getFeaturedStatus(a)] - stateOrder[getFeaturedStatus(b)];

      return (
        stateDifference ||
        (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
        a.name.localeCompare(b.name)
      );
    }
  );
}

// --- Catalogo publico: Supabase si esta configurado, datos de ejemplo si no ---

function sortVehicles(vehicles: VehicleModel[]) {
  return [...vehicles].sort(
    (a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model)
  );
}

function sortPromos(promos: Promo[]) {
  return [...promos].sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title)
  );
}

// Solo los modelos, para los selectores de vehiculo del dialogo de
// cotizacion: se pide una vez, cuando el cliente abre el formulario.
export async function fetchVehicles(): Promise<VehicleModel[]> {
  if (!supabaseEnabled) return sortVehicles(seedVehicles);

  try {
    return sortVehicles(await listCollection<VehicleModel>(VEHICLES));
  } catch (error) {
    console.error("No se pudieron leer los modelos de vehiculo.", error);
    return sortVehicles(seedVehicles);
  }
}

export async function fetchPublicCatalog(): Promise<{
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
}> {
  if (!supabaseEnabled) {
    return {
      products: seedProducts,
      categories: seedCategories,
      vehicles: sortVehicles(seedVehicles),
      promos: sortPromos(seedPromos)
    };
  }

  try {
    const [products, categories, vehicles, promos] = await Promise.all([
      listCollection<Product>(PRODUCTS),
      listCollection<Category>(CATEGORIES),
      listCollection<VehicleModel>(VEHICLES),
      listCollection<Promo>(PROMOS)
    ]);
    return {
      products: sortProducts(products),
      categories,
      vehicles: sortVehicles(vehicles),
      // Sin promociones propias en Supabase, mostramos las de ejemplo
      // para que el hero luzca completo sin depender de sincronizar.
      promos: sortPromos(promos.length ? promos : seedPromos)
    };
  } catch (error) {
    console.error("No se pudo leer el catalogo desde Supabase.", error);
    return {
      products: seedProducts,
      categories: seedCategories,
      vehicles: sortVehicles(seedVehicles),
      promos: sortPromos(seedPromos)
    };
  }
}

// --- Solicitudes del formulario de contacto -------------------------------

function sortRequests(requests: ContactRequest[]) {
  return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// La deja el VISITANTE (sin sesion): insert plano, nunca upsert — la
// politica RLS del anonimo solo permite insertar, no leer ni actualizar.
// Falla en silencio: el mensaje de WhatsApp es lo primero y no se bloquea.
export async function saveContactRequest(request: ContactRequest) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.requests, [] as ContactRequest[], request);
    return;
  }
  const { error } = await requireSupabase()
    .from(CONTACT_REQUESTS)
    .insert({ id: request.id, data: clean(request) });
  if (error) throw new Error(error.message);
}

export async function fetchContactRequests(): Promise<ContactRequest[]> {
  if (!supabaseEnabled) {
    return sortRequests(readLocal(localKeys.requests, [] as ContactRequest[]));
  }
  return sortRequests(await listCollection<ContactRequest>(CONTACT_REQUESTS));
}

export async function removeContactRequest(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.requests, [] as ContactRequest[], id);
    return;
  }
  await borrar(CONTACT_REQUESTS, id);
}

// --- Admin: Supabase si esta configurado, localStorage en modo demo ---

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function localUpsert<T extends { id: string }>(key: string, fallback: T[], item: T) {
  const current = readLocal(key, fallback);
  const exists = current.some((entry) => entry.id === item.id);
  const next = exists
    ? current.map((entry) => (entry.id === item.id ? item : entry))
    : [item, ...current];
  localStorage.setItem(key, JSON.stringify(next));
}

function localRemove<T extends { id: string }>(key: string, fallback: T[], id: string) {
  const current = readLocal(key, fallback);
  localStorage.setItem(key, JSON.stringify(current.filter((entry) => entry.id !== id)));
}

export function hasLocalAdminData() {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem(LOCAL_MIGRATION_DONE) === "1") return false;
  return Object.values(localKeys).some((key) => localStorage.getItem(key) !== null);
}

async function guardarLote<T extends { id: string }>(tabla: string, filas: T[]) {
  if (!filas.length) return;
  const { data, error } = await requireSupabase()
    .from(tabla)
    .upsert(filas.map((fila) => ({ id: fila.id, data: clean(fila) })))
    .select("id");
  if (error) throw new Error(error.message);
  if (data?.length !== filas.length) {
    throw new Error("La base de datos no confirmo todos los cambios.");
  }
  await revalidarCatalogoPublico();
}

export async function migrateLocalAdminDataToSupabase() {
  if (!supabaseEnabled) throw new Error("Supabase no esta configurado.");

  const products = readLocal(localKeys.products, seedProducts);
  const categories = readLocal(localKeys.categories, seedCategories);
  const vehicles = readLocal(localKeys.vehicles, seedVehicles);
  const promos = readLocal(localKeys.promos, seedPromos);
  const brands = readLocal(localKeys.brands, seedBrands);
  await guardarLote(PRODUCTS, products);
  await guardarLote(CATEGORIES, categories);
  await guardarLote(VEHICLES, vehicles);
  await guardarLote(PROMOS, promos);
  await guardarLote(BRANDS, brands);
  localStorage.setItem(LOCAL_MIGRATION_DONE, "1");

  return {
    products: products.length,
    categories: categories.length,
    vehicles: vehicles.length,
    promos: promos.length,
    brands: brands.length
  };
}

export async function fetchAdminData(): Promise<{
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
  brands: Brand[];
  requests: ContactRequest[];
}> {
  if (!supabaseEnabled) {
    return {
      products: readLocal(localKeys.products, seedProducts),
      categories: readLocal(localKeys.categories, seedCategories),
      vehicles: readLocal(localKeys.vehicles, seedVehicles),
      promos: sortPromos(readLocal(localKeys.promos, seedPromos)),
      brands: readLocal(localKeys.brands, seedBrands),
      requests: await fetchContactRequests()
    };
  }

  const [products, categories, vehicles, promos, brands, requests] = await Promise.all([
    listCollection<Product>(PRODUCTS),
    listCollection<Category>(CATEGORIES),
    listCollection<VehicleModel>(VEHICLES),
    listCollection<Promo>(PROMOS),
    listCollection<Brand>(BRANDS),
    fetchContactRequests()
  ]);

  return {
    products: sortProducts(products),
    categories,
    vehicles,
    promos: sortPromos(promos),
    brands: [...brands].sort((a, b) => a.name.localeCompare(b.name)),
    requests
  };
}

export async function upsertProduct(product: Product) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.products, seedProducts, product);
    return product;
  }
  return guardar(PRODUCTS, product);
}

export async function removeProduct(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.products, seedProducts, id);
    return;
  }
  await borrar(PRODUCTS, id);
}

export async function upsertCategory(category: Category) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.categories, seedCategories, category);
    return category;
  }
  return guardar(CATEGORIES, category);
}

export async function removeCategory(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.categories, seedCategories, id);
    return;
  }
  await borrar(CATEGORIES, id);
}

export async function upsertVehicle(vehicle: VehicleModel) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.vehicles, seedVehicles, vehicle);
    return vehicle;
  }
  return guardar(VEHICLES, vehicle);
}

export async function removeVehicle(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.vehicles, seedVehicles, id);
    return;
  }
  await borrar(VEHICLES, id);
}

export async function upsertPromo(promo: Promo) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.promos, seedPromos, promo);
    return promo;
  }
  return guardar(PROMOS, promo);
}

export async function removePromo(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.promos, seedPromos, id);
    return;
  }
  await borrar(PROMOS, id);
}

export async function upsertBrand(brand: Brand) {
  if (!supabaseEnabled) {
    localUpsert(localKeys.brands, seedBrands, brand);
    return brand;
  }
  return guardar(BRANDS, brand);
}

export async function removeBrand(id: string) {
  if (!supabaseEnabled) {
    localRemove(localKeys.brands, seedBrands, id);
    return;
  }
  await borrar(BRANDS, id);
}

export async function importSeedCatalog() {
  await guardarLote(PRODUCTS, seedProducts);
  await guardarLote(CATEGORIES, seedCategories);
  await guardarLote(VEHICLES, seedVehicles);
  await guardarLote(PROMOS, seedPromos);
}
