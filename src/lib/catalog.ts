import { Category, Product } from "@/types";

export const categories: Category[] = [
  {
    id: "camping",
    slug: "accesorios-camping",
    name: "Accesorios de Camping",
    description: "Equipo para ruta, playa y aventura.",
    image:
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "alfombras",
    slug: "alfombras",
    name: "Alfombras",
    description: "Alfombras a la medida, 3D y de uso pesado.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "audio-video",
    slug: "audio-video",
    name: "Audio y Video",
    description: "Pantallas, cámaras, parlantes y accesorios.",
    image:
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "canastas",
    slug: "canastas-plataformas",
    name: "Canastas y Plataformas",
    description: "Carga superior para trabajo y aventura.",
    image:
      "https://images.unsplash.com/photo-1516939884455-1445c8652f83?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "lonas",
    slug: "lonas-cobertores-batea",
    name: "Lonas y Cobertores Rígidos de Batea",
    description: "Protección para bateas y carga.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "plasticos",
    slug: "componentes-plasticos-exteriores",
    name: "Componentes Plásticos Exteriores",
    description: "Fenders, molduras y accesorios exteriores.",
    image:
      "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "bumpers",
    slug: "bumpers-defensas",
    name: "Bumpers y Defensas",
    description: "Defensas delanteras y traseras para trabajo pesado.",
    image:
      "https://images.unsplash.com/photo-1533055640609-24b498dfd74c?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "espaciadores",
    slug: "espaciadores-aros",
    name: "Espaciadores de Aros",
    description: "Mejor postura y compatibilidad de aros.",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "estribos",
    slug: "estribos",
    name: "Estribos",
    description: "Entrada segura y apariencia robusta.",
    image:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "iluminacion",
    slug: "iluminacion",
    name: "Iluminación",
    description: "Barras LED, halógenos, focos auxiliares y más.",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "levante",
    slug: "kits-levante-suspension",
    name: "Kits de Levante y Suspensión",
    description: "Altura, control y desempeño fuera de carretera.",
    image:
      "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "planchas",
    slug: "planchas",
    name: "Planchas",
    description: "Protección inferior para motor, caja y diferenciales.",
    image:
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "parrillas",
    slug: "parrillas",
    name: "Parrillas",
    description: "Estilo frontal y protección para el vehículo.",
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "remolques",
    slug: "remolques",
    name: "Remolques",
    description: "Bolas, recibidores y accesorios de arrastre.",
    image:
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "roll-bars",
    slug: "roll-bars",
    name: "Roll Bars",
    description: "Protección, soporte y presencia para pickup.",
    image:
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "racks",
    slug: "racks-accesorios-techo",
    name: "Racks y Accesorios de Techo",
    description: "Racks, porta bicicletas y soluciones de carga.",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "pistones",
    slug: "pistones",
    name: "Pistones",
    description: "Pistones para compuertas, tapas y capós.",
    image:
      "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "snorkels",
    slug: "snorkels-filtros-aire",
    name: "Snorkels y Filtros de Aire",
    description: "Mejor admisión para condiciones exigentes.",
    image:
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1200&q=80"
  }
];

export const products: Product[] = [
  {
    id: "p-001",
    slug: "barra-led-20-pulgadas",
    name: "Barra LED 20 pulgadas",
    categorySlug: "iluminacion",
    categoryName: "Iluminación",
    saleMode: "price_quote",
    price: 65000,
    oldPrice: 78000,
    status: "available",
    compatibilityMode: "universal",
    vehicles: [],
    images: [
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Barra LED auxiliar para rutas oscuras, trabajo nocturno y aventuras fuera de carretera. Instalación disponible en el taller.",
    tags: ["LED", "4x4", "Universal"],
    featured: true
  },
  {
    id: "p-002",
    slug: "estribos-laterales-hilux",
    name: "Estribos laterales negros para Hilux",
    categorySlug: "estribos",
    categoryName: "Estribos",
    saleMode: "quote_only",
    status: "on_request",
    compatibilityMode: "specific",
    vehicles: [{ make: "Toyota", model: "Hilux", fromYear: 2016, toYear: 2025 }],
    images: [
      "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Estribos laterales de acabado negro para pickup. El precio depende de modelo, disponibilidad e instalación.",
    tags: ["Hilux", "Pickup", "Instalación"],
    featured: true
  },
  {
    id: "p-003",
    slug: "alfombras-5d-hilux-revo",
    name: "Alfombras 5D para Toyota Hilux Revo",
    categorySlug: "alfombras",
    categoryName: "Alfombras",
    saleMode: "price_quote",
    price: 42000,
    status: "available",
    compatibilityMode: "specific",
    vehicles: [{ make: "Toyota", model: "Hilux", fromYear: 2016, toYear: 2023 }],
    images: ["/products/alfombras-5d-hilux-revo.webp"],
    description:
      "Alfombras 5D a la medida para Toyota Hilux Revo 2016-2023: protegen el piso original contra agua y barro, en material TPE premium antideslizante y fáciles de limpiar.",
    tags: ["Interior", "Hilux", "Protección"],
    featured: true
  },
  {
    id: "p-007",
    slug: "alfombras-5d-isuzu-dmax",
    name: "Alfombras 5D para Isuzu D-Max",
    categorySlug: "alfombras",
    categoryName: "Alfombras",
    saleMode: "price_quote",
    price: 42000,
    status: "available",
    compatibilityMode: "specific",
    vehicles: [{ make: "Isuzu", model: "D-Max", fromYear: 2020, toYear: 2026 }],
    images: ["/products/alfombras-5d-isuzu-dmax.webp"],
    description:
      "Alfombras 5D con ajuste perfecto para Isuzu D-Max 2020 en adelante: cobertura total del piso, impermeables y de larga vida útil.",
    tags: ["Interior", "D-Max", "Protección"]
  },
  {
    id: "p-008",
    slug: "alfombras-5d-navara-d40",
    name: "Alfombras 5D para Nissan Navara D40",
    categorySlug: "alfombras",
    categoryName: "Alfombras",
    saleMode: "price_quote",
    price: 42000,
    status: "available",
    compatibilityMode: "specific",
    vehicles: [{ make: "Nissan", model: "Navara", fromYear: 2008, toYear: 2014 }],
    images: ["/products/alfombras-5d-navara-d40.webp"],
    description:
      "Alfombras 5D diseñadas a la medida para Nissan Navara D40 2008-2014: protección máxima del interior con instalación rápida y segura.",
    tags: ["Interior", "Navara", "Protección"]
  },
  {
    id: "p-009",
    slug: "alfombras-5d-jeep-wrangler-jk",
    name: "Alfombras 5D para Jeep Wrangler JK",
    categorySlug: "alfombras",
    categoryName: "Alfombras",
    saleMode: "price_quote",
    price: 42000,
    status: "available",
    compatibilityMode: "specific",
    vehicles: [{ make: "Jeep", model: "Wrangler", fromYear: 2007, toYear: 2018 }],
    images: ["/products/alfombras-5d-jeep-wrangler-jk.webp"],
    description:
      "Alfombras 5D para Jeep Wrangler JK 2007-2018: juego completo antideslizante que protege el piso original en cualquier aventura.",
    tags: ["Interior", "Wrangler", "4x4"]
  },
  {
    id: "p-004",
    slug: "cobertor-rigido-batea-frontier",
    name: "Cobertor rígido de batea para Frontier",
    categorySlug: "lonas-cobertores-batea",
    categoryName: "Lonas y Cobertores Rígidos de Batea",
    saleMode: "quote_only",
    status: "on_request",
    compatibilityMode: "specific",
    vehicles: [{ make: "Nissan", model: "Frontier", fromYear: 2021, toYear: 2026 }],
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Cobertor rígido para proteger carga y mejorar el acabado de la pickup. Se cotiza según versión de batea.",
    tags: ["Frontier", "Batea", "Bajo pedido"],
    featured: true
  },
  {
    id: "p-005",
    slug: "kit-levante-fortuner",
    name: "Kit de levante y suspensión para Fortuner",
    categorySlug: "kits-levante-suspension",
    categoryName: "Kits de Levante y Suspensión",
    saleMode: "quote_only",
    status: "on_request",
    compatibilityMode: "specific",
    vehicles: [{ make: "Toyota", model: "Fortuner", fromYear: 2017, toYear: 2025 }],
    images: [
      "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Kit de levante para mejorar altura y postura. Se recomienda cotización con datos completos del vehículo.",
    tags: ["Suspensión", "Fortuner", "4x4"]
  },
  {
    id: "p-006",
    slug: "camara-reversa-pantalla",
    name: "Cámara de reversa con pantalla",
    categorySlug: "audio-video",
    categoryName: "Audio y Video",
    saleMode: "price_quote",
    price: 58000,
    status: "available",
    compatibilityMode: "universal",
    vehicles: [],
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80"
    ],
    description:
      "Sistema de cámara de reversa con pantalla para mejorar seguridad y comodidad al estacionar.",
    tags: ["Seguridad", "Universal", "Instalación"]
  }
];

export function formatCRC(price?: number) {
  if (typeof price !== "number") return "Consultar precio";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0
  }).format(price);
}

export function findProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
