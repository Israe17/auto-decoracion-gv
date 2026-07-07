import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch
} from "firebase/firestore";
import { Category, Product, Promo, VehicleModel } from "@/types";
import { categories as seedCategories, products as seedProducts } from "./catalog";
import { firebaseEnabled, getFirebaseServices } from "./firebase";

const PRODUCTS = "products";
const CATEGORIES = "categories";
const VEHICLES = "vehicles";
const PROMOS = "promos";

const localKeys = {
  products: "gv-admin-products",
  categories: "gv-admin-categories",
  vehicles: "gv-admin-vehicles",
  promos: "gv-admin-promos"
};

export const seedPromos: Promo[] = [
  {
    id: "promo-alfombras-hilux",
    title: "Alfombras 5D a la medida para su Hilux",
    subtitle:
      "Protección total del piso original: impermeables, antideslizantes y fáciles de limpiar. Toyota Hilux Revo 2016-2023.",
    image: "/products/alfombras-5d-hilux-revo.webp",
    link: "/productos/alfombras-5d-hilux-revo",
    ctaLabel: "Ver alfombras Hilux",
    order: 1,
    active: true
  },
  {
    id: "promo-alfombras-dmax",
    title: "Estrene alfombras en su Isuzu D-Max",
    subtitle:
      "Cobertura 5D con ajuste perfecto y material TPE premium para D-Max 2020 en adelante.",
    image: "/products/alfombras-5d-isuzu-dmax.webp",
    link: "/productos/alfombras-5d-isuzu-dmax",
    ctaLabel: "Ver alfombras D-Max",
    order: 2,
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

function requireDb() {
  const services = getFirebaseServices();
  if (!services) throw new Error("Firebase no esta configurado.");
  return services.db;
}

// Firestore rechaza valores undefined; el round-trip por JSON los elimina.
function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function listCollection<T>(name: string): Promise<T[]> {
  const snapshot = await getDocs(collection(requireDb(), name));
  return snapshot.docs.map((item) => item.data() as T);
}

function sortProducts(products: Product[]) {
  return [...products].sort(
    (a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
      a.name.localeCompare(b.name)
  );
}

// --- Catalogo publico: Firestore si esta configurado, datos de ejemplo si no ---

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

export async function fetchPublicCatalog(): Promise<{
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
}> {
  if (!firebaseEnabled) {
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
      promos: sortPromos(promos)
    };
  } catch (error) {
    console.error("No se pudo leer el catalogo desde Firestore.", error);
    return {
      products: seedProducts,
      categories: seedCategories,
      vehicles: sortVehicles(seedVehicles),
      promos: sortPromos(seedPromos)
    };
  }
}

// --- Admin: Firestore si esta configurado, localStorage en modo demo ---

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

export async function fetchAdminData(): Promise<{
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
}> {
  if (!firebaseEnabled) {
    return {
      products: readLocal(localKeys.products, seedProducts),
      categories: readLocal(localKeys.categories, seedCategories),
      vehicles: readLocal(localKeys.vehicles, seedVehicles),
      promos: sortPromos(readLocal(localKeys.promos, seedPromos))
    };
  }

  const [products, categories, vehicles, promos] = await Promise.all([
    listCollection<Product>(PRODUCTS),
    listCollection<Category>(CATEGORIES),
    listCollection<VehicleModel>(VEHICLES),
    listCollection<Promo>(PROMOS)
  ]);

  return {
    products: sortProducts(products),
    categories,
    vehicles,
    promos: sortPromos(promos)
  };
}

export async function upsertProduct(product: Product) {
  if (!firebaseEnabled) {
    localUpsert(localKeys.products, seedProducts, product);
    return;
  }
  await setDoc(doc(requireDb(), PRODUCTS, product.id), clean(product));
}

export async function removeProduct(id: string) {
  if (!firebaseEnabled) {
    localRemove(localKeys.products, seedProducts, id);
    return;
  }
  await deleteDoc(doc(requireDb(), PRODUCTS, id));
}

export async function upsertCategory(category: Category) {
  if (!firebaseEnabled) {
    localUpsert(localKeys.categories, seedCategories, category);
    return;
  }
  await setDoc(doc(requireDb(), CATEGORIES, category.id), clean(category));
}

export async function removeCategory(id: string) {
  if (!firebaseEnabled) {
    localRemove(localKeys.categories, seedCategories, id);
    return;
  }
  await deleteDoc(doc(requireDb(), CATEGORIES, id));
}

export async function upsertVehicle(vehicle: VehicleModel) {
  if (!firebaseEnabled) {
    localUpsert(localKeys.vehicles, seedVehicles, vehicle);
    return;
  }
  await setDoc(doc(requireDb(), VEHICLES, vehicle.id), clean(vehicle));
}

export async function removeVehicle(id: string) {
  if (!firebaseEnabled) {
    localRemove(localKeys.vehicles, seedVehicles, id);
    return;
  }
  await deleteDoc(doc(requireDb(), VEHICLES, id));
}

export async function upsertPromo(promo: Promo) {
  if (!firebaseEnabled) {
    localUpsert(localKeys.promos, seedPromos, promo);
    return;
  }
  await setDoc(doc(requireDb(), PROMOS, promo.id), clean(promo));
}

export async function removePromo(id: string) {
  if (!firebaseEnabled) {
    localRemove(localKeys.promos, seedPromos, id);
    return;
  }
  await deleteDoc(doc(requireDb(), PROMOS, id));
}

export async function importSeedCatalog() {
  const db = requireDb();
  const batch = writeBatch(db);

  seedProducts.forEach((product) => batch.set(doc(db, PRODUCTS, product.id), clean(product)));
  seedCategories.forEach((category) =>
    batch.set(doc(db, CATEGORIES, category.id), clean(category))
  );
  seedVehicles.forEach((vehicle) => batch.set(doc(db, VEHICLES, vehicle.id), clean(vehicle)));
  seedPromos.forEach((promo) => batch.set(doc(db, PROMOS, promo.id), clean(promo)));

  await batch.commit();
}
