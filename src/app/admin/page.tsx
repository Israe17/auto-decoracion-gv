"use client";

import { Children, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Car,
  Edit3,
  Eye,
  FolderTree,
  Megaphone,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Star,
  Tags,
  Trash2,
  X
} from "lucide-react";
import { formatCRC } from "@/lib/catalog";
import { firebaseEnabled } from "@/lib/firebase";
import { ImageListField } from "@/components/admin/ImageListField";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { ExpandableSpeedDial, type SpeedDialAction } from "@/components/admin/ExpandableSpeedDial";
import { AdminStepper } from "@/components/admin/AdminStepper";
import {
  fetchAdminData,
  importSeedCatalog,
  removeCategory,
  removeProduct,
  removePromo,
  removeVehicle,
  upsertCategory,
  upsertProduct,
  upsertPromo,
  upsertVehicle
} from "@/lib/store";
import {
  Category,
  Product,
  Promo,
  SaleMode,
  VehicleCompatibility,
  VehicleModel
} from "@/types";

type AdminTab = "products" | "offers" | "promos" | "vehicles" | "categories";

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
  | { kind: "category"; item: Category };

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
    featured: false
  };
}

function productHasPublicPrice(product: Product) {
  return product.saleMode === "price_quote" && typeof product.price === "number";
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicles, setVehicles] = useState<VehicleModel[]>([]);
  const [productDialog, setProductDialog] = useState<Product | null>(null);
  const [offerDialog, setOfferDialog] = useState<Product | null | undefined>(undefined);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleModel | null>(null);
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [detail, setDetail] = useState<AdminDetail | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [query, setQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetchAdminData()
      .then((data) => {
        if (!active) return;
        setProducts(data.products);
        setCategories(data.categories);
        setVehicles(data.vehicles);
        setPromos(data.promos);
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

  const stats = {
    products: products.length,
    offers: products.filter((product) => product.oldPrice).length,
    featured: products.filter((product) => product.featured).length,
    categories: categories.length,
    vehicles: vehicles.length
  };

  function reportError(error: unknown) {
    console.error(error);
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

  async function handleImportSeed() {
    setImporting(true);
    try {
      await importSeedCatalog();
      const data = await fetchAdminData();
      setProducts(data.products);
      setCategories(data.categories);
      setVehicles(data.vehicles);
      setPromos(data.promos);
      setMessage("Catalogo de ejemplo importado.");
    } catch (error) {
      reportError(error);
    } finally {
      setImporting(false);
    }
  }

  async function saveProduct(product: Product) {
    const exists = products.some((item) => item.id === product.id);
    try {
      await upsertProduct(product);
      setProducts(
        exists
          ? products.map((item) => (item.id === product.id ? product : item))
          : [product, ...products]
      );
      setMessage(exists ? "Producto actualizado." : "Producto creado.");
      setProductDialog(null);
    } catch (error) {
      reportError(error);
    }
  }

  async function saveOffer(productId: string, oldPrice?: number, featured = false) {
    const target = products.find((product) => product.id === productId);
    if (!target) return;

    const updated: Product = {
      ...target,
      oldPrice: productHasPublicPrice(target) ? oldPrice : undefined,
      featured
    };

    try {
      await upsertProduct(updated);
      setProducts(products.map((item) => (item.id === productId ? updated : item)));
      setMessage("Promocion actualizada.");
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
          setMessage("Producto eliminado.");
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
        const updated: Product = { ...product, oldPrice: undefined, featured: false };
        try {
          await upsertProduct(updated);
          setProducts((prev) => prev.map((item) => (item.id === product.id ? updated : item)));
          setMessage("Promocion eliminada.");
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
      image: String(form.get("categoryImage") || ""),
      parent: parent || undefined
    };

    const exists = categories.some((item) => item.id === category.id);
    try {
      await upsertCategory(category);
      setCategories(
        exists
          ? categories.map((item) => (item.id === category.id ? category : item))
          : [category, ...categories]
      );
      setMessage("Categorias actualizadas.");
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
      await upsertPromo(promo);
      setPromos(
        exists
          ? promos.map((item) => (item.id === promo.id ? promo : item))
          : [...promos, promo]
      );
      setMessage("Promociones actualizadas.");
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
          setMessage("Promocion eliminada.");
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
          setMessage("Categoria eliminada.");
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
      await upsertVehicle(vehicle);
      setVehicles(
        exists
          ? vehicles.map((item) => (item.id === vehicle.id ? vehicle : item))
          : [vehicle, ...vehicles]
      );
      setMessage("Modelos actualizados.");
      setEditingVehicle(null);
      setVehicleDialogOpen(false);
      formElement.reset();
    } catch (error) {
      reportError(error);
    }
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
          setMessage("Modelo eliminado.");
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
    ["categories", "Categorias"]
  ];

  const sectionIcons: Record<AdminTab, ReactNode> = {
    products: <Tags size={20} />,
    offers: <Star size={20} />,
    promos: <Megaphone size={20} />,
    vehicles: <Car size={20} />,
    categories: <FolderTree size={20} />
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
          <span className="eyebrow">Panel privado</span>
          <h1>Administracion del catalogo</h1>
          <p>Gestione productos, ofertas, modelos de autos y categorias desde una sola pantalla.</p>
        </div>
        <div className="admin-heading__meta">
          <span>Modo actual</span>
          <strong>{firebaseEnabled ? "Firebase" : "Local demo"}</strong>
          {firebaseEnabled && !loading && (products.length > 0 || categories.length > 0) && (
            <button
              className="button button--secondary"
              type="button"
              disabled={importing}
              onClick={confirmImportSeed}
            >
              {importing ? "Importando..." : "Sincronizar catalogo de ejemplo"}
            </button>
          )}
        </div>
      </div>

      {!firebaseEnabled && (
        <div className="notice">
          <ShieldAlert size={20} />
          Los cambios se guardan en este navegador. Luego conectamos Firebase para publicarlos en
          todos los dispositivos.
        </div>
      )}

      {firebaseEnabled && !loading && !products.length && !categories.length && (
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
        <div>
          <span>Productos</span>
          <strong>{stats.products}</strong>
        </div>
        <div>
          <span>Ofertas</span>
          <strong>{stats.offers}</strong>
        </div>
        <div>
          <span>Destacados</span>
          <strong>{stats.featured}</strong>
        </div>
        <div>
          <span>Categorias</span>
          <strong>{stats.categories}</strong>
        </div>
        <div>
          <span>Modelos</span>
          <strong>{stats.vehicles}</strong>
        </div>
      </div>

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

      {message && <p className="form-status">{message}</p>}

      {loading && <p className="admin-empty">Cargando datos...</p>}

      {!loading && activeTab === "products" && (
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
      )}

      {!loading && activeTab === "offers" && (
        <AdminOfferList
          products={offerProducts}
          allProducts={products}
          empty="No hay productos marcados como oferta o destacados."
          onCreate={() => setOfferDialog(null)}
          onView={(product) => setDetail({ kind: "offer", item: product })}
          onEdit={setOfferDialog}
          onRemove={confirmRemoveOffer}
        />
      )}

      {!loading && activeTab === "promos" && (
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
      )}

      {!loading && activeTab === "vehicles" && (
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
      )}

      {!loading && activeTab === "categories" && (
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
                defaultValue={editingCategory?.image}
                folder="categories"
              />
              <label>
                Categoría madre
                <select
                  name="categoryParent"
                  defaultValue={editingCategory?.parent || ""}
                >
                  <option value="">Ninguna (categoría principal)</option>
                  {categories
                    .filter(
                      (item) => !item.parent && item.id !== editingCategory?.id
                    )
                    .map((item) => (
                      <option key={item.id} value={item.slug}>
                        {item.name}
                      </option>
                    ))}
                </select>
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
      )}

      {productDialog && (
        <ProductDialog
          product={productDialog}
          categories={categories}
          vehicleOptions={vehicles}
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

      {detail && (
        <AdminDetailDialog
          detail={detail}
          products={products}
          categories={categories}
          vehicles={vehicles}
          promos={promos}
          onClose={() => setDetail(null)}
          onSelect={setDetail}
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
          <select
            className="admin-vehicle-filter"
            aria-label="Filtrar por vehiculo"
            value={vehicleFilter}
            onChange={(event) => onVehicleFilterChange(event.target.value)}
          >
            <option value="all">Todos los vehículos</option>
            <option value="universal">Universales</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
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
              <span>{product.categoryName}</span>
              <small>
                {product.oldPrice ? "Oferta" : "Sin oferta"} -{" "}
                {product.featured ? "Destacado" : "Normal"} -{" "}
                {productHasPublicPrice(product) ? formatCRC(product.price) : "Solo cotizacion"}
              </small>
            </div>
            <div className="admin-row-actions">
              <button type="button" aria-label="Ver detalle" title="Ver detalle" onClick={() => onView(product)}>
                <Eye size={16} />
              </button>
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

function ProductDialog({
  product,
  categories,
  vehicleOptions,
  onClose,
  onSave
}: {
  product: Product;
  categories: Category[];
  vehicleOptions: VehicleModel[];
  onClose: () => void;
  onSave: (product: Product) => void;
}) {
  const [compatibilityMode, setCompatibilityMode] = useState(product.compatibilityMode);
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

    onSave({
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
      featured: product.featured
    });
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
            <select name="categorySlug" required defaultValue={product.categorySlug}>
              {categories
                .filter((category) => !category.parent)
                .map((category) => {
                  const children = categories.filter(
                    (item) => item.parent === category.slug
                  );
                  if (!children.length) {
                    return (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    );
                  }
                  return (
                    <optgroup key={category.id} label={category.name}>
                      <option value={category.slug}>{category.name} (general)</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.slug}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
            </select>
          </label>
          <label>
            Estado
            <select name="status" defaultValue={product.status}>
              <option value="available">Disponible</option>
              <option value="on_request">Bajo pedido</option>
              <option value="sold_out">Agotado</option>
            </select>
          </label>
        </div>

        </div>
        <div>
        <div className="form-grid">
          <label>
            Modo de venta
            <select name="saleMode" defaultValue={product.saleMode}>
              <option value="price_quote">Mostrar precio + cotizar</option>
              <option value="quote_only">Solo cotizar</option>
            </select>
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
          label="Imagenes del producto"
          defaultValue={product.images}
          folder="products"
        />

        </div>
        <div>
        <label>
          Descripcion
          <textarea name="description" rows={4} required defaultValue={product.description} />
        </label>

        <label>
          Etiquetas
          <input name="tags" defaultValue={product.tags.join(", ")} />
        </label>

        </div>
        <div>
        <label>
          Compatibilidad
          <select
            name="compatibilityMode"
            value={compatibilityMode}
            onChange={(event) =>
              setCompatibilityMode(event.target.value as Product["compatibilityMode"])
            }
          >
            <option value="universal">Universal / varios vehiculos</option>
            <option value="specific">Vehiculo especifico</option>
          </select>
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
                  <select
                    aria-label="Modelo administrado"
                    value={managed ? optionKey(row.make, row.model) : "custom"}
                    onChange={(event) => {
                      const value = event.target.value;
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
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option.id} value={optionKey(option.make, option.model)}>
                        {option.make} {option.model}
                      </option>
                    ))}
                    <option value="custom">Otro vehículo…</option>
                  </select>

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
  onSave: (productId: string, oldPrice?: number, featured?: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState(initialProduct?.id || products[0]?.id || "");
  const selectedProduct = products.find((product) => product.id === selectedId);
  const canOffer = Boolean(selectedProduct && productHasPublicPrice(selectedProduct));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;

    const form = new FormData(event.currentTarget);
    const oldPrice = Number(form.get("oldPrice"));
    const featured = form.get("featured") === "on";
    onSave(selectedProduct.id, canOffer && oldPrice > 0 ? oldPrice : undefined, featured);
  }

  return (
    <AdminDialog title={initialProduct ? "Editar promocion" : "Crear oferta"} onClose={onClose}>
      <form key={selectedId} className="admin-form admin-dialog-form" noValidate onSubmit={handleSubmit}>
        <AdminStepper steps={["Producto", "Precio y visibilidad"]} submitLabel="Guardar promocion">
        <div>
        <label>
          Producto
          <select
            name="productId"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
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
        <div className="form-grid">
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
          <label className="checkbox-row checkbox-row--switch admin-dialog-switch">
            <input name="featured" type="checkbox" defaultChecked={Boolean(selectedProduct?.featured)} />
            <span className="switch-ui" aria-hidden="true">
              <Star size={14} />
            </span>
            <span>Destacado</span>
          </label>
        </div>

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
              defaultValue={category?.image}
              folder="categories"
            />
          </div>
          <div>
            <label>
              Categoria madre
              <select name="categoryParent" defaultValue={category?.parent || ""}>
                <option value="">Ninguna (categoria principal)</option>
                {categories
                  .filter((item) => !item.parent && item.id !== category?.id)
                  .map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
              </select>
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
          <Plus size={18} /> Crear oferta
        </button>
      </div>

      {products.length ? (
        <div className="admin-offer-grid">
          {products.map((product) => {
            const hasCurrentPrice = productHasPublicPrice(product);
            const hasOffer = hasCurrentPrice && typeof product.oldPrice === "number";

            return (
              <article className="admin-offer-card" key={product.id}>
                <img src={product.images[0]} alt={product.name} />
                <div className="admin-offer-card__body">
                  <div className="admin-offer-card__chips">
                    {hasOffer && <span>Oferta activa</span>}
                    {product.featured && <span>Destacado</span>}
                    {!hasOffer && hasCurrentPrice && <span>Sin descuento</span>}
                    {!hasCurrentPrice && <span>Solo cotizacion</span>}
                  </div>
                  <h3>{product.name}</h3>
                  <p>{product.categoryName}</p>

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
                    <button type="button" onClick={() => onView(product)}>
                      <Eye size={16} /> Ver detalle
                    </button>
                    <button type="button" onClick={() => onEdit(product)}>
                      <Edit3 size={16} /> Editar promocion
                    </button>
                    <button type="button" onClick={() => onRemove(product)}>
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
    onEdit: () => void;
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
                <button type="button" aria-label="Editar" onClick={item.onEdit}>
                  <Edit3 size={16} />
                </button>
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
  onClick: () => void;
}) {
  return (
    <button className="admin-detail-relation" type="button" onClick={onClick}>
      {image ? <img src={image} alt="" /> : <span className="admin-row-icon" aria-hidden="true" />}
      <span>
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
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
      <h3>{title}</h3>
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
  onClose,
  onSelect,
  onEditProduct,
  onEditOffer,
  onEditPromo,
  onEditVehicle,
  onEditCategory
}: {
  detail: AdminDetail;
  products: Product[];
  categories: Category[];
  vehicles: VehicleModel[];
  promos: Promo[];
  onClose: () => void;
  onSelect: (detail: AdminDetail) => void;
  onEditProduct: (product: Product) => void;
  onEditOffer: (product: Product) => void;
  onEditPromo: (promo: Promo) => void;
  onEditVehicle: (vehicle: VehicleModel) => void;
  onEditCategory: (category: Category) => void;
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
            : "Detalle de la categoria";

  const detailBody = (() => {
    if (detail.kind === "product") {
      const product = detail.item;
      const category = categories.find((item) => item.slug === product.categorySlug);
      const relatedProducts = products
        .filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug)
        .slice(0, 4);
      const relatedVehicles = product.vehicles
        .map((row) => vehicles.find((item) => matchesVehicle({ ...product, vehicles: [row] }, item)))
        .filter((item): item is VehicleModel => Boolean(item));

      return (
        <>
          <div className="admin-detail-hero">
            <img src={product.images[0]} alt={product.name} />
            <div>
              <span className="admin-detail-kicker">Producto</span>
              <h2>{product.name}</h2>
              <p>{product.description || "Sin descripcion registrada."}</p>
              <div className="admin-detail-chips">
                <span>{productStatusLabel(product)}</span>
                <span>{productHasPublicPrice(product) ? formatCRC(product.price) : "Solo cotizacion"}</span>
                {product.oldPrice && <span>Oferta activa</span>}
                {product.featured && <span>Destacado</span>}
              </div>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Categoria</span><strong>{product.categoryName}</strong></div>
            <div><span>Compatibilidad</span><strong>{product.compatibilityMode === "universal" ? "Universal" : "Especifica"}</strong></div>
            <div><span>Etiquetas</span><strong>{product.tags.length ? product.tags.join(", ") : "Sin etiquetas"}</strong></div>
          </div>

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

          <AdminDetailSection title="Modelos compatibles" empty="Este producto es universal o no tiene modelos vinculados.">
            {relatedVehicles.map((vehicle) => (
              <AdminDetailRelation
                key={vehicle.id}
                title={`${vehicle.make} ${vehicle.model}`}
                meta={vehicleRange(vehicle)}
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

          <div className="admin-detail-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cerrar</button>
            <button className="button button--primary" type="button" onClick={() => onEditProduct(product)}>
              <Edit3 size={18} /> Editar producto
            </button>
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
                {product.featured && <span>Destacado</span>}
              </div>
            </div>
          </div>

          <div className="admin-detail-facts">
            <div><span>Descuento</span><strong>{saving > 0 ? formatCRC(saving) : "Sin descuento"}</strong></div>
            <div><span>Estado</span><strong>{productStatusLabel(product)}</strong></div>
            <div><span>Visibilidad</span><strong>{product.featured ? "Destacado en inicio" : "Solo oferta"}</strong></div>
          </div>

          <AdminDetailSection title="Otras ofertas relacionadas" empty="No hay otras ofertas o destacados.">
            {relatedOffers.map((item) => (
              <AdminDetailRelation
                key={item.id}
                title={item.name}
                meta={item.oldPrice ? `Oferta: ${formatCRC(item.price)}` : "Destacado"}
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
        : products.filter((item) => item.featured || item.oldPrice)
      ).slice(0, 4);
      const relatedPromos = promos.filter((item) => item.id !== promo.id).slice(0, 4);

      return (
        <>
          <div className="admin-detail-hero admin-detail-hero--promo">
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
    <AdminDialog title={detailTitle} onClose={onClose}>
      <div className="admin-detail">{detailBody}</div>
    </AdminDialog>
  );
}

function AdminDialog({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
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
      <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title">
        <div className="admin-dialog__header">
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
