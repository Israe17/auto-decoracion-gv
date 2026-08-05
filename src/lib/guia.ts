"use client";

// Recorridos guiados del panel. Cada modulo tiene el suyo: la primera vez
// que se abre arranca solo y despues queda el boton "Guia" del encabezado.
//
// El disparo va por evento, mismo patron que src/lib/cotizar.ts: el motor
// (GuiaTour) vive UNA sola vez en la pagina y escucha, en vez de pasar
// props o montar un provider que atraviese media aplicacion.

export type ModuloGuia =
  | "tablero"
  | "products"
  | "offers"
  | "promos"
  | "vehicles"
  | "categories"
  | "brands"
  | "gallery"
  | "requests";

export type PasoGuia = {
  /** Valor de `data-guia` del elemento que se ilumina. */
  ancla: string;
  titulo: string;
  texto: string;
};

export type Recorrido = {
  titulo: string;
  pasos: PasoGuia[];
};

export const EVENTO_GUIA = "gv-guia";
/** La guia se cerro: quien encadena recorridos vuelve a evaluar. */
export const EVENTO_GUIA_FIN = "gv-guia-fin";

export function pedirGuia(modulo: ModuloGuia) {
  window.dispatchEvent(new CustomEvent<ModuloGuia>(EVENTO_GUIA, { detail: modulo }));
}

// --- Cuales ya se vieron -------------------------------------------------

const CLAVE_VISTAS = "gv-guia-vistas";

function leerVistas(): Record<string, boolean> {
  if (typeof window === "undefined") return {};

  try {
    return JSON.parse(localStorage.getItem(CLAVE_VISTAS) || "{}") as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function guiaVista(modulo: ModuloGuia) {
  return Boolean(leerVistas()[modulo]);
}

export function marcarGuiaVista(modulo: ModuloGuia) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CLAVE_VISTAS, JSON.stringify({ ...leerVistas(), [modulo]: true }));
  } catch {
    // Sin localStorage (modo privado) la guia simplemente vuelve a salir.
  }
}

// --- Los recorridos ------------------------------------------------------
//
// Las listas simples (modelos, categorias, marcas, galeria y solicitudes)
// comparten anclas — `lista-crear`, `lista-fila`, `lista-acciones` — porque
// comparten componente; lo que cambia en cada modulo es el texto.

export const RECORRIDOS: Record<ModuloGuia, Recorrido> = {
  tablero: {
    titulo: "El panel por dentro",
    pasos: [
      {
        ancla: "tablero-metricas",
        titulo: "Cómo va el catálogo",
        texto:
          "De un vistazo: cuántos productos tiene publicados, cuántos están en oferta y cuántos aparecen destacados en la portada."
      },
      {
        ancla: "tablero-atencion",
        titulo: "Lo que hay que revisar",
        texto:
          "Aquí le avisamos de lo que quedó a medias: productos sin foto, sin precio o con el destacado vencido. Toque cualquier línea y lo lleva al producto."
      },
      {
        ancla: "tablero-accesos",
        titulo: "Atajos",
        texto:
          "Para empezar de una vez lo que más se usa: crear un producto, una oferta o una categoría."
      },
      {
        ancla: "tablero-pestanas",
        titulo: "Los módulos",
        texto:
          "Cada pestaña administra una parte del sitio. En el celular estas pestañas se cambian por el botón rojo de abajo a la derecha."
      },
      {
        ancla: "tablero-modo",
        titulo: "Dónde se guardan los cambios",
        texto:
          "Si dice Supabase, lo que usted guarde sale publicado en el sitio. Si dice Local, se queda solo en este navegador."
      },
      {
        ancla: "tablero-guia",
        titulo: "Esta guía siempre está",
        texto:
          "Cada módulo tiene su propio recorrido. Si se le olvida algo, toque el botón Guía del encabezado y se lo repetimos."
      }
    ]
  },

  products: {
    titulo: "Productos",
    pasos: [
      {
        ancla: "productos-destacados",
        titulo: "Los que salen en la portada",
        texto:
          "Esta vitrina muestra los productos destacados que el visitante ve primero al entrar al sitio, en el orden en que aparecen."
      },
      {
        ancla: "productos-buscador",
        titulo: "Encontrar un producto",
        texto:
          "Busque por nombre o filtre por vehículo para ver solo lo que le sirve a ese carro. Con muchos productos, esto es lo más rápido."
      },
      {
        ancla: "productos-nuevo",
        titulo: "Agregar un producto",
        texto:
          "El formulario va por pasos: datos, precio, fotos, descripción y para cuáles vehículos sirve. Puede devolverse cuando quiera antes de guardar."
      },
      {
        ancla: "productos-nuevo",
        titulo: "Extras de otro producto",
        texto:
          "En el primer paso está \"Complemento de\". Úselo para los accesorios que se venden aparte pero acompañan a otro producto: aparecerán en la ficha del principal y en el catálogo con la etiqueta \"Complemento\"."
      },
      {
        ancla: "productos-fila",
        titulo: "Cada producto en una línea",
        texto:
          "Debajo del nombre le decimos la categoría, la marca y cómo está: en oferta o normal, destacado o no, y su precio."
      },
      {
        ancla: "productos-acciones",
        titulo: "Lo que puede hacer con él",
        texto:
          "Ver la ficha completa, mandársela a un cliente por WhatsApp con precio y enlace, ponerlo en oferta, editarlo o eliminarlo."
      }
    ]
  },

  offers: {
    titulo: "Ofertas y destacados",
    pasos: [
      {
        ancla: "ofertas-crear",
        titulo: "Poner un producto en oferta",
        texto:
          "Elija el producto y escriba el precio rebajado: nosotros calculamos cuánto ahorra el cliente y dejamos el precio normal tachado en el sitio."
      },
      {
        ancla: "ofertas-tarjeta",
        titulo: "Oferta y destacado no son lo mismo",
        texto:
          "La oferta baja el precio. El destacado hace que el producto salga en la portada, con o sin rebaja. Un producto puede tener los dos."
      },
      {
        ancla: "ofertas-precios",
        titulo: "Cómo lo verá el cliente",
        texto:
          "El precio normal va tachado y el nuevo resaltado, igual que en la ficha del producto."
      },
      {
        ancla: "ofertas-quitar",
        titulo: "Terminar la oferta",
        texto:
          "Quitar deja el producto en el catálogo con su precio normal de vuelta; no lo borra ni le cambia nada más."
      }
    ]
  },

  promos: {
    titulo: "Promociones del inicio",
    pasos: [
      {
        ancla: "promos-lista",
        titulo: "Las láminas de la portada",
        texto:
          "Estas son las láminas grandes que giran en el inicio del sitio. Sirven para anunciar una campaña, no para un producto en particular."
      },
      {
        ancla: "lista-crear",
        titulo: "Armar una lámina",
        texto:
          "Necesita una foto horizontal y clara, un título corto, el texto del botón y a dónde lleva: el catálogo, una categoría o la página de contacto."
      },
      {
        ancla: "lista-fila",
        titulo: "Orden y publicación",
        texto:
          "Aquí ve si la lámina está visible u oculta y en qué orden gira. Si la oculta, deja de salir en el sitio pero no se pierde."
      },
      {
        ancla: "lista-acciones",
        titulo: "Revisar, cambiar o quitar",
        texto: "Vea cómo quedó, cámbiele la foto o los textos, o elimínela cuando la campaña termine."
      }
    ]
  },

  vehicles: {
    titulo: "Modelos de autos",
    pasos: [
      {
        ancla: "lista-panel",
        titulo: "Para qué sirven los modelos",
        texto:
          "Son los carros con los que trabaja. Con ellos el cliente filtra el catálogo por su vehículo y usted marca a cuál le sirve cada producto."
      },
      {
        ancla: "lista-crear",
        titulo: "Agregar un modelo",
        texto:
          "Anote la marca, el modelo y desde qué año hasta qué año lo trabaja. Ese rango es el que después usa el filtro del sitio."
      },
      {
        ancla: "lista-fila",
        titulo: "Marca, modelo y años",
        texto:
          "El rango de años es importante: un producto para Hilux 2016 a 2020 no le aparece al cliente que tiene una del 2012."
      },
      {
        ancla: "lista-acciones",
        titulo: "Corregir o eliminar",
        texto:
          "Si elimina un modelo, los productos siguen ahí: solo dejan de ofrecerse para ese carro."
      }
    ]
  },

  categories: {
    titulo: "Categorías",
    pasos: [
      {
        ancla: "lista-panel",
        titulo: "Cómo se ordena el catálogo",
        texto:
          "Las categorías son las secciones del sitio. Hay categorías madre (Iluminación) y dentro de ellas subcategorías (Barras LED)."
      },
      {
        ancla: "lista-crear",
        titulo: "Crear una categoría",
        texto:
          "Póngale nombre, una foto de portada y, si va dentro de otra, elija cuál es su categoría madre."
      },
      {
        ancla: "lista-fila",
        titulo: "Cada una con su foto",
        texto:
          "La foto de la categoría es la que sale en el inicio y en el catálogo. Conviene que se parezca a lo que hay adentro."
      },
      {
        ancla: "lista-acciones",
        titulo: "Antes de eliminar",
        texto:
          "Revise que no queden productos adentro: si elimina la categoría, esos productos quedan sueltos en el catálogo."
      }
    ]
  },

  brands: {
    titulo: "Marcas",
    pasos: [
      {
        ancla: "lista-panel",
        titulo: "Las marcas que vende",
        texto:
          "Registre aquí las marcas para poder asignarlas al crear un producto. Es lo que el cliente ve como fabricante."
      },
      {
        ancla: "lista-crear",
        titulo: "Agregar una marca",
        texto:
          "Con el nombre basta. Los productos de la casa no llevan marca: se marcan con la casilla Línea propia G&V System dentro del producto."
      },
      {
        ancla: "lista-fila",
        titulo: "La línea propia es aparte",
        texto:
          "Los productos G&V System no llevan marca registrada: se marcan con la casilla Línea propia dentro del producto."
      },
      {
        ancla: "lista-acciones",
        titulo: "Editar o eliminar",
        texto:
          "Al eliminar una marca, los productos que la tenían quedan sin marca, pero siguen publicados."
      }
    ]
  },

  gallery: {
    titulo: "Galería de trabajos",
    pasos: [
      {
        ancla: "lista-panel",
        titulo: "Los trabajos del taller",
        texto:
          "Estas fotos arman la página de Galería. Son sus trabajos reales: es lo que más convence al cliente que todavía duda."
      },
      {
        ancla: "lista-crear",
        titulo: "Subir una foto",
        texto:
          "Al subirla elige si es vertical, cuadrada u horizontal: eso decide el recorte y cómo se acomoda en el mosaico. El orden manda cuál va primero."
      },
      {
        ancla: "lista-fila",
        titulo: "La forma de la foto",
        texto:
          "Al subirla elige si es vertical, cuadrada u horizontal. Eso decide el recorte y cómo se acomoda en el mosaico."
      },
      {
        ancla: "lista-acciones",
        titulo: "Orden y limpieza",
        texto:
          "Ponga adelante sus mejores trabajos y elimine los que ya no representen lo que hace hoy."
      }
    ]
  },

  requests: {
    titulo: "Solicitudes de clientes",
    pasos: [
      {
        ancla: "lista-panel",
        titulo: "Su base de clientes",
        texto:
          "Cada vez que alguien llena el formulario del sitio o pide una cotización rápida, queda guardado aquí con su vehículo y lo que busca."
      },
      {
        ancla: "lista-acciones",
        titulo: "Responder por WhatsApp",
        texto:
          "Desde la ficha de la solicitud le escribe al cliente con el mensaje ya armado, sin copiar el número a mano."
      }
    ]
  }
};
