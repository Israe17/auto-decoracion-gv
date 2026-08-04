"use client";

import { Children, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Car,
  Edit3,
  Download,
  ExternalLink,
  Eye,
  FolderTree,
  Images,
  Megaphone,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Share2,
  ShieldAlert,
  Star,
  Tags,
  Trash2,
  X
} from "lucide-react";
import { formatCRC, productHasPublicPrice } from "@/lib/catalog";
import { clientWhatsAppUrl, productShareWhatsAppUrl } from "@/lib/whatsapp";
import { supabaseEnabled } from "@/lib/supabase";
import {
  getFeaturedStatus,
  isProductFeaturedActive,
  selectActiveFeaturedProducts
} from "@/lib/featured";
import { ImageListField } from "@/components/admin/ImageListField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { ExpandableSpeedDial, type SpeedDialAction } from "@/components/admin/ExpandableSpeedDial";
import { AdminStepper } from "@/components/admin/AdminStepper";
import { AdminSuccessDialog } from "@/components/admin/AdminSuccessDialog";
import { CustomSelect } from "@/components/CustomSelect";
import {
  AdminCollectionSkeleton,
  AdminPanelReveal,
  AdminStatsSkeleton
} from "@/components/admin/AdminLoadingSkeleton";
import {
  fetchAdminData,
  hasLocalAdminData,
  importSeedCatalog,
  migrateLocalAdminDataToSupabase,
  removeBrand,
  removeCategory,
  removeContactRequest,
  removeGalleryItem,
  removeProduct,
  saveProductSource,
  removePromo,
  removeVehicle,
  upsertCategory,
  upsertBrand,
  upsertGalleryItem,
  upsertProduct,
  upsertPromo,
  upsertVehicle
} from "@/lib/store";
import {
  Brand,
  Category,
  ContactRequest,
  GalleryItem,
  GalleryShape,
  Product,
  Promo,
  SaleMode,
  VehicleCompatibility,
  VehicleModel
} from "@/types";

type AdminTab =
  | "products"
  | "offers"
  | "promos"
  | "vehicles"
  | "categories"
  | "brands"
  | "gallery"
  | "requests";

type ConfirmState = {
  title: string;
  body: string;
  actionLabel: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
};

type AdminDetail =
  | { kind: "product"; item: Product }
  | { kind: "offer"; item: Product }
  | { kind: "promo"; item: Promo }
  | { kind: "vehicle"; item: VehicleModel }
  | { kind: "category"; item: Category }
  | { kind: "brand"; item: Brand }
  | { kind: "request"; item: ContactRequest };

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// "tienda.com/p/1" → "https://tienda.com/p/1", que es como la gente copia
// una direccion. Devuelve "" si el campo va vacio y null si no se puede
// leer: solo http y https, un `javascript:` en un enlace del panel seria
// un agujero, no una comodidad.
function normalizarEnlace(valor: string): string | null {
  const limpio = valor.trim();
  if (!limpio) return "";
  // Con espacios no es una direccion, es una frase: `new URL` la aceptaria
  // escapando los espacios y guardariamos basura.
  if (/\s/.test(limpio)) return null;

  try {
    const url = new URL(/^[a-z]+:\/\//i.test(limpio) ? limpio : `https://${limpio}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    // Un correo (`alguien@dominio.com`) se lee como usuario y contrasena.
    if (url.username || url.password) return null;
    // Un dominio de verdad: algo, un punto y su terminacion.
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function emptyProduct(categories: Category[]): Product {
  const category = categories[0];

  return {
    id: crypto.randomUUID(),
    slug: "",
    name: "",
    categorySlug: category?.slug || "",
    categoryName: category?.name || "Sin categoria",
    saleMode: "price_quote",
    price: undefined,
    oldPrice: undefined,
    status: "available",
    compatibilityMode: "universal",
    vehicles: [],
    images: [],
    description: "",
    tags: [],
    brandName: "",
    isOwnBrand: false,
    featured: false
  };
}

function requestDateLabel(request: ContactRequest) {
  const fecha = new Date(request.createdAt);
  if (Number.isNaN(fecha.getTime())) return "Fecha desconocida";
  return fecha.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function featuredStatusLabel(product: Product) {
  const status = getFeaturedStatus(product);
  const until = product.featuredUntil ? ` hasta ${product.featuredUntil}` : "";

  if (status === "active") return `Destacado activo${until}`;
  if (status === "scheduled") return `Programado desde ${product.featuredFrom}`;
  if (status === "expired") return `Destacado vencido ${product.featuredUntil}`;
  return "Sin destacado";
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [migratingLocal, setMigratingLocal] = useState(false);
  const [localMigrationAvailable, setLocalMigrationAvailable] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [productDialog, setProductDialog] = useState<Product | null>(null);
  const [offerDialog, setOfferDialog] = useState<Product | null | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleModel | null>(null);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  // Enlace a la pagina del proveedor por producto. Va aparte del catalogo
  // porque es privado (tabla product_sources, sin lectura publica).
  const [sources, setSources] = useState<Record<string, string>>({});
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryDialogOpen, setGalleryDialogOpen] = useState(false);
  // El detalle es una PILA: navegar a una relacion apila y el boton
  // "Volver" del header regresa al detalle anterior sin cerrar el modal.
  const [detailStack, setDetailStack] = useState<AdminDetail[]>([]);
  const detail = detailStack[detailStack.length - 1] ?? null;
  // Conserva la firma vieja: abrir desde una lista resetea la pila y
  // null la vacia (los onEdit* limpian la pila al pasar al formulario).
  const setDetail = (next: AdminDetail | null) => setDetailStack(next ? [next] : []);
  const pushDetail = (next: AdminDetail) => setDetailStack((stack) => [...stack, next]);
  const popDetail = () => setDetailStack((stack) => stack.slice(0, -1));
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [query, setQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function showSuccess(nextMessage: string) {
    setMessage("");
    setSuccessMessage(nextMessage);
  }

  useEffect(() => {
    let active = true;

    setLocalMigrationAvailable(supabaseEnabled && hasLocalAdminData());

    fetchAdminData()
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setCategories(data.categories);
        setBrands(data.brands);
        setVehicles(data.vehicles);
        setPromos(data.promos);
        setRequests(data.requests);
        setGallery(data.gallery);
        setSources(data.sources);
      })
      .catch((error) => {
        console.error(error);
        if (active) setMessage("No se pudieron cargar los datos. Recargue la pagina.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products.filter((product) => {
      if (term) {
        const haystack = [
          product.name,
          product.categoryName,
          product.status,
          product.tags.join(" ")
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }

      if (vehicleFilter === "universal") {
        return product.compatibilityMode === "universal";
      }
      if (vehicleFilter !== "all") {
        const model = vehicles.find((item) => item.id === vehicleFilter);
        if (!model) return true;
        return product.vehicles.some(
          (entry) =>
            entry.make.toLowerCase() === model.make.toLowerCase() &&
            entry.model.toLowerCase() === model.model.toLowerCase()
        );
      }
      return true;
    });
  }, [products, query, vehicleFilter, vehicles]);

  const productCountByVehicle = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach((model) => {
      counts[model.id] = products.filter((product) =>
        product.vehicles.some(
          (entry) =>
            entry.make.toLowerCase() === model.make.toLowerCase() &&
            entry.model.toLowerCase() === model.model.toLowerCase()
        )
      ).length;
    });
    return counts;
  }, [products, vehicles]);

  const offerProducts = products.filter((product) => product.oldPrice || product.featured);
  const activeFeaturedProducts = useMemo(
    () => selectActiveFeaturedProducts(products, 4),
    [products]
  );
  const scheduledFeaturedCount = useMemo(
    () => products.filter((product) => getFeaturedStatus(product) === "scheduled").length,
    [products]
  );

  const stats = {
    products: products.length,
    offers: products.filter((product) => product.oldPrice).length,
    featured: products.filter((product) => isProductFeaturedActive(product)).length,
    categories: categories.length,
    vehicles: vehicles.length,
    brands: brands.length
  };

  // Avisos accionables: cada uno se calcula de los datos reales y lleva a
  // la pestana donde se arregla. Nunca se inventa un problema: si la lista
  // esta vacia, el panel felicita en vez de mostrar ruido.
  const attention = useMemo(() => {
    const noImage = products.filter((product) => !product.images?.[0]);
    const noPrice = products.filter(
      (product) => product.saleMode === "price_quote" && !product.price
    );
    const soldOut = products.filter((product) => product.status === "sold_out");
    const badOffer = products.filter(
      (product) =>
        product.oldPrice && product.price && product.oldPrice <= product.price
    );
    const expiredFeatured = products.filter(
      (product) => getFeaturedStatus(product) === "expired"
    );

    return [
      {
        id: "no-image",
        label: "Sin foto",
        hint: "No se ven en el catalogo",
        items: noImage,
        tone: "danger" as const
      },
      {
        id: "no-price",
        label: "Con precio vacio",
        hint: "Marcados para mostrar precio",
        items: noPrice,
        tone: "danger" as const
      },
      {
        id: "bad-offer",
        label: "Oferta sin descuento",
        hint: "El precio anterior no es mayor",
        items: badOffer,
        tone: "warn" as const
      },
      {
        id: "expired-featured",
        label: "Destacados vencidos",
        hint: "Ya no salen en la portada",
        items: expiredFeatured,
        tone: "warn" as const
      },
      {
        id: "sold-out",
        label: "Agotados",
        hint: "Visibles pero sin existencias",
        items: soldOut,
        tone: "info" as const
      }
    ].filter((row) => row.items.length > 0);
  }, [products]);

  // Resumen del catalogo: categorias con mas productos (solo las que
  // tienen), para ver de un vistazo donde esta cargado el inventario.
  const categoryBreakdown = useMemo(() => {
    const counts = categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        total: products.filter((product) => product.categorySlug === category.slug).length
      }))
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total);
    const max = counts[0]?.total ?? 1;
    return { rows: counts.slice(0, 6), max, empty: categories.length - counts.length };
  }, [categories, products]);

  const productCountByBrand = useMemo(() => {
    const counts: Record<string, number> = {};
    brands.forEach((brand) => {
      counts[brand.id] = products.filter((product) => product.brandId === brand.id).length;
    });
    return counts;
  }, [brands, products]);

  function reportError(error: unknown) {
    console.error(error);
    setSuccessMessage("");
    setMessage("No se pudo guardar el cambio. Revise la conexion e intente de nuevo.");
  }

  function confirmImportSeed() {
    setConfirmState({
      title: "Sincronizar catalogo de ejemplo",
      body: "Se agregaran los productos, categorias y modelos de ejemplo nuevos. Los elementos de ejemplo ya existentes volveran a su version original; los que usted creo aparte no se tocan.",
      actionLabel: "Sincronizar",
      onConfirm: handleImportSeed
    });
  }

  // Descarga TODO el catalogo tal como esta en Firestore, en un solo JSON.
  // Es la unica via para sacar los datos sin credenciales de servicio: el
  // navegador del admin ya tiene permiso de lectura, el exterior no.
  function exportarDatos() {
    const contenido = {
      exportadoEl: new Date().toISOString(),
      origen: "firestore",
      products,
      categories,
      vehicles,
      promos,
      brands
    };
    const blob = new Blob([JSON.stringify(contenido, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `auto-decoracion-gv-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    enlace.click();
    URL.revokeObjectURL(url);
  }

  function confirmLocalMigration() {
    setConfirmState({
      title: "Migrar datos locales a Supabase",
      body: "Se copiaran a Supabase los productos, categorias, modelos, promociones y marcas guardados en este navegador. Los datos locales se conservaran como respaldo.",
      actionLabel: "Migrar a Supabase",
      onConfirm: handleLocalMigration
    });
  }

  async function handleLocalMigration() {
    setMigratingLocal(true);
    try {
      const migrated = await migrateLocalAdminDataToSupabase();
      const data = await fetchAdminData();
      setProducts(data.products);
      setCategories(data.categories);
      setBrands(data.brands);
      setVehicles(data.vehicles);
      setPromos(data.promos);
      setLocalMigrationAvailable(false);
      showSuccess(
        `Migracion completa: ${migrated.products} productos, ${migrated.categories} categorias y ${migrated.vehicles} modelos.`
      );
    } catch (error) {
      reportError(error);
    } finally {
      setMigratingLocal(false);
    }
  }

  async function handleImportSeed() {
    setImporting(true);
    try {
      await importSeedCatalog();
      const data = await fetchAdminData();
      setProducts(data.products);
      setCategories(data.categories);
      setBrands(data.brands);
      setVehicles(data.vehicles);
      setPromos(data.promos);
      showSuccess("Catálogo de ejemplo importado.");
    } catch (error) {
      reportError(error);
    } finally {
      setImporting(false);
    }
  }

  async function saveProduct(product: Product, sourceUrl: string) {
    const exists = products.some((item) => item.id === product.id);
    try {
      const savedProduct = await upsertProduct(product);
      // El enlace del proveedor se guarda aparte (tabla privada). Si el
      // producto se guardo pero el enlace falla, el error se reporta pero
      // el catalogo ya quedo bien: no se revierte nada.
      await saveProductSource(savedProduct.id, sourceUrl);
      setProducts(
        exists
          ? products.map((item) => (item.id === product.id ? savedProduct : item))
          : [savedProduct, ...products]
      );
      setSources((prev) => {
        const next = { ...prev };
        const limpia = sourceUrl.trim();
        if (limpia) next[savedProduct.id] = limpia;
        else delete next[savedProduct.id];
        return next;
      });
      showSuccess(exists ? "Producto actualizado." : "Producto creado.");
      setProductDialog(null);
    } catch (error) {
      reportError(error);
    }
  }

  async function saveOffer(
    productId: string,
    oldPrice?: number,
    featured = false,
    featuredOrder?: number,
    featuredFrom?: string,
    featuredUntil?: string
  ) {
    const target = products.find((product) => product.id === productId);
    if (!target) return;

    const updated: Product = {
      ...target,
      oldPrice: productHasPublicPrice(target) ? oldPrice : undefined,
      featured,
      featuredFrom: featured ? featuredFrom : undefined,
      featuredUntil: featured ? featuredUntil : undefined,
      featuredOrder: featured ? featuredOrder : undefined
    };

    try {
      const savedProduct = await upsertProduct(updated);
      setProducts(products.map((item) => (item.id === productId ? savedProduct : item)));
      showSuccess("Oferta y destacado actualizados.");
      setOfferDialog(undefined);
    } catch (error) {
      reportError(error);
    }
  }

  function confirmDeleteProduct(product: Product) {
    setConfirmState({
      title: "Eliminar producto",
      body: `Se eliminara "${product.name}" del catalogo. Esta accion no se puede deshacer.`,
      actionLabel: "Eliminar producto",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removeProduct(product.id);
          setProducts((prev) => prev.filter((item) => item.id !== product.id));
          setSources((prev) => {
            const next = { ...prev };
            delete next[product.id];
            return next;
          });
          showSuccess("Producto eliminado.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  function confirmRemoveOffer(product: Product) {
    const label = product.oldPrice ? "Quitar oferta" : "Quitar destacado";
    setConfirmState({
      title: label,
      body: `Se quitara la promocion de "${product.name}". El producto seguira en el catalogo.`,
      actionLabel: label,
      onConfirm: async () => {
        const updated: Product = {
          ...product,
          oldPrice: undefined,
          featured: false,
          featuredFrom: undefined,
          featuredUntil: undefined,
          featuredOrder: undefined
        };
        try {
          const savedProduct = await upsertProduct(updated);
          setProducts((prev) => prev.map((item) => (item.id === product.id ? savedProduct : item)));
          showSuccess("Promoción eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("categoryName") || "").trim();
    const parent = String(form.get("categoryParent") || "").trim();
    const category: Category = {
      id: editingCategory?.id || makeSlug(name),
      slug: editingCategory?.slug || makeSlug(name),
      name,
      description: String(form.get("categoryDescription") || ""),
      image: String(form.get("categoryImage") || "").trim(),
      parent: parent || undefined
    };

    const exists = categories.some((item) => item.id === category.id);
    try {
      const savedCategory = await upsertCategory(category);
      setCategories(
        exists
          ? categories.map((item) => (item.id === category.id ? savedCategory : item))
          : [savedCategory, ...categories]
      );
      showSuccess(exists ? "Categoría e imagen actualizadas." : "Categoría creada.");
      setEditingCategory(null);
      setCategoryDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
  }

  async function handlePromoSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const title = String(form.get("promoTitle") || "").trim();
    const promo: Promo = {
      id: editingPromo?.id || `promo-${makeSlug(title)}`,
      title,
      subtitle: String(form.get("promoSubtitle") || "").trim() || undefined,
      image: String(form.get("promoImage") || "").trim(),
      link: String(form.get("promoLink") || "").trim() || undefined,
      ctaLabel: String(form.get("promoCta") || "").trim() || undefined,
      order: Number(form.get("promoOrder")) || undefined,
      active: form.get("promoActive") === "on"
    };

    const exists = promos.some((item) => item.id === promo.id);
    try {
      const savedPromo = await upsertPromo(promo);
      setPromos(
        exists
          ? promos.map((item) => (item.id === promo.id ? savedPromo : item))
          : [...promos, savedPromo]
      );
      showSuccess(exists ? "Promoción actualizada." : "Promoción creada.");
      setEditingPromo(null);
      setPromoDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
  }

  function confirmDeletePromo(promo: Promo) {
    setConfirmState({
      title: "Eliminar promocion",
      body: `Se eliminara "${promo.title}" del carrusel del inicio.`,
      actionLabel: "Eliminar promocion",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removePromo(promo.id);
          setPromos((prev) => prev.filter((item) => item.id !== promo.id));
          showSuccess("Promoción eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  function confirmDeleteCategory(category: Category) {
    const children = categories.filter((item) => item.parent === category.slug);
    setConfirmState({
      title: "Eliminar categoria",
      body: children.length
        ? `"${category.name}" tiene ${children.length} subcategoría(s). Al eliminarla, esas subcategorías quedarán sin madre (pasan a principales). Puede reasignarles otra madre después.`
        : `Se eliminara "${category.name}" de la administracion.`,
      actionLabel: "Eliminar categoria",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removeCategory(category.id);
          setCategories((prev) => prev.filter((item) => item.id !== category.id));
          showSuccess("Categoría eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  async function handleVehicleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const make = String(form.get("make") || "").trim();
    const model = String(form.get("model") || "").trim();
    const vehicle: VehicleModel = {
      id: editingVehicle?.id || `${makeSlug(make)}-${makeSlug(model)}`,
      make,
      model,
      fromYear: Number(form.get("fromYear")) || undefined,
      toYear: Number(form.get("toYear")) || undefined
    };

    const exists = vehicles.some((item) => item.id === vehicle.id);
    try {
      const savedVehicle = await upsertVehicle(vehicle);
      setVehicles(
        exists
          ? vehicles.map((item) => (item.id === vehicle.id ? savedVehicle : item))
          : [savedVehicle, ...vehicles]
      );
      showSuccess(exists ? "Modelo actualizado." : "Modelo creado.");
      setEditingVehicle(null);
      setVehicleDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
  }

  function confirmDeleteRequest(request: ContactRequest) {
    setConfirmState({
      title: "Eliminar solicitud",
      body: `Se eliminara la solicitud de "${request.name}". Si aun no le respondio, considere contactarle primero.`,
      actionLabel: "Eliminar solicitud",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removeContactRequest(request.id);
          setRequests((prev) => prev.filter((item) => item.id !== request.id));
          showSuccess("Solicitud eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  function confirmDeleteVehicle(vehicle: VehicleModel) {
    const linked = productCountByVehicle[vehicle.id] || 0;
    setConfirmState({
      title: "Eliminar modelo",
      body: linked
        ? `"${vehicle.make} ${vehicle.model}" esta vinculado a ${linked} producto(s); esos productos conservaran su compatibilidad, pero el modelo dejara de aparecer en los filtros y formularios.`
        : `Se eliminara "${vehicle.make} ${vehicle.model}" de compatibilidad.`,
      actionLabel: "Eliminar modelo",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removeVehicle(vehicle.id);
          setVehicles((prev) => prev.filter((item) => item.id !== vehicle.id));
          showSuccess("Modelo eliminado.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  async function handleGallerySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const orden = Number(form.get("galleryOrder"));
    const item: GalleryItem = {
      id: editingGallery?.id || `galeria-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      image: String(form.get("galleryImage") || "").trim(),
      title: String(form.get("galleryTitle") || "").trim() || undefined,
      description: String(form.get("galleryDescription") || "").trim() || undefined,
      shape: (String(form.get("galleryShape") || "vertical") as GalleryShape),
      order: Number.isFinite(orden) && orden > 0 ? orden : undefined,
      createdAt: editingGallery?.createdAt || new Date().toISOString()
    };

    if (!item.image) {
      setMessage("Suba la foto del trabajo antes de guardar.");
      return;
    }

    const exists = gallery.some((entry) => entry.id === item.id);

    try {
      const guardado = await upsertGalleryItem(item);
      setGallery((current) =>
        exists
          ? current.map((entry) => (entry.id === item.id ? guardado : entry))
          : [...current, guardado]
      );
      showSuccess(exists ? "Foto actualizada." : "Foto agregada a la galería.");
      setEditingGallery(null);
      setGalleryDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
  }

  function confirmDeleteGallery(item: GalleryItem) {
    setConfirmState({
      title: "Quitar foto de la galería",
      body: `La foto${item.title ? ` "${item.title}"` : ""} dejará de aparecer en la página de galería.`,
      actionLabel: "Quitar foto",
      tone: "danger",
      onConfirm: async () => {
        try {
          await removeGalleryItem(item.id);
          setGallery((current) => current.filter((entry) => entry.id !== item.id));
          showSuccess("Foto eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  async function handleBrandSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("brandName") || "").trim();
    const brand: Brand = {
      id: editingBrand?.id || `brand-${makeSlug(name)}`,
      slug: editingBrand?.slug || makeSlug(name),
      name,
      description: String(form.get("brandDescription") || "").trim() || undefined,
      logo: String(form.get("brandLogo") || "").trim() || undefined
    };
    const exists = brands.some((item) => item.id === brand.id);
    const renamedProducts = editingBrand && editingBrand.name !== brand.name
      ? products
          .filter((product) => !product.isOwnBrand && product.brandId === brand.id)
          .map((product) => ({ ...product, brandName: brand.name }))
      : [];

    try {
      const savedBrand = await upsertBrand(brand);
      await Promise.all(renamedProducts.map((product) => upsertProduct(product)));
      setBrands((current) =>
        (exists
          ? current.map((item) => (item.id === brand.id ? savedBrand : item))
          : [...current, savedBrand]
        ).sort((a, b) => a.name.localeCompare(b.name))
      );
      if (renamedProducts.length) {
        setProducts((current) =>
          current.map((product) =>
            product.brandId === brand.id && !product.isOwnBrand
              ? { ...product, brandName: brand.name }
              : product
          )
        );
      }
      showSuccess(exists ? "Marca actualizada." : "Marca creada.");
      setEditingBrand(null);
      setBrandDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
  }

  function confirmDeleteBrand(brand: Brand) {
    const linked = productCountByBrand[brand.id] || 0;
    setConfirmState({
      title: "Eliminar marca",
      body: linked
        ? `"${brand.name}" esta asignada a ${linked} producto(s). Al eliminarla, esos productos quedaran sin marca externa.`
        : `Se eliminara "${brand.name}" de la administracion.`,
      actionLabel: "Eliminar marca",
      tone: "danger",
      onConfirm: async () => {
        const detachedProducts = products
          .filter((product) => product.brandId === brand.id)
          .map((product) => ({ ...product, brandId: undefined, brandName: undefined }));
        try {
          await Promise.all(detachedProducts.map((product) => upsertProduct(product)));
          await removeBrand(brand.id);
          setBrands((current) => current.filter((item) => item.id !== brand.id));
          if (detachedProducts.length) {
            setProducts((current) =>
              current.map((product) =>
                product.brandId === brand.id
                  ? { ...product, brandId: undefined, brandName: undefined }
                  : product
              )
            );
          }
          showSuccess("Marca eliminada.");
        } catch (error) {
          reportError(error);
        }
      }
    });
  }

  const tabs: [AdminTab, string][] = [
    ["products", "Productos"],
    ["offers", "Ofertas"],
    ["promos", "Promociones"],
    ["vehicles", "Modelos de autos"],
    ["categories", "Categorias"],
    ["brands", "Marcas"],
    ["gallery", "Galería"],
    ["requests", "Solicitudes"]
  ];

  const sectionIcons: Record<AdminTab, ReactNode> = {
    products: <Tags size={20} />,
    offers: <Star size={20} />,
    promos: <Megaphone size={20} />,
    vehicles: <Car size={20} />,
    categories: <FolderTree size={20} />,
    brands: <BadgeCheck size={20} />,
    gallery: <Images size={20} />,
    requests: <MessageCircle size={20} />
  };

  const speedDialActions: SpeedDialAction[] = tabs.map(([id, label]) => ({
    icon: sectionIcons[id],
    label,
    active: activeTab === id,
    onClick: () => setActiveTab(id)
  }));

  return (
    <section className="section admin-page admin-dashboard">
      <div className="admin-heading">
        <div>
          <span className="section-head__pill">
            <ShieldAlert size={14} /> Panel privado
          </span>
          <h1>Administración del catálogo</h1>
          <p>Gestione productos, ofertas, modelos de autos y categorias desde una sola pantalla.</p>
        </div>
        <div className="admin-heading__meta">
          <span
            className={`admin-mode${supabaseEnabled ? " admin-mode--live" : ""}`}
            title={
              supabaseEnabled
                ? "Los cambios se publican en el sitio"
                : "Los cambios se guardan solo en este navegador"
            }
          >
            <i aria-hidden="true" />
            {supabaseEnabled ? "Supabase" : "Local demo"}
          </span>
          {!loading && (products.length > 0 || categories.length > 0) && (
            <button
              className="admin-mode__sync"
              type="button"
              onClick={exportarDatos}
              title="Descarga todo el catalogo en un archivo JSON de respaldo"
            >
              <Download size={13} />
              Exportar respaldo
            </button>
          )}

          {supabaseEnabled && !loading && (products.length > 0 || categories.length > 0) && (
            <button
              className="admin-mode__sync"
              type="button"
              disabled={importing}
              onClick={confirmImportSeed}
              title="Restaura los productos de ejemplo a su version original"
            >
              <RefreshCw size={13} />
              {importing ? "Sincronizando..." : "Catalogo de ejemplo"}
            </button>
          )}
        </div>
      </div>

      {!supabaseEnabled && (
        <div className="notice">
          <ShieldAlert size={20} />
          Los cambios se guardan en este navegador. Luego conectamos Supabase para publicarlos en
          todos los dispositivos.
        </div>
      )}

      {supabaseEnabled && localMigrationAvailable && (
        <div className="notice">
          <ShieldAlert size={20} />
          <span>Hay datos del modo Local demo guardados en este navegador.</span>
          <button
            className="button button--secondary"
            type="button"
            disabled={migratingLocal}
            onClick={confirmLocalMigration}
          >
            {migratingLocal ? "Migrando..." : "Migrar datos locales a Supabase"}
          </button>
        </div>
      )}

      {supabaseEnabled && !loading && !products.length && !categories.length && (
        <div className="notice">
          <ShieldAlert size={20} />
          <span>La base de datos esta vacia. Puede importar el catalogo de ejemplo para empezar.</span>
          <button
            className="button button--secondary"
            type="button"
            disabled={importing}
            onClick={handleImportSeed}
          >
            {importing ? "Importando..." : "Importar catalogo de ejemplo"}
          </button>
        </div>
      )}

      <div className="admin-stats">
        {loading ? (
          <AdminStatsSkeleton />
        ) : (
          <>
            <div>
              <span>
                <Tags size={15} /> Productos
              </span>
              <strong>{stats.products}</strong>
            </div>
            <div>
              <span>
                <Megaphone size={15} /> Ofertas
              </span>
              <strong>{stats.offers}</strong>
            </div>
            <div>
              <span>
                <Star size={15} /> Destacados activos
              </span>
              <strong>{stats.featured}</strong>
            </div>
            <div>
              <span>
                <FolderTree size={15} /> Categorias
              </span>
              <strong>{stats.categories}</strong>
            </div>
            <div>
              <span>
                <Car size={15} /> Modelos
              </span>
              <strong>{stats.vehicles}</strong>
            </div>
            <div>
              <span>
                <BadgeCheck size={15} /> Marcas
              </span>
              <strong>{stats.brands}</strong>
            </div>
          </>
        )}
      </div>

      {!loading && (
        <div className="admin-dash">
          <section className="admin-dash__card admin-dash__card--attention">
            <div className="admin-dash__title">
              <ShieldAlert size={17} />
              <strong>Requiere atencion</strong>
            </div>
            {attention.length ? (
              <ul className="admin-dash__list">
                {attention.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className={`admin-dash__row admin-dash__row--${row.tone}`}
                      onClick={() => setActiveTab("products")}
                    >
                      <span className="admin-dash__count">{row.items.length}</span>
                      <span className="admin-dash__text">
                        <strong>{row.label}</strong>
                        <small>{row.hint}</small>
                      </span>
                      <span className="admin-dash__names">
                        {row.items
                          .slice(0, 2)
                          .map((item) => item.name)
                          .join(", ")}
                        {row.items.length > 2 ? ` +${row.items.length - 2}` : ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-dash__ok">
                <BadgeCheck size={17} /> Todo en orden: sin productos incompletos ni
                ofertas mal configuradas.
              </p>
            )}
          </section>

          <section className="admin-dash__card">
            <div className="admin-dash__title">
              <Plus size={17} />
              <strong>Accesos rapidos</strong>
            </div>
            <div className="admin-dash__quick">
              <button type="button" onClick={() => setActiveTab("products")}>
                <Tags size={16} /> Nuevo producto
              </button>
              <button type="button" onClick={() => setActiveTab("offers")}>
                <Megaphone size={16} /> Ofertas
              </button>
              <button type="button" onClick={() => setActiveTab("promos")}>
                <Star size={16} /> Promociones
              </button>
              <a href="/" target="_blank" rel="noopener">
                <Eye size={16} /> Ver el sitio
              </a>
            </div>
          </section>

          <section className="admin-dash__card">
            <div className="admin-dash__title">
              <FolderTree size={17} />
              <strong>Catalogo por categoria</strong>
            </div>
            {categoryBreakdown.rows.length ? (
              <ul className="admin-dash__bars">
                {categoryBreakdown.rows.map((row) => (
                  <li key={row.id}>
                    <span className="admin-dash__bar-label">
                      {row.name}
                      <b>{row.total}</b>
                    </span>
                    <span className="admin-dash__bar" aria-hidden="true">
                      <i style={{ width: `${(row.total / categoryBreakdown.max) * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-dash__ok">Aun no hay productos cargados.</p>
            )}
            {categoryBreakdown.empty > 0 && (
              <p className="admin-dash__note">
                {categoryBreakdown.empty} categoria(s) todavia sin productos.
              </p>
            )}
          </section>
        </div>
      )}

      <div className="admin-tabs" role="tablist" aria-label="Administracion">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="admin-speed-dial">
        <ExpandableSpeedDial actions={speedDialActions} />
      </div>

      {message && <p className="form-status form-status--error" role="alert">{message}</p>}
      {successMessage && (
        <AdminSuccessDialog
          key={successMessage}
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}

      {loading && <AdminCollectionSkeleton tab={activeTab} />}

      {!loading && activeTab === "products" && (
        <AdminPanelReveal tab="products">
          <div className="admin-products-stack">
            <FeaturedOverview
              products={activeFeaturedProducts}
              scheduledCount={scheduledFeaturedCount}
              onManage={() => setActiveTab("offers")}
              onEdit={setOfferDialog}
            />
            <ProductAdminPanel
              products={filteredProducts}
              query={query}
              onQueryChange={setQuery}
              vehicles={vehicles}
              vehicleFilter={vehicleFilter}
              onVehicleFilterChange={setVehicleFilter}
              onCreate={() => setProductDialog(emptyProduct(categories))}
              onView={(product) => setDetail({ kind: "product", item: product })}
              onEdit={setProductDialog}
              onOffer={setOfferDialog}
              onDelete={confirmDeleteProduct}
            />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "offers" && (
        <AdminPanelReveal tab="offers">
          <AdminOfferList
            products={offerProducts}
            allProducts={products}
            empty="No hay productos marcados como oferta o destacados."
            onCreate={() => setOfferDialog(null)}
            onView={(product) => setDetail({ kind: "offer", item: product })}
            onEdit={setOfferDialog}
            onRemove={confirmRemoveOffer}
          />
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "promos" && (
        <AdminPanelReveal tab="promos">
          <div className="admin-workspace admin-workspace--simple">
          <form
            key={editingPromo?.id || "new-promo"}
            className="admin-form admin-form--panel"
            onSubmit={handlePromoSubmit}
          >
            <div className="form-section">
              <div className="form-section__header">
                <Megaphone size={20} />
                <div>
                  <strong>{editingPromo ? "Editar promocion" : "Nueva promocion"}</strong>
                  <span>Banners del carrusel de inicio, en el orden que usted defina.</span>
                </div>
              </div>
              <label>
                Titulo de la lamina
                <input name="promoTitle" required defaultValue={editingPromo?.title} />
              </label>
              <label>
                Subtitulo (opcional)
                <textarea
                  name="promoSubtitle"
                  rows={2}
                  defaultValue={editingPromo?.subtitle}
                />
              </label>
              <ImageUploadField
                name="promoImage"
                label="Imagen (banner)"
                ancho={1600}
                alto={720}
                defaultValue={editingPromo?.image}
                required
                folder="promos"
              />
              <div className="form-grid form-grid--two">
                <label>
                  Enlace del boton
                  <input
                    name="promoLink"
                    placeholder="/catalogo?categoria=alfombras"
                    defaultValue={editingPromo?.link}
                  />
                </label>
                <label>
                  Texto del boton
                  <input
                    name="promoCta"
                    placeholder="Ver promoción"
                    defaultValue={editingPromo?.ctaLabel}
                  />
                </label>
              </div>
              <div className="form-grid form-grid--two">
                <label>
                  Orden
                  <input name="promoOrder" type="number" defaultValue={editingPromo?.order} />
                </label>
                <label className="checkbox-row">
                  <input
                    name="promoActive"
                    type="checkbox"
                    defaultChecked={editingPromo ? editingPromo.active !== false : true}
                  />
                  <span>Visible en el inicio</span>
                </label>
              </div>
              <button className="button button--primary" type="submit">
                <Save size={18} /> Guardar promocion
              </button>
            </div>
          </form>

          <AdminSimpleList
            title="Promociones del inicio"
            empty="No hay promociones; el carrusel muestra las categorias."
            createLabel="Nueva promocion"
            onCreate={() => {
              setEditingPromo(null);
              setPromoDialogOpen(true);
            }}
            items={promos.map((promo) => ({
              id: promo.id,
              title: promo.title,
              meta: `${promo.active === false ? "Oculta" : "Visible"} · orden ${
                promo.order ?? "—"
              }${promo.link ? ` · ${promo.link}` : ""}`,
              image: promo.image,
              onView: () => setDetail({ kind: "promo", item: promo }),
              onEdit: () => {
                setEditingPromo(promo);
                setPromoDialogOpen(true);
              },
              onDelete: () => confirmDeletePromo(promo)
            }))}
          />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "vehicles" && (
        <AdminPanelReveal tab="vehicles">
          <div className="admin-workspace admin-workspace--simple">
          <form
            key={editingVehicle?.id || "new-vehicle"}
            className="admin-form admin-form--panel"
            onSubmit={handleVehicleSubmit}
          >
            <div className="form-section">
              <div className="form-section__header">
                <Car size={20} />
                <div>
                  <strong>{editingVehicle ? "Editar modelo" : "Nuevo modelo"}</strong>
                  <span>Marcas, modelos y rangos de ano para compatibilidad.</span>
                </div>
              </div>
              <div className="form-grid form-grid--four">
                <label>
                  Marca
                  <input name="make" required defaultValue={editingVehicle?.make} />
                </label>
                <label>
                  Modelo
                  <input name="model" required defaultValue={editingVehicle?.model} />
                </label>
                <label>
                  Desde
                  <input name="fromYear" type="number" defaultValue={editingVehicle?.fromYear} />
                </label>
                <label>
                  Hasta
                  <input name="toYear" type="number" defaultValue={editingVehicle?.toYear} />
                </label>
              </div>
              <button className="button button--primary" type="submit">
                <Save size={18} /> Guardar modelo
              </button>
            </div>
          </form>

          <AdminSimpleList
            title="Modelos registrados"
            createLabel="Nuevo modelo"
            onCreate={() => {
              setEditingVehicle(null);
              setVehicleDialogOpen(true);
            }}
            items={vehicles.map((vehicle) => ({
              id: vehicle.id,
              title: `${vehicle.make} ${vehicle.model}`,
              meta: `${
                vehicle.fromYear && vehicle.toYear
                  ? `${vehicle.fromYear}-${vehicle.toYear}`
                  : "Sin rango definido"
              } · ${productCountByVehicle[vehicle.id] || 0} producto(s)`,
              onView: () => setDetail({ kind: "vehicle", item: vehicle }),
              onEdit: () => {
                setEditingVehicle(vehicle);
                setVehicleDialogOpen(true);
              },
              onDelete: () => confirmDeleteVehicle(vehicle)
            }))}
          />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "categories" && (
        <AdminPanelReveal tab="categories">
          <div className="admin-workspace admin-workspace--simple">
          <form
            key={editingCategory?.id || "new-category"}
            className="admin-form admin-form--panel"
            onSubmit={handleCategorySubmit}
          >
            <div className="form-section">
              <div className="form-section__header">
                <FolderTree size={20} />
                <div>
                  <strong>{editingCategory ? "Editar categoria" : "Nueva categoria"}</strong>
                  <span>Lineas principales del catalogo.</span>
                </div>
              </div>
              <label>
                Nombre
                <input name="categoryName" required defaultValue={editingCategory?.name} />
              </label>
              <label>
                Descripcion
                <textarea
                  name="categoryDescription"
                  rows={3}
                  defaultValue={editingCategory?.description}
                />
              </label>
              <ImageUploadField
                name="categoryImage"
                label="Imagen"
                ancho={1200}
                alto={720}
                defaultValue={editingCategory?.image}
                folder="categories"
              />
              <label>
                Categoría madre
                <CustomSelect
                  ariaLabel="Categoría madre"
                  name="categoryParent"
                  defaultValue={editingCategory?.parent || ""}
                  options={[
                    { label: "Ninguna (categoría principal)", value: "" },
                    ...categories
                    .filter(
                      (item) => !item.parent && item.id !== editingCategory?.id
                    )
                    .map((item) => ({ label: item.name, value: item.slug }))
                  ]}
                />
              </label>
              <button className="button button--primary" type="submit">
                <Save size={18} /> Guardar categoria
              </button>
            </div>
          </form>

          <AdminSimpleList
            title="Categorias registradas"
            createLabel="Nueva categoria"
            onCreate={() => {
              setEditingCategory(null);
              setCategoryDialogOpen(true);
            }}
            items={[...categories]
              .sort((a, b) => {
                const pa = a.parent || a.slug;
                const pb = b.parent || b.slug;
                return pa.localeCompare(pb) || (a.parent ? 1 : 0) - (b.parent ? 1 : 0);
              })
              .map((category) => {
                const madre = category.parent
                  ? categories.find((item) => item.slug === category.parent)
                  : null;
                return {
                  id: category.id,
                  title: madre ? `↳ ${category.name}` : category.name,
                  meta: madre
                    ? `Subcategoría de ${madre.name}`
                    : category.description,
                  image: category.image,
                  onView: () => setDetail({ kind: "category", item: category }),
                  onEdit: () => {
                    setEditingCategory(category);
                    setCategoryDialogOpen(true);
                  },
                  onDelete: () => confirmDeleteCategory(category)
                };
              })}
          />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "brands" && (
        <AdminPanelReveal tab="brands">
          <div className="admin-workspace admin-workspace--simple">
            <form
              key={editingBrand?.id || "new-brand"}
              className="admin-form admin-form--panel"
              onSubmit={handleBrandSubmit}
            >
              <div className="form-section">
                <div className="form-section__header">
                  <BadgeCheck size={20} />
                  <div>
                    <strong>{editingBrand ? "Editar marca" : "Nueva marca"}</strong>
                    <span>Marcas comerciales que puede asignar a los productos.</span>
                  </div>
                </div>
                <label>
                  Nombre
                  <input name="brandName" required defaultValue={editingBrand?.name} placeholder="Ej: Hella" />
                </label>
                <label>
                  Descripcion (opcional)
                  <textarea name="brandDescription" rows={3} defaultValue={editingBrand?.description} />
                </label>
                <ImageUploadField
                  name="brandLogo"
                  label="Logo de la marca (opcional)"
                  ancho={600}
                  alto={600}
                  defaultValue={editingBrand?.logo}
                  folder="brands"
                />
                <button className="button button--primary" type="submit">
                  <Save size={18} /> Guardar marca
                </button>
              </div>
            </form>

            <AdminSimpleList
              title="Marcas registradas"
              empty="Todavia no hay marcas. Cree una para poder asignarla a sus productos."
              createLabel="Nueva marca"
              onCreate={() => {
                setEditingBrand(null);
                setBrandDialogOpen(true);
              }}
              items={brands.map((brand) => ({
                id: brand.id,
                title: brand.name,
                meta: `${brand.description || "Sin descripcion"} · ${productCountByBrand[brand.id] || 0} producto(s)`,
                image: brand.logo,
                onView: () => setDetail({ kind: "brand", item: brand }),
                onEdit: () => {
                  setEditingBrand(brand);
                  setBrandDialogOpen(true);
                },
                onDelete: () => confirmDeleteBrand(brand)
              }))}
            />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "gallery" && (
        <AdminPanelReveal tab="gallery">
          <div className="admin-workspace admin-workspace--simple">
            <AdminSimpleList
              title="Galería de trabajos"
              empty="Todavía no hay fotos. Suba trabajos terminados del taller: es lo que más convence al cliente."
              createLabel="Nueva foto"
              onCreate={() => {
                setEditingGallery(null);
                setGalleryDialogOpen(true);
              }}
              items={gallery.map((item) => ({
                id: item.id,
                title: item.title || "Trabajo del taller",
                meta: `${item.shape}${item.order ? ` · orden ${item.order}` : ""}${
                  item.description ? ` · ${item.description}` : ""
                }`,
                image: item.image,
                onView: () => window.open("/galeria", "_blank", "noopener"),
                onEdit: () => {
                  setEditingGallery(item);
                  setGalleryDialogOpen(true);
                },
                onDelete: () => confirmDeleteGallery(item)
              }))}
            />
          </div>
        </AdminPanelReveal>
      )}

      {!loading && activeTab === "requests" && (
        <AdminPanelReveal tab="requests">
          <div className="admin-workspace admin-workspace--simple">
            <AdminSimpleList
              title="Solicitudes de clientes"
              empty="Todavia no hay solicitudes. Cada vez que un cliente llene el formulario de contacto, quedara guardada aqui con su nombre, telefono y vehiculo."
              items={requests.map((request) => ({
                id: request.id,
                title: request.vehicle ? `${request.name} · ${request.vehicle}` : request.name,
                meta: `${requestDateLabel(request)} · ${request.message}`,
                onView: () => setDetail({ kind: "request", item: request }),
                onDelete: () => confirmDeleteRequest(request)
              }))}
            />
          </div>
        </AdminPanelReveal>
      )}

      {galleryDialogOpen && (
        <GalleryDialog
          item={editingGallery}
          onClose={() => {
            setGalleryDialogOpen(false);
            setEditingGallery(null);
          }}
          onSubmit={handleGallerySubmit}
        />
      )}

      {productDialog && (
        <ProductDialog
          product={productDialog}
          categories={categories}
          brands={brands}
          vehicleOptions={vehicles}
          sourceUrl={sources[productDialog.id] || ""}
          onClose={() => setProductDialog(null)}
          onSave={saveProduct}
        />
      )}

      {offerDialog !== undefined && (
        <OfferDialog
          products={products}
          initialProduct={offerDialog}
          onClose={() => setOfferDialog(undefined)}
          onSave={saveOffer}
        />
      )}

      {promoDialogOpen && (
        <PromoDialog
          promo={editingPromo}
          onClose={() => {
            setPromoDialogOpen(false);
            setEditingPromo(null);
          }}
          onSubmit={handlePromoSubmit}
        />
      )}

      {vehicleDialogOpen && (
        <VehicleDialog
          vehicle={editingVehicle}
          onClose={() => {
            setVehicleDialogOpen(false);
            setEditingVehicle(null);
          }}
          onSubmit={handleVehicleSubmit}
        />
      )}

      {categoryDialogOpen && (
        <CategoryDialog
          category={editingCategory}
          categories={categories}
          onClose={() => {
            setCategoryDialogOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleCategorySubmit}
        />
      )}

      {brandDialogOpen && (
        <BrandDialog
          brand={editingBrand}
          onClose={() => {
            setBrandDialogOpen(false);
            setEditingBrand(null);
          }}
          onSubmit={handleBrandSubmit}
        />
      )}

      {detail && (
        <AdminDetailDialog
          detail={detail}
          products={products}
          categories={categories}
          vehicles={vehicles}
          promos={promos}
          brands={brands}
          sources={sources}
          onClose={() => setDetail(null)}
          onBack={detailStack.length > 1 ? popDetail : undefined}
          onSelect={pushDetail}
          onEditProduct={(product) => {
            setDetail(null);
            setProductDialog(product);
          }}
          onEditOffer={(product) => {
            setDetail(null);
            setOfferDialog(product);
          }}
          onEditPromo={(promo) => {
            setDetail(null);
            setEditingPromo(promo);
            setPromoDialogOpen(true);
          }}
          onEditVehicle={(vehicle) => {
            setDetail(null);
            setEditingVehicle(vehicle);
            setVehicleDialogOpen(true);
          }}
          onEditCategory={(category) => {
            setDetail(null);
            setEditingCategory(category);
            setCategoryDialogOpen(true);
          }}
          onEditBrand={(brand) => {
            setDetail(null);
            setEditingBrand(brand);
            setBrandDialogOpen(true);
          }}
        />
      )}

      {confirmState && (
        <ConfirmDialog
          state={confirmState}
          onClose={() => setConfirmState(null)}
          onConfirm={() => {
            confirmState.onConfirm();
            setConfirmState(null);
          }}
        />
      )}
    </section>
  );
}

function FeaturedOverview({
  products,
  scheduledCount,
  onManage,
  onEdit
}: {
  products: Product[];
  scheduledCount: number;
  onManage: () => void;
  onEdit: (product: Product) => void;
}) {
  return (
    <section className="admin-featured-overview" aria-labelledby="featured-overview-title">
      <div className="admin-featured-overview__header">
        <div>
          <span className="section-head__pill">
            <Star size={14} /> Inicio
          </span>
          <h2 id="featured-overview-title">Destacados de la semana</h2>
          <p>
            {products.length} activo(s)
            {scheduledCount ? ` y ${scheduledCount} programado(s)` : ""} en la vitrina principal.
          </p>
        </div>
        <button className="button button--secondary" type="button" onClick={onManage}>
          <Star size={18} /> Gestionar destacados
        </button>
      </div>

      {products.length ? (
        <div className="admin-featured-overview__grid">
          {products.map((product, index) => (
            <button
              className="admin-featured-overview__item"
              key={product.id}
              type="button"
              onClick={() => onEdit(product)}
            >
              <img src={product.images[0]} alt="" />
              <span>
                <small>#{product.featuredOrder ?? index + 1}</small>
                <strong>{product.name}</strong>
                <em>{product.featuredUntil ? `Hasta ${product.featuredUntil}` : "Sin vencimiento"}</em>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="admin-featured-overview__empty">
          No hay destacados activos. Agregue uno para que aparezca en la portada.
        </p>
      )}
    </section>
  );
}

function ProductAdminPanel({
  products,
  query,
  onQueryChange,
  vehicles,
  vehicleFilter,
  onVehicleFilterChange,
  onCreate,
  onView,
  onEdit,
  onOffer,
  onDelete
}: {
  products: Product[];
  query: string;
  onQueryChange: (value: string) => void;
  vehicles: VehicleModel[];
  vehicleFilter: string;
  onVehicleFilterChange: (value: string) => void;
  onCreate: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onOffer: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="admin-list-panel admin-list-panel--wide">
      <div className="admin-list-header admin-list-header--actions">
        <div>
          <strong>Productos</strong>
          <span>{products.length} resultado(s)</span>
        </div>
        <div className="admin-header-actions">
          <CustomSelect
            ariaLabel="Filtrar por vehículo"
            className="admin-vehicle-filter"
            value={vehicleFilter}
            onChange={onVehicleFilterChange}
            options={[
              { label: "Todos los vehículos", value: "all" },
              { label: "Universales", value: "universal" },
              ...vehicles.map((vehicle) => ({ label: `${vehicle.make} ${vehicle.model}`, value: vehicle.id }))
            ]}
          />
          <label className="admin-search">
            <Search size={17} />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar..." />
          </label>
          <button className="button button--primary" type="button" onClick={onCreate}>
            <Plus size={18} /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="admin-product-list">
        {products.map((product) => (
          <article className="admin-product-row admin-product-row--catalog" key={product.id}>
            <img src={product.images[0]} alt={product.name} />
            <div>
              <strong>{product.name}</strong>
              <span>
                {product.categoryName}
                {product.isOwnBrand
                  ? " - Linea propia G&V System"
                  : product.brandName
                    ? ` - ${product.brandName}`
                    : ""}
              </span>
              <small>
                {product.oldPrice ? "Oferta" : "Sin oferta"} -{" "}
                {product.featured ? featuredStatusLabel(product) : "Normal"} -{" "}
                {productHasPublicPrice(product) ? formatCRC(product.price) : "Solo cotizacion"}
              </small>
            </div>
            <div className="admin-row-actions">
              <button type="button" aria-label="Ver detalle" title="Ver detalle" onClick={() => onView(product)}>
                <Eye size={16} />
              </button>
              <a
                href={productShareWhatsAppUrl(product)}
                target="_blank"
                rel="noopener"
                aria-label={`Enviar ${product.name} por WhatsApp`}
                title="Enviar por WhatsApp"
              >
                <Share2 size={16} />
              </a>
              <button type="button" aria-label="Administrar oferta" onClick={() => onOffer(product)}>
                <Tags size={16} />
              </button>
              <button type="button" aria-label="Editar producto" onClick={() => onEdit(product)}>
                <Edit3 size={16} />
              </button>
              <button type="button" aria-label="Eliminar producto" onClick={() => onDelete(product)}>
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

const PRODUCT_TAG_GROUPS = [
  {
    label: "Vehículo y uso",
    tags: ["Universal", "Pickup", "SUV", "4x4", "Off-road", "Camping", "Trabajo"]
  },
  {
    label: "Zona y acabado",
    tags: ["Interior", "Exterior", "Batea", "Cabina", "Techo", "Suspensión", "A la medida"]
  },
  {
    label: "Beneficios",
    tags: ["Protección", "Seguridad", "Confort", "Antideslizante", "Impermeable", "Resistente"]
  },
  {
    label: "Tecnología y servicio",
    tags: ["LED", "Audio", "Video", "Bluetooth", "Cámara", "Sensores", "Polarizado", "Instalación"]
  },
  {
    label: "Materiales",
    tags: ["Caucho", "PVC", "Aluminio", "Acero inoxidable", "Plástico ABS"]
  }
] as const;

function productTagKey(value: string) {
  return value.trim().toLocaleLowerCase("es-CR");
}

function uniqueProductTags(tags: string[]) {
  const seen = new Set<string>();

  return tags.filter((tag) => {
    const key = productTagKey(tag);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ProductTagBank({ defaultValue }: { defaultValue: string[] }) {
  const [selectedTags, setSelectedTags] = useState(() => uniqueProductTags(defaultValue));
  const [query, setQuery] = useState("");
  const normalizedQuery = productTagKey(query);
  const selectedKeys = new Set(selectedTags.map(productTagKey));
  const visibleGroups = PRODUCT_TAG_GROUPS.map((group) => ({
    ...group,
    tags: group.tags.filter((tag) => !normalizedQuery || productTagKey(tag).includes(normalizedQuery))
  })).filter((group) => group.tags.length > 0);

  function addTag(value: string) {
    const cleanTag = value.replaceAll(",", " ").replace(/\s+/g, " ").trim().slice(0, 40);
    if (!cleanTag) return;

    setSelectedTags((tags) => uniqueProductTags([...tags, cleanTag]));
    setQuery("");
  }

  function removeTag(value: string) {
    const key = productTagKey(value);
    setSelectedTags((tags) => tags.filter((tag) => productTagKey(tag) !== key));
  }

  function toggleTag(value: string) {
    if (selectedKeys.has(productTagKey(value))) {
      removeTag(value);
      return;
    }
    addTag(value);
  }

  const canAddCustomTag = Boolean(
    normalizedQuery && !selectedKeys.has(normalizedQuery)
  );

  return (
    <fieldset className="tag-bank">
      <legend>Etiquetas</legend>
      <input name="tags" type="hidden" value={selectedTags.join(", ")} readOnly />
      <p className="tag-bank__hint">
        Seleccione las características que ayudan a encontrar y describir el producto.
      </p>

      {selectedTags.length > 0 ? (
        <div className="tag-bank__selected" aria-label="Etiquetas seleccionadas">
          {selectedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Quitar ${tag}`}
            >
              {tag}
              <X size={14} aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : (
        <p className="tag-bank__empty">Aún no ha seleccionado etiquetas.</p>
      )}

      <div className="tag-bank__composer">
        <label>
          Buscar o crear etiqueta
          <input
            type="text"
            value={query}
            maxLength={40}
            placeholder="Ejemplo: Doble cabina"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if ((event.key === "Enter" || event.key === ",") && query.trim()) {
                event.preventDefault();
                addTag(query);
              }
            }}
          />
        </label>
        <button
          className="button button--secondary"
          type="button"
          disabled={!canAddCustomTag}
          onClick={() => addTag(query)}
        >
          <Plus size={16} aria-hidden="true" />
          Agregar
        </button>
      </div>

      <div className="tag-bank__catalog">
        {visibleGroups.length > 0 ? (
          visibleGroups.map((group) => (
            <section className="tag-bank__group" key={group.label}>
              <strong>{group.label}</strong>
              <div>
                {group.tags.map((tag) => {
                  const isSelected = selectedKeys.has(productTagKey(tag));
                  return (
                    <button
                      className={isSelected ? "is-selected" : undefined}
                      type="button"
                      key={tag}
                      aria-pressed={isSelected}
                      onClick={() => toggleTag(tag)}
                    >
                      {isSelected ? (
                        <BadgeCheck size={14} aria-hidden="true" />
                      ) : (
                        <Plus size={14} aria-hidden="true" />
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        ) : (
          <p className="tag-bank__empty">
            No está en el banco. Puede agregarla como etiqueta personalizada.
          </p>
        )}
      </div>
    </fieldset>
  );
}

function ProductDialog({
  product,
  categories,
  brands,
  vehicleOptions,
  sourceUrl,
  onClose,
  onSave
}: {
  product: Product;
  categories: Category[];
  brands: Brand[];
  vehicleOptions: VehicleModel[];
  // Enlace privado a la pagina del proveedor. Viaja aparte del producto
  // porque se guarda en otra tabla, no dentro del catalogo publico.
  sourceUrl: string;
  onClose: () => void;
  onSave: (product: Product, sourceUrl: string) => void;
}) {
  const [sourceError, setSourceError] = useState("");
  const [compatibilityMode, setCompatibilityMode] = useState(product.compatibilityMode);
  const [isOwnBrand, setIsOwnBrand] = useState(Boolean(product.isOwnBrand));
  const [brandId, setBrandId] = useState(product.brandId || "");
  const [keepLegacyBrand, setKeepLegacyBrand] = useState(
    Boolean(!product.isOwnBrand && !product.brandId && product.brandName)
  );
  const [vehicleRows, setVehicleRows] = useState<VehicleCompatibility[]>(
    product.vehicles.length ? product.vehicles : []
  );

  const optionKey = (make: string, model: string) => `${make}|${model}`;

  function isManagedRow(row: VehicleCompatibility) {
    return vehicleOptions.some(
      (option) => optionKey(option.make, option.model) === optionKey(row.make, row.model)
    );
  }

  function updateRow(index: number, patch: Partial<VehicleCompatibility>) {
    setVehicleRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );
  }

  function addRow() {
    const first = vehicleOptions[0];
    setVehicleRows((rows) => [
      ...rows,
      first
        ? { make: first.make, model: first.model, fromYear: first.fromYear, toYear: first.toYear }
        : { make: "", model: "" }
    ]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enlaceProveedor = normalizarEnlace(String(form.get("supplierUrl") || ""));
    if (enlaceProveedor === null) {
      setSourceError("Escriba una direccion valida, por ejemplo tienda.com/producto");
      return;
    }
    setSourceError("");
    const name = String(form.get("name") || "").trim();
    const categorySlug = String(form.get("categorySlug") || "");
    const category = categories.find((item) => item.slug === categorySlug);
    const saleMode = String(form.get("saleMode")) as SaleMode;
    const price = Number(form.get("price"));
    const images = String(form.get("images") || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const canShowPrice = saleMode === "price_quote" && price > 0;
    const selectedBrand = brands.find((brand) => brand.id === brandId);
    const legacyBrandName = !product.isOwnBrand && !product.brandId ? product.brandName : undefined;

    onSave(
      {
      ...product,
      slug: product.slug || makeSlug(name),
      name,
      categorySlug,
      categoryName: category?.name || "Sin categoria",
      saleMode,
      price: canShowPrice ? price : undefined,
      oldPrice: canShowPrice ? product.oldPrice : undefined,
      status: String(form.get("status")) as Product["status"],
      compatibilityMode,
      vehicles:
        compatibilityMode === "specific"
          ? vehicleRows.filter((row) => row.make.trim() && row.model.trim())
          : [],
      images: images.length
        ? images
        : ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80"],
      description: String(form.get("description") || ""),
      tags: String(form.get("tags") || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      brandId: isOwnBrand ? undefined : selectedBrand?.id,
      brandName:
        isOwnBrand
          ? "G&V System"
          : selectedBrand?.name || (keepLegacyBrand ? legacyBrandName : undefined),
      isOwnBrand,
      featured: product.featured
      },
      enlaceProveedor
    );
  }

  return (
    <AdminDialog title={product.name ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <form className="admin-form admin-dialog-form" noValidate onSubmit={handleSubmit}>
        <AdminStepper
          steps={["Datos del producto", "Venta", "Imágenes", "Descripción", "Compatibilidad"]}
          submitLabel="Guardar producto"
        >
        <div>
        <label>
          Nombre del producto
          <input name="name" required defaultValue={product.name} placeholder="Estribos laterales negros" />
        </label>

        <div className="form-grid">
          <label>
            Categoria
            <CustomSelect
              ariaLabel="Categoría"
              name="categorySlug"
              defaultValue={product.categorySlug}
              options={categories
                .filter((category) => !category.parent)
                .flatMap((category) => {
                  const children = categories.filter(
                    (item) => item.parent === category.slug
                  );
                  if (!children.length) {
                    return [{ label: category.name, value: category.slug }];
                  }
                  return [
                    { label: `${category.name} (general)`, value: category.slug },
                    ...children.map((child) => ({ label: `↳ ${child.name}`, value: child.slug }))
                  ];
                })}
            />
          </label>
          <label>
            Estado
            <CustomSelect
              ariaLabel="Estado"
              name="status"
              defaultValue={product.status}
              options={[
                { label: "Disponible", value: "available" },
                { label: "Bajo pedido", value: "on_request" },
                { label: "Agotado", value: "sold_out" }
              ]}
            />
          </label>
        </div>

        <div className="form-grid">
          <label>
            Marca comercial
            <CustomSelect
              ariaLabel="Marca comercial"
              value={isOwnBrand ? "" : brandId}
              onChange={(nextBrandId) => {
                setBrandId(nextBrandId);
                setKeepLegacyBrand(false);
              }}
              disabled={isOwnBrand}
              options={[
                { label: "Sin marca externa", value: "" },
                ...brands.map((brand) => ({ label: brand.name, value: brand.id }))
              ]}
            />
            {!isOwnBrand && !brands.length && (
              <small className="admin-form-hint">Cree una marca en la pestaña Marcas para asignarla.</small>
            )}
            {!isOwnBrand && keepLegacyBrand && product.brandName && (
              <small className="admin-form-hint">
                Marca actual sin registrar: {product.brandName}. Seleccione una marca o deje &quot;Sin marca externa&quot; para quitarla.
              </small>
            )}
          </label>
          <label className="checkbox-row checkbox-row--switch admin-dialog-switch">
            <input
              name="isOwnBrand"
              type="checkbox"
              checked={isOwnBrand}
              onChange={(event) => setIsOwnBrand(event.target.checked)}
            />
            <span className="switch-ui" aria-hidden="true">
              <Star size={14} />
            </span>
            <span>Linea propia G&amp;V System</span>
          </label>
        </div>

        <label>
          {/* El label es grid: el texto y la etiqueta van en un mismo hijo
              o cada uno se llevaria su propia fila. */}
          <span className="admin-form-label">
            Página del proveedor <span className="admin-form-tag">privado</span>
          </span>
          <input
            name="supplierUrl"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            defaultValue={sourceUrl}
            placeholder="tienda.com/producto"
            onChange={(event) => {
              // El stepper valida campo por campo y salta al paso del que
              // falle: marcando el error aqui, el aviso se ve donde esta el
              // campo y no en un paso que ya quedo atras.
              const malo = normalizarEnlace(event.target.value) === null;
              event.target.setCustomValidity(
                malo ? "Escriba una direccion como tienda.com/producto" : ""
              );
              setSourceError(malo ? "Escriba una direccion como tienda.com/producto" : "");
            }}
          />
          {sourceError ? (
            <small className="admin-form-hint admin-form-hint--error">{sourceError}</small>
          ) : (
            <small className="admin-form-hint">
              De dónde se consigue este producto. Solo se ve aquí en el panel: nunca sale en el
              sitio.
            </small>
          )}
        </label>

        </div>
        <div>
        <div className="form-grid">
          <label>
            Modo de venta
            <CustomSelect
              ariaLabel="Modo de venta"
              name="saleMode"
              defaultValue={product.saleMode}
              options={[
                { label: "Mostrar precio + cotizar", value: "price_quote" },
                { label: "Solo cotizar", value: "quote_only" }
              ]}
            />
          </label>
          <label>
            Precio normal
            <input name="price" type="number" min="0" defaultValue={product.price} />
          </label>
        </div>

        </div>
        <div>
        <ImageListField
          name="images"
          defaultValue={product.images}
          folder="products"
          tarjeta={{ nombre: product.name, categoria: product.categoryName }}
        />

        </div>
        <div>
        <label>
          Descripcion
          <textarea name="description" rows={4} required defaultValue={product.description} />
        </label>

        <ProductTagBank defaultValue={product.tags} />

        </div>
        <div>
        <label>
          Compatibilidad
          <CustomSelect
            ariaLabel="Compatibilidad"
            name="compatibilityMode"
            value={compatibilityMode}
            onChange={(value) => setCompatibilityMode(value as Product["compatibilityMode"])}
            options={[
              { label: "Universal / varios vehículos", value: "universal" },
              { label: "Vehículo específico", value: "specific" }
            ]}
          />
        </label>

        {compatibilityMode === "specific" && (
          <div className="vehicle-rows">
            <div className="vehicle-rows__header">
              <strong>Vehículos compatibles</strong>
              <button className="button button--secondary" type="button" onClick={addRow}>
                <Plus size={16} /> Agregar vehículo
              </button>
            </div>

            {vehicleRows.length === 0 && (
              <p className="vehicle-rows__empty">
                Agregue al menos un vehículo compatible, o cambie a
                &quot;Universal&quot;.
              </p>
            )}

            {vehicleRows.map((row, index) => {
              const managed = isManagedRow(row);
              return (
                <div className="vehicle-row" key={index}>
                  <CustomSelect
                    ariaLabel="Modelo administrado"
                    value={managed ? optionKey(row.make, row.model) : "custom"}
                    onChange={(value) => {
                      if (value === "custom") {
                        updateRow(index, { make: "", model: "" });
                        return;
                      }
                      const option = vehicleOptions.find(
                        (item) => optionKey(item.make, item.model) === value
                      );
                      if (option) {
                        updateRow(index, {
                          make: option.make,
                          model: option.model,
                          fromYear: option.fromYear,
                          toYear: option.toYear
                        });
                      }
                    }}
                    options={[
                      ...vehicleOptions.map((option) => ({
                        label: `${option.make} ${option.model}`,
                        value: optionKey(option.make, option.model)
                      })),
                      { label: "Otro vehículo…", value: "custom" }
                    ]}
                  />

                  {!managed && (
                    <>
                      <input
                        placeholder="Marca"
                        value={row.make}
                        onChange={(event) => updateRow(index, { make: event.target.value })}
                      />
                      <input
                        placeholder="Modelo"
                        value={row.model}
                        onChange={(event) => updateRow(index, { model: event.target.value })}
                      />
                    </>
                  )}

                  <input
                    type="number"
                    placeholder="Desde"
                    aria-label="Desde ano"
                    value={row.fromYear ?? ""}
                    onChange={(event) =>
                      updateRow(index, {
                        fromYear: Number(event.target.value) || undefined
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Hasta"
                    aria-label="Hasta ano"
                    value={row.toYear ?? ""}
                    onChange={(event) =>
                      updateRow(index, {
                        toYear: Number(event.target.value) || undefined
                      })
                    }
                  />
                  <button
                    type="button"
                    className="vehicle-row__remove"
                    aria-label="Quitar vehiculo"
                    onClick={() =>
                      setVehicleRows((rows) => rows.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function OfferDialog({
  products,
  initialProduct,
  onClose,
  onSave
}: {
  products: Product[];
  initialProduct: Product | null;
  onClose: () => void;
  onSave: (
    productId: string,
    oldPrice?: number,
    featured?: boolean,
    featuredOrder?: number,
    featuredFrom?: string,
    featuredUntil?: string
  ) => void;
}) {
  const [selectedId, setSelectedId] = useState(initialProduct?.id || products[0]?.id || "");
  const [isFeatured, setIsFeatured] = useState(Boolean(initialProduct?.featured));
  const [featuredError, setFeaturedError] = useState("");
  const selectedProduct = products.find((product) => product.id === selectedId);
  const canOffer = Boolean(selectedProduct && productHasPublicPrice(selectedProduct));

  useEffect(() => {
    setIsFeatured(Boolean(selectedProduct?.featured));
    setFeaturedError("");
  }, [selectedProduct?.id]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;

    const form = new FormData(event.currentTarget);
    const oldPrice = Number(form.get("oldPrice"));
    const featuredFrom = String(form.get("featuredFrom") || "").trim();
    const featuredUntil = String(form.get("featuredUntil") || "").trim();
    const featuredOrderValue = Number(form.get("featuredOrder"));
    const featuredOrder = Number.isInteger(featuredOrderValue) && featuredOrderValue > 0
      ? featuredOrderValue
      : undefined;

    if (isFeatured && featuredFrom && featuredUntil && featuredUntil < featuredFrom) {
      setFeaturedError("La fecha de cierre no puede ser anterior a la fecha de inicio.");
      return;
    }

    onSave(
      selectedProduct.id,
      canOffer && oldPrice > 0 ? oldPrice : undefined,
      isFeatured,
      featuredOrder,
      featuredFrom || undefined,
      featuredUntil || undefined
    );
  }

  return (
    <AdminDialog title={initialProduct ? "Editar promocion" : "Crear oferta o destacado"} onClose={onClose}>
      <form key={selectedId} className="admin-form admin-dialog-form" noValidate onSubmit={handleSubmit}>
        <AdminStepper steps={["Producto", "Oferta", "Destacado"]} submitLabel="Guardar promocion">
          <div>
            <label>
              Producto
              <CustomSelect
                ariaLabel="Producto"
                name="productId"
                value={selectedId}
                onChange={setSelectedId}
                options={products.map((product) => ({ label: product.name, value: product.id }))}
              />
            </label>

            {selectedProduct && (
              <div className="admin-offer-summary">
                <img src={selectedProduct.images[0]} alt={selectedProduct.name} />
                <div>
                  <strong>{selectedProduct.name}</strong>
                  <span>{selectedProduct.categoryName}</span>
                  <small>
                    Precio actual:{" "}
                    {productHasPublicPrice(selectedProduct) ? formatCRC(selectedProduct.price) : "Solo cotizacion"}
                  </small>
                </div>
              </div>
            )}

            {!canOffer && (
              <div className="notice admin-dialog-notice">
                Este producto no tiene precio publico. Puede marcarlo como destacado, pero para crear una oferta primero debe tener precio normal.
              </div>
            )}
          </div>

          <div>
            <label>
              Precio anterior
              <input
                name="oldPrice"
                type="number"
                min="0"
                disabled={!canOffer}
                defaultValue={selectedProduct?.oldPrice}
                placeholder="Ej: 78000"
              />
            </label>
            <p className="admin-featured-hint">
              Deje este campo vacio si desea destacar el producto sin aplicar descuento.
            </p>
          </div>

          <div>
            <label className="checkbox-row checkbox-row--switch admin-dialog-switch">
              <input
                name="featured"
                type="checkbox"
                checked={isFeatured}
                onChange={(event) => setIsFeatured(event.target.checked)}
              />
              <span className="switch-ui" aria-hidden="true">
                <Star size={14} />
              </span>
              <span>Mostrar en productos destacados</span>
            </label>

            {isFeatured ? (
              <div className="admin-featured-schedule">
                <p className="admin-featured-hint">
                  La prioridad menor aparece primero. Sin fechas, queda visible hasta que usted lo retire.
                </p>
                <div className="form-grid">
                  <label>
                    Prioridad
                    <input
                      name="featuredOrder"
                      type="number"
                      min="1"
                      defaultValue={selectedProduct?.featuredOrder}
                      placeholder="1"
                    />
                  </label>
                  <label>
                    Visible desde
                    <input name="featuredFrom" type="date" defaultValue={selectedProduct?.featuredFrom} />
                  </label>
                  <label>
                    Visible hasta
                    <input name="featuredUntil" type="date" defaultValue={selectedProduct?.featuredUntil} />
                  </label>
                </div>
              </div>
            ) : (
              <p className="admin-featured-hint">
                Este producto puede tener oferta, pero no aparecera en la vitrina de destacados.
              </p>
            )}

            {featuredError && <p className="admin-featured-error">{featuredError}</p>}
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function PromoDialog({
  promo,
  onClose,
  onSubmit
}: {
  promo: Promo | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminDialog title={promo ? "Editar promocion" : "Nueva promocion"} onClose={onClose}>
      <form key={promo?.id || "new-promo"} className="admin-form admin-dialog-form" noValidate onSubmit={onSubmit}>
        <AdminStepper steps={["Contenido", "Imagen", "Publicacion"]} submitLabel="Guardar promocion">
          <div>
            <label>
              Titulo de la lamina
              <input name="promoTitle" required defaultValue={promo?.title} />
            </label>
            <label>
              Subtitulo (opcional)
              <textarea name="promoSubtitle" rows={3} defaultValue={promo?.subtitle} />
            </label>
          </div>
          <div>
            <ImageUploadField
              name="promoImage"
              label="Imagen (banner)"
              ancho={1600}
              alto={720}
              defaultValue={promo?.image}
              required
              folder="promos"
            />
          </div>
          <div>
            <label>
              Enlace del boton
              <input name="promoLink" placeholder="/catalogo?categoria=alfombras" defaultValue={promo?.link} />
            </label>
            <div className="form-grid">
              <label>
                Texto del boton
                <input name="promoCta" placeholder="Ver promocion" defaultValue={promo?.ctaLabel} />
              </label>
              <label>
                Orden
                <input name="promoOrder" type="number" defaultValue={promo?.order} />
              </label>
            </div>
            <label className="checkbox-row">
              <input name="promoActive" type="checkbox" defaultChecked={promo ? promo.active !== false : true} />
              <span>Visible en el inicio</span>
            </label>
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function VehicleDialog({
  vehicle,
  onClose,
  onSubmit
}: {
  vehicle: VehicleModel | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminDialog title={vehicle ? "Editar modelo" : "Nuevo modelo"} onClose={onClose}>
      <form key={vehicle?.id || "new-vehicle"} className="admin-form admin-dialog-form" noValidate onSubmit={onSubmit}>
        <AdminStepper steps={["Modelo", "Rango de anos"]} submitLabel="Guardar modelo">
          <div className="form-grid">
            <label>
              Marca
              <input name="make" required defaultValue={vehicle?.make} />
            </label>
            <label>
              Modelo
              <input name="model" required defaultValue={vehicle?.model} />
            </label>
          </div>
          <div className="form-grid">
            <label>
              Desde
              <input name="fromYear" type="number" defaultValue={vehicle?.fromYear} />
            </label>
            <label>
              Hasta
              <input name="toYear" type="number" defaultValue={vehicle?.toYear} />
            </label>
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function GalleryDialog({
  item,
  onClose,
  onSubmit
}: {
  item: GalleryItem | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  // La forma decide el recuadro del recorte Y la altura de la pieza en el
  // mosaico, asi la galeria queda pareja sin pedirle medidas al dueno.
  const [shape, setShape] = useState<GalleryShape>(item?.shape || "vertical");
  const medidas: Record<GalleryShape, { ancho: number; alto: number }> = {
    vertical: { ancho: 900, alto: 1200 },
    cuadrada: { ancho: 1000, alto: 1000 },
    horizontal: { ancho: 1200, alto: 860 }
  };

  return (
    <AdminDialog title={item ? "Editar foto" : "Nueva foto de la galería"} onClose={onClose}>
      <form
        key={item?.id || "new-gallery"}
        className="admin-form admin-dialog-form"
        noValidate
        onSubmit={onSubmit}
      >
        <AdminStepper steps={["Foto", "Detalles"]} submitLabel="Guardar foto">
          <div>
            <label>
              Forma en el mosaico
              <CustomSelect
                ariaLabel="Forma en el mosaico"
                name="galleryShape"
                options={[
                  { label: "Vertical (recomendada)", value: "vertical" },
                  { label: "Cuadrada", value: "cuadrada" },
                  { label: "Horizontal", value: "horizontal" }
                ]}
                value={shape}
                onChange={(valor) => setShape(valor as GalleryShape)}
              />
            </label>
            <ImageUploadField
              key={shape}
              name="galleryImage"
              label="Foto del trabajo"
              required
              ancho={medidas[shape].ancho}
              alto={medidas[shape].alto}
              defaultValue={item?.image}
              folder="gallery"
            />
          </div>
          <div>
            <label>
              Título (opcional)
              <input
                name="galleryTitle"
                defaultValue={item?.title}
                placeholder="Ej: Polarizado en Hilux 2022"
              />
            </label>
            <label>
              Descripción (opcional)
              <textarea
                name="galleryDescription"
                rows={3}
                defaultValue={item?.description}
                placeholder="Ej: Lámina de seguridad y estribos instalados en el taller."
              />
            </label>
            <label>
              Orden (opcional)
              <input
                name="galleryOrder"
                type="number"
                min={1}
                defaultValue={item?.order}
                placeholder="1 aparece de primera"
              />
            </label>
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function BrandDialog({
  brand,
  onClose,
  onSubmit
}: {
  brand: Brand | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminDialog title={brand ? "Editar marca" : "Nueva marca"} onClose={onClose}>
      <form key={brand?.id || "new-brand"} className="admin-form admin-dialog-form" noValidate onSubmit={onSubmit}>
        <AdminStepper steps={["Informacion de marca", "Logo"]} submitLabel="Guardar marca">
          <div>
            <label>
              Nombre
              <input name="brandName" required defaultValue={brand?.name} placeholder="Ej: Hella" />
            </label>
            <label>
              Descripcion (opcional)
              <textarea name="brandDescription" rows={4} defaultValue={brand?.description} />
            </label>
          </div>
          <div>
            <ImageUploadField
              name="brandLogo"
              label="Logo de la marca (opcional)"
              ancho={600}
              alto={600}
              defaultValue={brand?.logo}
              folder="brands"
            />
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function CategoryDialog({
  category,
  categories,
  onClose,
  onSubmit
}: {
  category: Category | null;
  categories: Category[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <AdminDialog title={category ? "Editar categoria" : "Nueva categoria"} onClose={onClose}>
      <form key={category?.id || "new-category"} className="admin-form admin-dialog-form" noValidate onSubmit={onSubmit}>
        <AdminStepper steps={["Informacion", "Imagen", "Organizacion"]} submitLabel="Guardar categoria">
          <div>
            <label>
              Nombre
              <input name="categoryName" required defaultValue={category?.name} />
            </label>
            <label>
              Descripcion
              <textarea name="categoryDescription" rows={4} defaultValue={category?.description} />
            </label>
          </div>
          <div>
            <ImageUploadField
              name="categoryImage"
              label="Imagen"
              ancho={1200}
              alto={720}
              defaultValue={category?.image}
              folder="categories"
            />
          </div>
          <div>
            <label>
              Categoria madre
              <CustomSelect
                ariaLabel="Categoría madre"
                name="categoryParent"
                defaultValue={category?.parent || ""}
                options={[
                  { label: "Ninguna (categoría principal)", value: "" },
                  ...categories
                  .filter((item) => !item.parent && item.id !== category?.id)
                  .map((item) => ({ label: item.name, value: item.slug }))
                ]}
              />
            </label>
          </div>
        </AdminStepper>
      </form>
    </AdminDialog>
  );
}

function AdminOfferList({
  products,
  allProducts,
  empty,
  onCreate,
  onView,
  onEdit,
  onRemove
}: {
  products: Product[];
  allProducts: Product[];
  empty: string;
  onCreate: () => void;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onRemove: (product: Product) => void;
}) {
  return (
    <section className="admin-offers-panel">
      <div className="admin-list-header admin-offers-header">
        <div>
          <strong>Ofertas y destacados</strong>
          <span>{products.length} producto(s) con promocion o destacado</span>
        </div>
        <button className="button button--primary" type="button" onClick={onCreate} disabled={!allProducts.length}>
          <Plus size={18} /> Crear promocion
        </button>
      </div>

      {products.length ? (
        <div className="admin-offer-grid">
          {products.map((product) => {
            const hasCurrentPrice = productHasPublicPrice(product);
            const hasOffer = hasCurrentPrice && typeof product.oldPrice === "number";
            const featuredStatus = getFeaturedStatus(product);

            return (
              <article className="admin-offer-card" key={product.id}>
                <img src={product.images[0]} alt={product.name} />
                <div className="admin-offer-card__body">
                  <div className="admin-offer-card__chips">
                    {hasOffer && <span>Oferta activa</span>}
                    {featuredStatus === "active" && <span>Destacado activo</span>}
                    {featuredStatus === "scheduled" && <span>Destacado programado</span>}
                    {featuredStatus === "expired" && <span>Destacado vencido</span>}
                    {!hasOffer && hasCurrentPrice && <span>Sin descuento</span>}
                    {!hasCurrentPrice && <span>Solo cotizacion</span>}
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.featured ? `${product.categoryName} - ${featuredStatusLabel(product)}` : product.categoryName}</p>

                  <div className="admin-offer-card__pricing">
                    {hasOffer ? (
                      <>
                        <div>
                          <span>Precio anterior</span>
                          <del>{formatCRC(product.oldPrice)}</del>
                        </div>
                        <div className="admin-offer-card__pricing-now">
                          <span>Precio nuevo</span>
                          <strong>{formatCRC(product.price)}</strong>
                        </div>
                      </>
                    ) : hasCurrentPrice ? (
                      <div className="admin-offer-card__pricing-now">
                        <span>Precio actual</span>
                        <strong>{formatCRC(product.price)}</strong>
                      </div>
                    ) : (
                      <div className="admin-offer-card__quote">
                        <span>Precio publico</span>
                        <strong>Solo cotizacion</strong>
                      </div>
                    )}
                  </div>

                  <div className="admin-offer-card__actions">
                    <button type="button" aria-label="Ver detalle" title="Ver detalle" onClick={() => onView(product)}>
                      <Eye size={16} /> Ver detalle
                    </button>
                    <button type="button" aria-label="Editar promocion" title="Editar promocion" onClick={() => onEdit(product)}>
                      <Edit3 size={16} /> Editar promocion
                    </button>
                    <button type="button" aria-label="Quitar oferta" title="Quitar oferta" onClick={() => onRemove(product)}>
                      <Trash2 size={16} /> Quitar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="admin-empty">{empty}</p>
      )}
    </section>
  );
}

function AdminSimpleList({
  title,
  empty = "No hay elementos.",
  items,
  createLabel,
  onCreate
}: {
  title: string;
  empty?: string;
  createLabel?: string;
  onCreate?: () => void;
  items: Array<{
    id: string;
    title: string;
    meta: string;
    image?: string;
    onView: () => void;
    /** Omitir cuando el elemento no se edita (ej. solicitudes de clientes). */
    onEdit?: () => void;
    onDelete: () => void;
  }>;
}) {
  return (
    <div className="admin-list-panel">
      <div className="admin-list-header">
        <div>
          <strong>{title}</strong>
          <span>{items.length} elemento(s)</span>
        </div>
        {onCreate && createLabel && (
          <button className="button button--primary" type="button" onClick={onCreate}>
            <Plus size={18} /> {createLabel}
          </button>
        )}
      </div>
      <div className="admin-product-list">
        {items.length ? (
          items.map((item) => (
            <article className="admin-product-row" key={item.id}>
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <span className="admin-row-icon" />
              )}
              <div>
                <strong>{item.title}</strong>
                <span>{item.meta}</span>
              </div>
              <div className="admin-row-actions">
                <button type="button" aria-label="Ver detalle" title="Ver detalle" onClick={item.onView}>
                  <Eye size={16} />
                </button>
                {item.onEdit && (
                  <button type="button" aria-label="Editar" onClick={item.onEdit}>
                    <Edit3 size={16} />
                  </button>
                )}
                <button type="button" aria-label="Eliminar" onClick={item.onDelete}>
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="admin-empty">{empty}</p>
        )}
      </div>
    </div>
  );
}

function vehicleRange(vehicle: { fromYear?: number; toYear?: number }) {
  if (vehicle.fromYear && vehicle.toYear) return `${vehicle.fromYear}-${vehicle.toYear}`;
  if (vehicle.fromYear) return `Desde ${vehicle.fromYear}`;
  if (vehicle.toYear) return `Hasta ${vehicle.toYear}`;
  return "Sin rango de anos";
}

function matchesVehicle(product: Product, vehicle: VehicleModel) {
  return product.vehicles.some(
    (item) =>
      item.make.toLowerCase() === vehicle.make.toLowerCase() &&
      item.model.toLowerCase() === vehicle.model.toLowerCase()
  );
}

function productStatusLabel(product: Product) {
  if (product.status === "available") return "Disponible";
  if (product.status === "on_request") return "Bajo pedido";
  return "Agotado";
}

function AdminDetailRelation({
  title,
  meta,
  image,
  onClick
}: {
  title: string;
  meta: string;
  image?: string;
  // Sin onClick la fila es informativa: no hay ficha que abrir (la linea
  // propia no es una marca registrada, es una casilla del producto).
  onClick?: () => void;
}) {
  const contenido = (
    <>
      {image ? <img src={image} alt="" /> : <span className="admin-row-icon" aria-hidden="true" />}
      <span className="admin-detail-relation__body">
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
    </>
  );

  if (!onClick) {
    return <div className="admin-detail-relation admin-detail-relation--nota">{contenido}</div>;
  }

  return (
    <button className="admin-detail-relation" type="button" onClick={onClick}>
      {contenido}
      <Eye size={16} />
    </button>
  );
}

function AdminDetailSection({
  title,
  empty,
  children
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const relations = Children.toArray(children);

  return (
    <section className="admin-detail-section">
      <h3>
        {title}
        {relations.length > 0 && (
          <span className="admin-detail-section__count">{relations.length}</span>
        )}
      </h3>
      {relations.length ? <div className="admin-detail-relations">{relations}</div> : <p>{empty}</p>}
    </section>
  );
}

function AdminDetailDialog({
  detail,
  products,
  categories,
  vehicles,
  promos,
  brands,
  sources,
  onClose,
  onBack,
  onSelect,
  onEditProduct,
  onEditOffer,
  onEditPromo,
  onEditVehicle,
  onEditCategory,
  onEditBrand
}: {
  detail: AdminDetail;
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
  brands: Brand[];
  // Enlaces privados del proveedor por id de producto.
  sources: Record<string, string>;
  onClose: () => void;
  onBack?: () => void;
  onSelect: (detail: AdminDetail) => void;
  onEditProduct: (product: Product) => void;
  onEditOffer: (product: Product) => void;
  onEditPromo: (promo: Promo) => void;
  onEditVehicle: (vehicle: VehicleModel) => void;
  onEditCategory: (category: Category) => void;
  onEditBrand: (brand: Brand) => void;
}) {
  const detailTitle =
    detail.kind === "product"
      ? "Detalle del producto"
      : detail.kind === "offer"
        ? "Detalle de la oferta"
        : detail.kind === "promo"
          ? "Detalle de la promocion"
          : detail.kind === "vehicle"
            ? "Detalle del modelo"
            : detail.kind === "brand"
              ? "Detalle de la marca"
              : detail.kind === "request"
                ? "Detalle de la solicitud"
                : "Detalle de la categoria";

  const detailBody = (() => {
    if (detail.kind === "product") {
      const product = detail.item;
      const category = categories.find((item) => item.slug === product.categorySlug);
      const brand = brands.find((item) => item.id === product.brandId);
      const relatedProducts = products
        .filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug)
        .slice(0, 4);
      const ownLineCount = products.filter((item) => item.isOwnBrand).length;
      // Conserva la fila declarada por el producto (row) para mostrar SU
      // rango de anos, no el rango generico del modelo en el catalogo.
      const relatedVehicles = product.vehicles.flatMap((row) => {
        const vehicle = vehicles.find((item) =>
          matchesVehicle({ ...product, vehicles: [row] }, item)
        );
        return vehicle ? [{ vehicle, row }] : [];
      });
      const offer =
        typeof product.price === "number" && product.oldPrice
          ? { before: product.oldPrice, saving: product.oldPrice - product.price }
          : null;

      return (
        <>
          <div className="admin-detail-hero">
            <img src={product.images[0]} alt={product.name} />
            <div>
              <span className="admin-detail-kicker">Producto</span>
              <h2>{product.name}</h2>
              <div className="admin-detail-price">
                {offer && <del>{formatCRC(offer.before)}</del>}
                <strong>{productHasPublicPrice(product) ? formatCRC(product.price) : "Solo cotizacion"}</strong>
              </div>
              <p>{product.description || "Sin descripcion registrada."}</p>
              <div className="admin-detail-chips">
                <span className={`admin-detail-chip--${product.status}`}>{productStatusLabel(product)}</span>
              </div>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Categoria</span><strong>{product.categoryName}</strong></div>
            <div><span>Marca</span><strong>{product.isOwnBrand ? "G&V System (linea propia)" : product.brandName || "Sin marca"}</strong></div>
            <div><span>Compatibilidad</span><strong>{product.compatibilityMode === "universal" ? "Universal" : "Especifica"}</strong></div>
            <div>
              <span>Etiquetas</span>
              {product.tags.length ? (
                <span className="admin-detail-tags">
                  {product.tags.map((tag) => (
                    <em key={tag}>{tag}</em>
                  ))}
                </span>
              ) : (
                <strong>Sin etiquetas</strong>
              )}
            </div>
          </div>

          {(offer || product.featured) && (
            <section className="admin-detail-section">
              <h3>Oferta y vitrina</h3>
              <div className="admin-detail-facts">
                {offer && offer.saving > 0 && (
                  <div><span>Ahorro</span><strong>{formatCRC(offer.saving)}</strong></div>
                )}
                {product.featured && (
                  <div><span>Destacado</span><strong>{featuredStatusLabel(product)}</strong></div>
                )}
                {product.featured && typeof product.featuredOrder === "number" && (
                  <div><span>Prioridad en portada</span><strong>{product.featuredOrder}</strong></div>
                )}
              </div>
            </section>
          )}

          <AdminDetailSection title="Categoria relacionada" empty="La categoria no esta registrada.">
            {category && (
              <AdminDetailRelation
                title={category.name}
                meta={category.description || "Sin descripcion"}
                image={category.image}
                onClick={() => onSelect({ kind: "category", item: category })}
              />
            )}
          </AdminDetailSection>

          <AdminDetailSection title="Marca relacionada" empty="Este producto no tiene marca ni linea propia.">
            {/* La linea propia NO es una marca de la tabla (se guarda como
                casilla del producto, sin brandId), asi que hay que
                declararla aparte o la seccion sale vacia contradiciendo la
                ficha de arriba. Igual con las marcas viejas escritas a
                mano, que tampoco tienen registro que abrir. */}
            {product.isOwnBrand ? (
              <AdminDetailRelation
                title="G&V System"
                meta={`Linea propia de la casa · ${ownLineCount} producto(s)`}
              />
            ) : brand ? (
              <AdminDetailRelation
                title={brand.name}
                meta={brand.description || "Sin descripcion"}
                onClick={() => onSelect({ kind: "brand", item: brand })}
              />
            ) : (
              product.brandName && (
                <AdminDetailRelation
                  title={product.brandName}
                  meta="Marca escrita a mano, sin ficha registrada"
                />
              )
            )}
          </AdminDetailSection>

          <AdminDetailSection title="Modelos compatibles" empty="Este producto es universal o no tiene modelos vinculados.">
            {relatedVehicles.map(({ vehicle, row }) => (
              <AdminDetailRelation
                key={vehicle.id}
                title={`${vehicle.make} ${vehicle.model}`}
                meta={`Compatible ${vehicleRange(row)}`}
                onClick={() => onSelect({ kind: "vehicle", item: vehicle })}
              />
            ))}
          </AdminDetailSection>

          <AdminDetailSection title="Productos relacionados" empty="No hay otros productos en esta categoria.">
            {relatedProducts.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={productHasPublicPrice(item) ? formatCRC(item.price) : "Solo cotizacion"}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "product", item })}
              />
            ))}
          </AdminDetailSection>

          <div className="admin-detail-actions admin-detail-actions--product">
            <button className="button button--primary" type="button" onClick={() => onEditProduct(product)}>
              <Edit3 size={18} /> Editar producto
            </button>
            <a
              className="button button--secondary"
              href={productShareWhatsAppUrl(product)}
              target="_blank"
              rel="noopener"
            >
              <Share2 size={18} /> Compartir por WhatsApp
            </a>
            <a
              className="button button--secondary"
              href={`/productos/${product.slug}`}
              target="_blank"
              rel="noopener"
            >
              <Eye size={18} /> Ver en el sitio
            </a>
            {sources[product.id] && (
              /* `noreferrer` a proposito: al proveedor no tiene por que
                 llegarle que la visita sale del panel del negocio. */
              <a
                className="button button--secondary"
                href={sources[product.id]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={18} /> Página del proveedor
              </a>
            )}
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
          </div>
        </>
      );
    }

    if (detail.kind === "offer") {
      const product = detail.item;
      const relatedOffers = products
        .filter((item) => item.id !== product.id && (item.oldPrice || item.featured))
        .slice(0, 4);
      const saving = product.oldPrice && product.price ? product.oldPrice - product.price : 0;

      return (
        <>
          <div className="admin-detail-hero">
            <img src={product.images[0]} alt={product.name} />
            <div>
              <span className="admin-detail-kicker">Oferta o destacado</span>
              <h2>{product.name}</h2>
              <p>{product.categoryName}</p>
              <div className="admin-detail-chips">
                {product.oldPrice && <span>Antes: {formatCRC(product.oldPrice)}</span>}
                <span>{productHasPublicPrice(product) ? formatCRC(product.price) : "Solo cotizacion"}</span>
                {product.featured && <span>{featuredStatusLabel(product)}</span>}
              </div>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Descuento</span><strong>{saving > 0 ? formatCRC(saving) : "Sin descuento"}</strong></div>
            <div><span>Estado</span><strong>{productStatusLabel(product)}</strong></div>
            <div><span>Visibilidad</span><strong>{product.featured ? featuredStatusLabel(product) : "Solo oferta"}</strong></div>
            {product.featured && <div><span>Prioridad</span><strong>{product.featuredOrder ?? "Automatica"}</strong></div>}
          </div>

          <AdminDetailSection title="Otras ofertas relacionadas" empty="No hay otras ofertas o destacados.">
            {relatedOffers.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.oldPrice ? `Oferta: ${formatCRC(item.price)}` : featuredStatusLabel(item)}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "offer", item })}
              />
            ))}
          </AdminDetailSection>

          <div className="admin-detail-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
            <button className="button button--primary" type="button" onClick={() => onEditOffer(product)}>
              <Tags size={18} /> Editar oferta
            </button>
          </div>
        </>
      );
    }

    if (detail.kind === "promo") {
      const promo = detail.item;
      const match = promo.link?.match(/[?&]categoria=([^&]+)/);
      let categorySlug = "";
      try {
        categorySlug = match ? decodeURIComponent(match[1]) : "";
      } catch {
        categorySlug = "";
      }
      const linkedCategory = categories.find((item) => item.slug === categorySlug);
      const relatedProducts = (linkedCategory
        ? products.filter((item) => item.categorySlug === linkedCategory.slug)
        : products.filter((item) => isProductFeaturedActive(item) || item.oldPrice)
      ).slice(0, 4);
      const relatedPromos = promos.filter((item) => item.id !== promo.id).slice(0, 4);

      return (
        <>
          <div className="admin-detail-hero">
            <img src={promo.image} alt={promo.title} />
            <div>
              <span className="admin-detail-kicker">Promocion del inicio</span>
              <h2>{promo.title}</h2>
              <p>{promo.subtitle || "Sin subtitulo registrado."}</p>
              <div className="admin-detail-chips">
                <span>{promo.active === false ? "Oculta" : "Visible"}</span>
                <span>Orden {promo.order ?? "sin definir"}</span>
              </div>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Boton</span><strong>{promo.ctaLabel || "Sin texto"}</strong></div>
            <div><span>Destino</span><strong>{promo.link || "Sin enlace"}</strong></div>
          </div>

          <AdminDetailSection title="Categoria enlazada" empty="Esta promocion no esta vinculada a una categoria.">
            {linkedCategory && (
              <AdminDetailRelation
                title={linkedCategory.name}
                meta={linkedCategory.description || "Sin descripcion"}
                image={linkedCategory.image}
                onClick={() => onSelect({ kind: "category", item: linkedCategory })}
              />
            )}
          </AdminDetailSection>

          <AdminDetailSection title="Productos relacionados" empty="No hay productos vinculados a esta promocion.">
            {relatedProducts.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.categoryName}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "product", item })}
              />
            ))}
          </AdminDetailSection>

          <AdminDetailSection title="Otras promociones" empty="No hay otras promociones registradas.">
            {relatedPromos.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.title}
                meta={item.active === false ? "Oculta" : "Visible"}
                image={item.image}
                onClick={() => onSelect({ kind: "promo", item })}
              />
            ))}
          </AdminDetailSection>

          <div className="admin-detail-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
            <button className="button button--primary" type="button" onClick={() => onEditPromo(promo)}>
              <Edit3 size={18} /> Editar promocion
            </button>
          </div>
        </>
      );
    }

    if (detail.kind === "vehicle") {
      const vehicle = detail.item;
      const compatibleProducts = products.filter((item) => matchesVehicle(item, vehicle));
      const universalProducts = products.filter((item) => item.compatibilityMode === "universal").slice(0, 3);
      const relatedVehicles = vehicles
        .filter((item) => item.id !== vehicle.id && item.make.toLowerCase() === vehicle.make.toLowerCase())
        .slice(0, 4);

      return (
        <>
          <div className="admin-detail-hero admin-detail-hero--icon">
            <span className="admin-detail-vehicle-icon"><Car size={36} /></span>
            <div>
              <span className="admin-detail-kicker">Modelo de vehiculo</span>
              <h2>{vehicle.make} {vehicle.model}</h2>
              <p>Rango registrado: {vehicleRange(vehicle)}.</p>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Productos especificos</span><strong>{compatibleProducts.length}</strong></div>
            <div><span>Productos universales</span><strong>{universalProducts.length}</strong></div>
            <div><span>Marca</span><strong>{vehicle.make}</strong></div>
          </div>

          <AdminDetailSection title="Productos compatibles" empty="No hay productos especificos para este modelo.">
            {compatibleProducts.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.categoryName}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "product", item })}
              />
            ))}
          </AdminDetailSection>

          <AdminDetailSection title="Productos universales" empty="No hay productos universales registrados.">
            {universalProducts.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.categoryName}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "product", item })}
              />
            ))}
          </AdminDetailSection>

          <AdminDetailSection title="Otros modelos de la marca" empty="No hay otros modelos de esta marca.">
            {relatedVehicles.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={`${item.make} ${item.model}`}
                meta={vehicleRange(item)}
                onClick={() => onSelect({ kind: "vehicle", item })}
              />
            ))}
          </AdminDetailSection>

          <div className="admin-detail-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
            <button className="button button--primary" type="button" onClick={() => onEditVehicle(vehicle)}>
              <Edit3 size={18} /> Editar modelo
            </button>
          </div>
        </>
      );
    }

    if (detail.kind === "brand") {
      const brand = detail.item;
      const linkedProducts = products.filter((item) => item.brandId === brand.id);
      const relatedCategories = categories.filter((category) =>
        linkedProducts.some((product) => product.categorySlug === category.slug)
      );

      return (
        <>
          <div className="admin-detail-hero admin-detail-hero--icon">
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} />
            ) : (
              <span className="admin-detail-vehicle-icon"><BadgeCheck size={36} /></span>
            )}
            <div>
              <span className="admin-detail-kicker">Marca comercial</span>
              <h2>{brand.name}</h2>
              <p>{brand.description || "Sin descripcion registrada."}</p>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Productos asignados</span><strong>{linkedProducts.length}</strong></div>
            <div><span>Categorias relacionadas</span><strong>{relatedCategories.length}</strong></div>
          </div>

          <AdminDetailSection title="Productos de la marca" empty="Todavia no hay productos asignados a esta marca.">
            {linkedProducts.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.categoryName}
                image={item.images[0]}
                onClick={() => onSelect({ kind: "product", item })}
              />
            ))}
          </AdminDetailSection>

          <AdminDetailSection title="Categorias relacionadas" empty="No hay categorias vinculadas todavia.">
            {relatedCategories.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.description || "Sin descripcion"}
                image={item.image}
                onClick={() => onSelect({ kind: "category", item })}
              />
            ))}
          </AdminDetailSection>

          <div className="admin-detail-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
            <button className="button button--primary" type="button" onClick={() => onEditBrand(brand)}>
              <Edit3 size={18} /> Editar marca
            </button>
          </div>
        </>
      );
    }

    if (detail.kind === "request") {
      const request = detail.item;
      const replyUrl = request.phone ? clientWhatsAppUrl(request) : "";

      return (
        <>
          <div className="admin-detail-hero admin-detail-hero--icon">
            <span className="admin-detail-vehicle-icon"><MessageCircle size={36} /></span>
            <div>
              <span className="admin-detail-kicker">Solicitud de cliente</span>
              <h2>{request.name}</h2>
              <p>{requestDateLabel(request)}</p>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Telefono</span><strong>{request.phone || "No dejo telefono"}</strong></div>
            <div><span>Vehiculo</span><strong>{request.vehicle || "No indicado"}</strong></div>
          </div>

          <section className="admin-detail-section">
            <h3>Lo que busca</h3>
            <p>{request.message}</p>
          </section>

          <div className="admin-detail-actions">
            {request.phone && (
              <a className="button button--primary" href={replyUrl} target="_blank" rel="noopener">
                <Phone size={18} /> Responder por WhatsApp
              </a>
            )}
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
          </div>
        </>
      );
    }

    const category = detail.item;
    const parent = categories.find((item) => item.slug === category.parent);
    const childCategories = categories.filter((item) => item.parent === category.slug);
    const siblingCategories = categories
      .filter((item) => item.id !== category.id && item.parent === category.parent)
      .slice(0, 4);
    const categoryProducts = products.filter((item) => item.categorySlug === category.slug).slice(0, 5);

    return (
      <>
        <div className="admin-detail-hero">
          <img src={category.image} alt={category.name} />
          <div>
            <span className="admin-detail-kicker">Categoria</span>
            <h2>{category.name}</h2>
            <p>{category.description || "Sin descripcion registrada."}</p>
            <div className="admin-detail-chips">
              <span>{parent ? `Subcategoria de ${parent.name}` : "Categoria principal"}</span>
            </div>
          </div>
        </div>

        <div className="admin-detail-facts">
          <div><span>Productos directos</span><strong>{categoryProducts.length}</strong></div>
          <div><span>Subcategorias</span><strong>{childCategories.length}</strong></div>
          <div><span>Categoria madre</span><strong>{parent?.name || "Ninguna"}</strong></div>
        </div>

        <AdminDetailSection title="Categoria madre" empty="Esta es una categoria principal.">
          {parent && (
            <AdminDetailRelation
              title={parent.name}
              meta={parent.description || "Sin descripcion"}
              image={parent.image}
              onClick={() => onSelect({ kind: "category", item: parent })}
            />
          )}
        </AdminDetailSection>

        <AdminDetailSection title="Subcategorias" empty="No hay subcategorias registradas.">
          {childCategories.map((item) => (
            <AdminDetailRelation
              key={item.id}
              title={item.name}
              meta={item.description || "Sin descripcion"}
              image={item.image}
              onClick={() => onSelect({ kind: "category", item })}
            />
          ))}
        </AdminDetailSection>

        <AdminDetailSection title="Productos relacionados" empty="No hay productos directos en esta categoria.">
          {categoryProducts.map((item) => (
            <AdminDetailRelation
              key={item.id}
              title={item.name}
              meta={productHasPublicPrice(item) ? formatCRC(item.price) : "Solo cotizacion"}
              image={item.images[0]}
              onClick={() => onSelect({ kind: "product", item })}
            />
          ))}
        </AdminDetailSection>

        <AdminDetailSection title="Categorias relacionadas" empty="No hay otras categorias en este nivel.">
          {siblingCategories.map((item) => (
            <AdminDetailRelation
              key={item.id}
              title={item.name}
              meta={item.description || "Sin descripcion"}
              image={item.image}
              onClick={() => onSelect({ kind: "category", item })}
            />
          ))}
        </AdminDetailSection>

        <div className="admin-detail-actions">
          <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
          <button className="button button--primary" type="button" onClick={() => onEditCategory(category)}>
            <Edit3 size={18} /> Editar categoria
          </button>
        </div>
      </>
    );
  })();

  return (
    <AdminDialog title={detailTitle} onClose={onClose} onBack={onBack}>
      <div className="admin-detail" data-lenis-prevent>{detailBody}</div>
    </AdminDialog>
  );
}

function AdminDialog({
  title,
  children,
  onClose,
  onBack
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  /** Presente solo cuando hay un detalle anterior al cual regresar. */
  onBack?: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="admin-dialog-backdrop" role="presentation">
      <button type="button" className="admin-dialog__dismiss" aria-label="Cerrar" onClick={onClose} />
      <div
        className="admin-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        data-lenis-prevent
      >
        <div className="admin-dialog__header">
          {onBack && (
            <button type="button" className="admin-dialog__back" aria-label="Volver" onClick={onBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <strong id="admin-dialog-title">{title}</strong>
          <button ref={closeRef} type="button" aria-label="Cerrar" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}

function ConfirmDialog({
  state,
  onClose,
  onConfirm
}: {
  state: ConfirmState;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AdminDialog title={state.title} onClose={onClose}>
      <div className="admin-confirm">
        <p>{state.body}</p>
        <div className="admin-dialog-actions">
          <button className="button button--secondary" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button
            className={`button button--primary ${state.tone === "danger" ? "button--danger" : ""}`}
            type="button"
            onClick={onConfirm}
          >
            {state.actionLabel}
          </button>
        </div>
      </div>
    </AdminDialog>
  );
}
