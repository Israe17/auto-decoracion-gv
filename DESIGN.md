# DESIGN.md — Sistema de diseño Auto Decoración G&V

Esquema de 9 secciones (estándar Open Design / awesome-claude-design).
Todo cambio visual del sitio debe respetar este documento. Los tokens
viven en `src/app/globals.css` (`:root`); si un valor cambia, actualizar
ambos archivos.

**Referencia visual de la marca**: superficies claras y aireadas, canvas
neutro plano, tarjetas blancas y componentes elevados que repiten el lenguaje
del nodo del timeline: degradado cálido, radio generoso, icono blanco y sombra
de color suave. Las fotos siguen siendo protagonistas; la profundidad se
concentra en acciones y labels.

## 1. Color

Tokens:

| Token | Valor | Uso |
|---|---|---|
| `--red` | `#e62135` | Acción primaria, acentos, iconos de marca |
| `--red-dark` | `#b91527` | Precios, hovers de enlaces, texto sobre amarillo claro |
| `--yellow` | `#ffc72c` | Badges de oferta, acentos sobre fondos oscuros/rojos, hover de CTA invertido |
| `--ink` | `#11151c` | Texto principal |
| `--muted` | `#697383` | Texto secundario |
| `--muted-fuerte` | `#626c7c` | Texto pequeño sobre `--soft` (etiquetas sutiles). `--muted` ahí da 4.42:1 y no llega al mínimo 4.5:1; este da 4.89:1 |
| `--line` | `#e2e7ee` | Bordes y separadores |
| `--soft` | `#f3f6f9` | Fondos suaves de tarjetas internas |
| `--surface` / `--surface-strong` | `#fff` / `#f8fafc` | Superficies de tarjetas |
| `--green` | `#0a9f73` | SOLO estados positivos (disponible, checks) |
| WhatsApp | `#25d366` | SOLO el botón flotante de WhatsApp |

Reglas:
- **Degradado cálido de marca** (rojo → naranja,
  `linear-gradient(135deg, var(--red), #ff6b42)`, a juego con el logo): es
  la norma de los acentos de ACCIÓN y de los LABELS — **botones primarios**
  (`button--primary`, `quote-link`; hover profundiza a
  `--red-dark → #ff5a2c`), etiquetas de categoría/marca, insignias,
  chips activos (banco de etiquetas), estados
  hover/activo de flechas, puntos de carrusel, controles del admin y el
  **título del acordeón de categorías** junto al slider de promociones.
  Los estados verdes usan `var(--green) → #0bbf88`, los ámbar
  `#ffc72c → #ff9e2c` y los neutros gris medio → gris oscuro. Cada variante
  lleva sombra suave del mismo color. NO usar degradados oscuros (negro → rojo) en
  botones: probado y descartado por el dueño. La franja del topbar mantiene
  su degradado propio (negro → rojo) como banda informativa, y la bandeja de
  cotización sigue plana. La **banda CTA** (`.cta-band`) sí lleva el degradado
  cálido: era el único rojo plano y desentonaba.
- Canvas neutro plano (`--bg #f6f7f8`), sin tintes ni degradados de fondo.
- Fondos siempre claros. **Prohibido** introducir bloques grandes oscuros
  (charcoal/negro); los únicos oscuros permitidos son el carrusel de
  promociones (foto con sombreado), el footer y la bandeja flotante de
  cotización (`--ink`, decisión del dueño), y la escena oscura del logo
  (`CompatHero`, restaurada a pedido del dueño).
- El rojo es el único color de acción primaria; no competirlo con otros
  botones llamativos en la misma vista.
- Amarillo cálido (`#fff8e5 → #ffefc4`) para tarjetas de consejo/apoyo.

## 2. Typography

- Familia: pila del sistema moderna (`Inter, ui-sans-serif, system-ui,
  -apple-system, "Segoe UI", Arial, sans-serif`), sin webfonts. Se declara
  **UNA sola vez** en el `body` base de `globals.css`; prohibido volver a
  declarar `font-family` en otra regla.
- **Pesos SOLO por tokens** (prohibido hardcodear números):
  `--font-regular` 400 (cuerpo), `--font-medium` 500 (meta/chips),
  `--font-semibold` 600 (botones, enlaces, etiquetas), `--font-bold` 700
  (títulos h3/h2 internos), `--font-heavy` 800 (titulares display de la
  portada, números fantasma del timeline).
- Tamaños por tokens `--type-xs…--type-3xl`; H1 de ficha/página
  `clamp(30px, 3vw, 42px)`; titulares display de portada
  `clamp(32px, 4.4vw, 54px)` (centrado) / `clamp(28px, 3.2vw, 42px)`
  (variante lateral).
- **Identidad de los titulares**: la palabra acentuada va en `<em>`
  **cursiva**. En los `h2` de sección lleva además una **barra de 6px del
  degradado cálido** debajo (`linear-gradient(90deg, var(--red), #ff6b42)`).
  El titular del hero (`.hero-cta__title`) comparte la cursiva y va con las
  palabras **rellenas con ese degradado** (`background-clip: text`, el de los
  botones — el rojo oscuro plano se descartó), pero **SIN la barra: el dueño
  la rechazó ahí** (ocupa dos líneas completas y pesa de más). No volver a
  ponerla. El hero tampoco lleva píldora/eyebrow arriba del titular: el
  dueño la quitó, arranca directo con el título.
- Eyebrow/píldoras: 12px, `--font-semibold`, uppercase con letter-spacing.
  **Sobre foto oscura** (`.hero .eyebrow`, `.page-hero .eyebrow`) van en
  **píldora de vidrio**: fondo `rgba(17,21,28,.34)` + `backdrop-filter: blur`,
  borde `rgba(255,255,255,.2)`, brillo interior, sombra suave, texto en
  `--yellow` y un **punto amarillo** al inicio (eco del topbar). Antes eran un
  gris lavado que se confundía con la foto. Trampa: escribir
  `backdrop-filter` Y `-webkit-backdrop-filter` juntos hace que el compilador
  se quede SOLO con el prefijado y Chromium pierde el desenfoque — declarar
  únicamente el estándar.
- Cuerpo: 15-17px, `line-height: 1.55`, color `--muted` para descripciones.
  Cursiva SOLO en las descripciones del timeline y los énfasis `em` de los
  titulares display.
- Español correcto con tildes en textos visibles ("díganos", nunca "dígnos").

## 3. Spacing

- Padding de tarjetas: 22-30px según jerarquía; el aire es parte del estilo.
- Gaps internos: 14-20px; listas compactas 10-12px.
- Radios: **botones píldora 999px**; controles tipo chip 999px; labels
  informativos 9-11px; tarjetas 20-28px; inputs 12px.
- Sombras SIEMPRE suaves y difusas (tokens `--shadow-sm/md/lg`); nunca
  sombras duras u oscuras.
- Para tarjetas de **foto oscura sobre fondo claro** (las de categoría) los
  tokens sueltos se pierden y la tarjeta se ve pegada al fondo: usar
  `--shadow-card` / `--shadow-card-hover`, que son elevaciones en tres
  capas (contacto corto + media + ambiente largo). Siguen siendo suaves —
  la profundidad viene de superponer capas, NO de subir la opacidad.
- Ritmo vertical por secciones `.section` / `.section--tight`.

## 4. Layout

- Contenedor: `--max: 1200px` centrado.
- Grids con proporciones intencionales (1fr 1fr, 1.4fr 1fr) — nunca anchos
  arbitrarios que dejen tarjetas desparejas.
- Breakpoints: 980px (2→1 columnas en detalle), 720px (admin/listas), 900px
  (contacto/servicios).
- Elementos flotantes: WhatsApp `bottom: 20px; right: 20px; z-index 40`;
  bandeja de cotización encima (`bottom: 92px`, z-30); modales z-80; menú
  móvil z-90.

Móvil (iPhone-first):
- Todo elemento fijo inferior suma `env(safe-area-inset-bottom)` (home
  indicator); el viewport se declara con `viewportFit: "cover"` en
  `layout.tsx`.
- Inputs/select/textarea SIEMPRE ≥16px (evita el auto-zoom de iOS Safari).
- Tap targets ≥44px; feedback táctil con `.button:active { scale(0.97) }`.
- Navegación móvil: menú **overlay de pantalla completa** (`MobileMenu`,
  por portal al body): se despliega con un círculo desde el botón
  (clip-path + GSAP), enlaces grandes numerados en cascada, buscador
  arriba y WhatsApp + horario abajo; la salida es la reversa acelerada
  (timeScale 1.8). Cierra con X, Escape o al navegar. El header móvil es
  UNA fila (logo + CTA + hamburguesa).
- Categorías en móvil: **marquee de píldoras de vidrio** (`.category-marquee`,
  estilo Logo Loop) que flotan sobre el espacio superior de la foto del
  hero; píldoras translúcidas (`rgba(255,255,255,.12)` +
  `backdrop-filter: blur`, texto blanco), bordes desvanecidos con máscara,
  un toque directo a la categoría. Es un scroll real: el usuario las
  desliza a mano y en reposo avanzan solas despacio (auto-scroll por JS);
  se pausan al tocar. Con reduced-motion quedan estáticas pero scrolleables.
  La lista se duplica en el JSX (2ª copia `aria-hidden`) para un ciclo sin
  costura. El acordeón de categorías es solo de escritorio.
- En listados con filtros, el producto va primero y los filtros después.
- **Buscador del catálogo** (`.catalog-search`, dentro de `.catalog-toolbar`):
  mismos tokens que el del header — superficie blanca, borde `--line`, radio
  de píldora, lupa en `--red` y foco con borde/sombra rojos. Filtra en vivo y
  deja la búsqueda en la URL. En móvil ocupa el ancho completo de la barra y
  va PRIMERO (antes del conteo), porque ahí los filtros quedan debajo de la
  rejilla; la barra necesita `grid-template-columns: minmax(0, 1fr)` o la
  columna se encoge al contenido.

## 5. Components

- `button--primary` (y `quote-link` del header): **degradado cálido
  rojo → naranja** (`var(--red) → #ff6b42`), texto blanco. Un solo primario
  por bloque, siempre ANTES que el secundario. Lleva **sombra roja elevada**
  que crece al hover con `translateY(-2px)` (el hover profundiza a
  `--red-dark → #ff5a2c`), y un **destello diagonal que barre UNA vez al
  pasar el mouse** (keyframe `btn-shine`, nunca infinito; se apaga en touch
  y reduced-motion).
- **CTA invertido sobre rojo** (`.cta-band .button--primary`): superficie
  blanca, texto e icono en `--red` (el icono SIEMPRE `currentColor`), hover al
  degradado ámbar `#ffc72c → #ff9e2c` con texto oscuro. Ojo con las reglas de
  icono a nivel de bloque (`.cta-band svg`): si no se acotan al icono propio
  del bloque (`> svg`) pintan también la flecha del botón y sale un amarillo
  fuera de lugar.
- `button--secondary`: blanco con borde `--line`; hover borde/texto rojo.
- `button--ghost`: solo sobre fotos/fondos oscuros.
- Tarjetas: superficie blanca, borde suave, sombra `--shadow-sm/md`; su cuerpo
  se ajusta al contenido y nunca usa espacios flexibles que separen el título
  del precio o las acciones.
- **Sistema de labels elevado**: comparte con los botones el degradado, radio
  redondeado y sombra de color. Tipografía de 10-11px, `--font-semibold`,
  uppercase y tracking moderado. Prohibido mezclar labels planos con otros
  elevados dentro del mismo contexto, o introducir puntas/`clip-path`.
  1. **Categoría y marca**: degradado cálido rojo → coral, texto/icono
     blanco, radio 9-11px y sombra roja suave. **Excepción del dueño**: en
     la tarjeta de producto y en las etiquetas del panel de compatibilidad
     NO — ahí van sutiles (ver "Etiqueta sutil"), porque cinco pastillas
     rojas con sombra dentro de un bloque informativo se ven cargadas.
  2. **Promoción y estado sobre foto**: labels flotantes redondeados en las
     esquinas. Destacado usa marca, oferta ámbar, disponible verde, bajo
     pedido ámbar y agotado gris; todos comparten altura y profundidad.
  3. **Estado dentro de contenido**: el mismo componente elevado con icono y
     variante semántica; no se cambia a una píldora plana.
  4. **Encabezado de sección (excepción aprobada)**: conserva el overline sin
     caja — raya roja corta + texto uppercase— porque el dueño lo aprobó
     expresamente. No convertirlo en label elevado.
  Los chips que son **controles** (banco de etiquetas y selector de vehículo)
  sí conservan la forma pill 999px para distinguir interacción de información;
  al hover suben `-1px` y el estado activo usa degradado rojo con sombra de
  color (`rgba(230,33,53,.32)`).
- **Vitrina de línea propia** (portada, `.own-brand-showcase`, referencia
  del dueño estilo tienda de accesorios): **panel promocional** con el
  degradado cálido a la izquierda — eyebrow píldora, titular corto, una
  línea de texto, **CTA blanco** y **sello circular punteado** — junto a
  un **carril horizontal** de tarjetas de la línea (hasta 8, scroll con
  snap). El panel anuncia SOLO ofertas de productos de la marca: con un
  producto de línea propia rebajado muestra su nombre, antes/ahora/ahorro
  y el sello con el **porcentaje real calculado** (−N%), enlazando a la
  ficha; sin oferta vigente, mensaje de marca y sello "Desde 2008".
  PROHIBIDO inventar cifras de descuento. Sin fila de "por qué comprar"
  (decisión del dueño: no re-duplicar confianza). En móvil, panel arriba
  y carril debajo.
- **Carril de productos** (`.product-rail`, en Línea propia y Destacados):
  scroll horizontal real con `scroll-snap`, tarjetas de ~250-270px,
  scrollbar fina que se tiñe de rojo al hover. Se desliza en touch y con
  rueda/arrastre en escritorio.
- **Etiquetas de la tarjeta de producto** (decisión del dueño: la tarjeta
  se veía cargada). La tarjeta es la EXCEPCIÓN al sistema de labels
  elevado de arriba, que sigue vigente en la ficha, el admin y el resto
  del sitio. Regla, de arriba abajo:
  1. **Sobre la foto, como mucho UN distintivo llamativo** (`badge`): label
     flotante redondeado con icono y sombra de color — "Oferta" (ámbar,
     gana si hay las dos) o "Destacado" (degradado de marca). Reservado
     para eso: nada de categoría, marca ni disponibilidad ahí.
  2. **Bajo la foto, como mucho UNA etiqueta descriptiva**
     (`.product-card__etiqueta`): fondo `--soft`, borde `--line` de 1px,
     radio 8px, 10-11px, `--font-medium`, **sin degradado, sin sombra y
     sin mayúsculas forzadas**; se recorta con puntos suspensivos y lleva
     el texto completo en `title`. Sale UNA sola, por orden de
     importancia: `Complemento` → categoría → marca. La categoría se
     omite (`ocultarCategoria`) cuando ya la dice el título de la sección
     o el filtro activo: página de categoría, y catálogo filtrado a una
     categoría **hoja** (con una madre NO, porque ahí los resultados
     vienen de varias hijas y la etiqueta es lo que las distingue). La
     fila reserva `min-height` aunque no haya etiqueta, o en una misma
     rejilla unas tarjetas arrancarían el nombre 22px más arriba.
  3. **Disponibilidad**, junto al precio: el indicador `.estado-punto`
     (ver abajo). Va en la fila del precio y no en la de la etiqueta
     porque en la tarjeta de móvil (~172px) las dos cosas no caben en un
     renglón y el nombre de la categoría salía cortado.
  4. Ritmo del cuerpo: etiqueta y nombre pegados (gap 7-9px), el precio y
     los botones despegados con margen propio.
- **Etiqueta sutil** (decisión del dueño): fondo `--soft`, borde `--line`
  de 1px, radio 8px, 10-12px, `--font-medium`, texto `--muted-fuerte`,
  **sin degradado, sin sombra, sin mayúsculas forzadas y sin hover** (no
  son botones). Es el lenguaje de la información que acompaña, frente a
  los labels elevados, que quedan para lo que interrumpe (oferta,
  destacado). Se usa en la etiqueta de la tarjeta de producto
  (`.product-card__etiqueta`) y en las etiquetas del panel de
  compatibilidad de la ficha (`.product-tags span`). El color del texto es
  `--muted-fuerte` y no `--muted` por contraste: ver la tabla de color.
- **Indicador de disponibilidad** (`.estado-punto`, decisión del dueño):
  punto de color de 6-7px + texto en capitalización normal, **sin fondo y
  sin sombra** — verde `--green` disponible, ámbar bajo pedido, gris
  agotado. "Agotado" es el único que se escribe en `--ink` y
  `--font-semibold`: es el que cambia la decisión de compra. Sustituye al
  label verde macizo en LOS DOS lugares donde se muestra el estado, la
  tarjeta y la ficha del producto (`.product-info__estado`, 13px para
  convivir con los labels de categoría y marca de esa fila). El texto y el
  tono salen de `estadoDelProducto()` en `src/lib/catalog.ts`, no de cada
  componente, para que digan siempre lo mismo.
- **Dashboard del admin** (`.admin-stats` + `.admin-dash`): fila de KPIs
  con ícono rojo y rejilla `auto-fit` (nunca dejar tarjetas huérfanas en
  una fila sola), y debajo tres paneles: **Requiere atención** (avisos
  calculados de datos reales — sin foto, precio vacío, oferta sin
  descuento, destacados vencidos, agotados; cada fila lleva a la pestaña
  donde se arregla y si no hay nada muestra un mensaje en verde),
  **Accesos rápidos** y **Catálogo por categoría** (barras con el
  degradado de marca). PROHIBIDO inventar métricas: si el dato no existe
  en el catálogo, no se muestra.
- **Editor de encuadre de imágenes del admin** (`EncuadreImagen.tsx`,
  compartido por `ImageUploadField` e `ImageListField`): el dropzone
  anuncia la medida del recuadro ANTES de elegir la foto; al elegirla se
  muestra dentro de un marco con la proporción REAL del sitio (promos
  1600×720, categorías 1200×720, marcas 600×600, productos 1100×1000 —
  el `aspect-ratio: 1.1` de la tarjeta) y se arrastra para acomodarla.
  Al confirmar hay **dos caminos**, y no da igual cuál:
  - **Fotos de producto** (`ImageListField`, decisión del dueño): la foto
    se sube **ENTERA, sin recortar**, y el encuadre se guarda aparte en
    `Product.imageFocus` — un mapa `URL → "50% 30%"` que el sitio aplica
    con `object-position` (helper `encuadreDe` en `catalog.ts`). Así se
    puede **reacomodar cuando se quiera** sin volver a subir nada, que era
    justo lo que no se podía con el recorte. Va con la URL como llave y no
    por posición, para que reordenar o quitar fotos no descuadre el resto.
    Si el archivo no cabe en el bucket (8 MB) se reduce de tamaño
    conservando el cuadro completo — reducir no es recortar.
  - **Campos de UNA sola imagen** (categorías, promos, marcas, galería):
    ahí sí se sigue recortando en canvas con la misma matemática que
    `object-position`, porque el recuadro es fijo y no hace falta poder
    reacomodarla después.

  Varias fotos se encuadran una por una en cola ("Foto 2 de 5").
  Avisos: "calza exacto" y "más pequeña que lo recomendado".
  **Miniaturas**: la portada se marca con anillo rojo y su sello, y se
  cambia con la estrella (antes había que ir moviéndola de puesto con
  flechas). Cada miniatura lleva tres acciones — portada, acomodar,
  quitar — en botones cuadrados de 30px dentro de una celda de 118px: con
  las pastillas de texto anteriores en 84px **no cabían, se salían del
  recuadro y la rejilla se comía el clic**. En táctil las acciones van
  siempre visibles, porque sin hover no habría forma de llegar a ellas.
  En productos el marco va **vestido con el card real** (mismas clases de
  `ProductCard`, sin enlaces): categoría, nombre y precio leídos EN VIVO
  del propio formulario, así el dueño acomoda la foto viendo la tarjeta
  tal como saldrá en la tienda.
- **Cotización rápida** (`QuoteDialog`, montado UNA vez en `layout.tsx`):
  todo botón "Cotizar" del sitio (tarjeta, ficha o bandeja) abre este
  diálogo por evento (`pedirCotizacion` en `src/lib/cotizar.ts`) en vez de
  saltar directo a WhatsApp. Pide nombre (obligatorio), teléfono
  (opcional) y vehículo con los mismos selectores del catálogo. Al enviar:
  guarda al cliente en su navegador (`src/lib/cliente.ts` +
  `src/lib/vehiculo.ts`), registra la solicitud en la base de clientes
  (`saveContactRequest`, visible en la pestaña Solicitudes del admin) y
  abre WhatsApp con el mensaje completo. **La segunda vez abre en modo
  confirmar** — resumen de dos líneas + "Cambiar mis datos" — para que
  cotizar sea un solo toque. Diálogo por portal, cierra con Escape o
  toque afuera; en móvil es hoja inferior a ancho completo con
  `env(safe-area-inset-bottom)` e inputs de 16px.
- **Confirmación de los CRUD del admin** (`AdminSuccessDialog`): al guardar
  o eliminar, modal CENTRADO sobre fondo velado con check verde que se
  dibuja, "Cambio guardado" y el detalle ("Producto actualizado."). Se
  cierra **solo a los 2 s** (barra de progreso a la vista) o antes con un
  toque/Escape — pensado para cargar varios productos seguidos. Sustituye
  al aviso de esquina, que el dueño descartó. Nunca se muestra antes de
  que la base confirme la escritura.
- **Galería de trabajos** (`/galeria`, `GalleryMasonry`): mosaico tipo Masonry
  portado de React Bits (variante JS+CSS) y adaptado — clases propias
  (`.galeria-mosaico`, `.galeria-pieza`; las del original, `.list` /
  `.item-wrapper`, chocarían con el resto del CSS), **alturas por proporción**
  y no por píxeles fijos, `next/image` con `fill` + `sizes` (fotos pesadas del
  taller optimizadas) y sin animación con `prefers-reduced-motion`. Las piezas
  se posicionan con GSAP; el CSS solo las viste (radio, `--shadow-card`,
  pie con degradado). El dueño elige la **forma** al subir (vertical /
  cuadrada / horizontal): esa forma define el recuadro del recorte en el admin
  Y la altura de la pieza en el mosaico, así la galería queda pareja sin
  pedirle medidas.
- Banco de etiquetas del admin: opciones agrupadas en chips seleccionables,
  selección activa roja y área separada para las etiquetas elegidas; permite
  crear etiquetas propias sin sustituir las sugerencias del negocio.
- **Detalle del admin** (`AdminDetailDialog`): el estado es una **pila** —
  navegar a una relación apila y el botón "Volver" del header (flecha,
  misma caja que la X) regresa al detalle anterior; editar limpia la pila.
  En producto: precio héroe (`del` + actual en `--red-dark`), chip de
  estado con la variante semántica del sistema de labels
  (`--available`/`--on_request`/`--sold_out`), etiquetas como chips
  pequeños, y bloque "Oferta y vitrina" (ahorro, estado del destacado con
  fechas, prioridad) SOLO cuando hay datos reales — nada duplicado con el
  hero. Acciones: Editar (primario) / **Compartir por WhatsApp**
  (`productShareWhatsAppUrl` en `whatsapp.ts`: `wa.me/?text=` SIN número —
  el dueño elige el contacto; distinto de cotizar, que escribe AL negocio)
  / Ver en el sitio (`/productos/slug`, pestaña nueva) / Cerrar; en móvil
  rejilla 2×2 sticky. Los modelos compatibles muestran el rango DECLARADO
  por el producto, no el rango genérico del catálogo.
  La rama "Solicitud de cliente" usa el hero de ícono, muestra teléfono /
  vehículo / mensaje completo y su primario es **Responder por WhatsApp**
  (`clientWhatsAppUrl`: escribe AL CLIENTE, prefijo 506 a números de 8
  dígitos).
  Trampa pagada dos veces: `.admin-detail` NO puede ser grid — como fila
  de grid, la altura intrínseca del hero (grid anidado con foto a
  `height: 100%`) se mide mal en Chromium y el hero queda clavado en su
  `min-height` recortando el contenido. La receta que funciona: columna
  **flex** con `flex-shrink: 0` en los hijos + `height: fit-content` en el
  hero.
- **Galería de la ficha** (`ProductPhotos`): una pista deslizable con
  `scroll-snap` y, en escritorio, una tira de miniaturas de control.
  Encima de eso, tres cosas que hay que respetar si se toca:
  1. **Zoom que sigue al cursor**: la foto amplía a `scale(1.8)` al pasar
     el mouse y el `transform-origin` se mueve con el puntero (el
     componente escribe `--zx`/`--zy`; el origen **no** se transiciona, o
     el zoom iría con retraso). Solo con
     `@media (hover: hover) and (pointer: fine)` — en táctil no hay hover
     y el zoom se quedaría pegado. Trampa: `.product-gallery:hover img`
     lleva un `scale(1.04)` heredado que vive más abajo en el archivo, así
     que las reglas del zoom cuelgan de `.product-gallery` para ganarle
     por especificidad.
  2. **La foto se abre a pantalla completa** al tocarla (`.visor`, por
     portal al body, z-85): fondo velado, `object-fit: contain` para verla
     entera, flechas, contador, y cierre con la X, con Escape o tocando el
     fondo. Las flechas del teclado pasan de foto. Al cerrar, la pista se
     queda en la foto que se estaba viendo. Un arrastre **no** abre el
     visor: se compara el punto del `pointerdown` con el del `click`, o
     pasar de foto en el celular lo abriría.
  3. **La tira de miniaturas se desliza** con flechas a los lados (se
     apagan en los extremos) o con la rueda del mouse. La rueda necesita
     un listener nativo con `passive: false` — React registra `wheel` como
     pasivo y desde `onWheel` el `preventDefault` no hace nada — y la tira
     lleva `data-lenis-prevent`, porque Lenis escucha la rueda en `window`
     y si no la página baja a la vez. Cuando la tira llega al tope el
     gesto se deja pasar a propósito, para que el sitio no se sienta
     trabado. Ojo: el `display: none` de móvil tiene que ir **después**
     del `display: flex` de la tira; las media queries no suman
     especificidad.
- Ficha de producto: **precio héroe sin cajón** junto al tachado y al label
  verde elevado "Ahorra ₡X"; badge de descuento "−N%" sobre la foto;
  acciones lado a lado 1.5:1 (primario dominante); categoría/marca como
  labels de marca, **disponibilidad como `.estado-punto`** (ya no como
  label verde macizo) y meta-información en piezas blancas con icono
  degradado, radio y sombra coordinados.
- **Tipografía del precio de la ficha** (decisión del dueño: el precio
  desentonaba con el resto de la tarjeta). Iba a 34px, `--font-bold` y
  `--red-dark`: el mismo peso visual que el nombre (37px, bold) justo
  encima, y otro rojo encima del botón de cotizar — nada lideraba. Regla:
  1. **Color `--ink`**, no rojo: el rojo se guarda para la acción
     (§1: "no competirlo con otros botones llamativos en la misma vista").
     El tachado sigue en `--muted` y el ahorro en el label verde.
  2. **Baja un escalón respecto al nombre**: `clamp(24px, 2vw, 29px)` en
     `--font-bold`, con `font-variant-numeric: tabular-nums` para que las
     cifras queden a plomo.
  3. **"Consultar precio" es una frase, no una cifra**
     (`.product-price-hero__consulta`): `clamp(18px, 1.5vw, 21px)`,
     `--font-semibold` y **tracking 0** — el `-0.02em` de los números
     aprieta las letras.
  4. **Posición**: el precio va pegado al nombre, ANTES de la descripción
     (nombre → precio → nota del precio → descripción → botones). Antes la
     descripción se metía en medio y el precio terminaba pegado al botón,
     dos rojos seguidos.
  5. **Ritmo intencionado, no parejo**: la rejilla da 14px a todos los
     huecos y así el nombre y el precio se leían como un solo bloque. El
     precio se despega (20px) y la nota se queda pegada al precio (4px),
     que es a lo que se refiere.
- **Complementos** (extras que se venden aparte pero acompañan a otro
  producto): el HIJO guarda `parentProductId` + `parentProductName`
  (denormalizado como `categoryName`/`brandName`, para que la tarjeta pinte
  su etiqueta sin recorrer el catálogo). Relación de **un solo nivel** —
  helpers `complementsOf`, `puedeTenerComplementos` y `puedeSerComplemento`
  en `src/lib/catalog.ts`; el admin bloquea el campo en cuanto el producto
  tiene extras propios. En el sitio: sección `Complementos / "Complete su
  equipo."` con `.product-grid` en la ficha del principal, enlace
  `.product-info__padre` de vuelta en la del complemento, y la etiqueta
  `Complemento` en la tarjeta, que es la de MAYOR prioridad de la única
  etiqueta descriptiva (ver "Etiquetas de la tarjeta de producto"): ser el
  extra de otro producto cambia cómo se lee el producto entero. El principal y sus
  complementos se excluyen de "Productos relacionados": ya tienen su lugar
  en la página (anti-patrón #3). Borrar el principal NO borra los extras;
  solo los suelta.
- Bloques relacionados se unifican en paneles con divisores internos, no
  tarjetas sueltas de alturas dispares.
- **Encabezados de sección de la portada** (`.section-head`): **overline
  editorial sin caja** (línea roja corta + uppercase con tracking) y **titular
  fuerte** con la palabra final en **cursiva subrayada con el degradado de
  marca** (`em::after`). SOLO el timeline del taller va **centrado**
  (decisión del dueño); las demás secciones usan la variante
  **`.section-head--left`**: título a la izquierda (clamp 28-42px) y el
  enlace de la sección como text-link a la derecha, en la posición del
  `section__header` clásico (que sigue vigente en páginas internas).
- **Línea de tiempo del taller** (portada, `#servicios`,
  `WorkshopTimeline` / `.wtl`, adaptación propia del Industrial Vertical
  Timeline de Lightswind): UNA sola sección para beneficios + servicios
  (decisión del dueño: menos carga por pantalla). Encabezado **centrado**
  (`.section-head`: overline con línea corta + uppercase), titular grande con
  la palabra final en **cursiva subrayada con el degradado de marca** y 3
  frases de confianza. Debajo, espina central que se **llena con el
  degradado al scrollear**; cada paso lleva **número fantasma** grande
  (gris claro), **nodo cuadrado redondeado** que hace *pop*
  (`back.out`) **exactamente cuando la espina de progreso lo alcanza**
  (umbrales por posición del nodo en el onUpdate del scrub, uno por uno
  al ritmo del scroll) y contenido SIN caja (título fuerte, descripción
  en cursiva tenue, text-link a WhatsApp) que **entra deslizándose desde
  su lado**; alternado en escritorio, columna con
  espina a la izquierda y número pequeño en móvil. Cierra con UN primario
  "Cotizar por WhatsApp". Prohibido volver a duplicar beneficios y
  servicios como tarjetas separadas.
- **Cierre de conversión** (`HeroShell` / `.hero-cta`, réplica de la
  sección de conversión centrada de Estética Dalay; por decisión del dueño
  va como **ÚLTIMO elemento de la portada, después de la banda CTA** — el
  remate final antes del footer): **tarjeta glass centrada** (blur 14, radio 30) sobre un **aura
  roja tenue con textura de puntos**; dentro: badge píldora con rayo,
  titular (h2) con la frase final en `--red-dark`, **prueba social real
  con count-up** (años desde 2008 + productos y líneas del catálogo —
  NUNCA inventar cifras), subtítulo, CTA primario dominante (min-height
  58, glow rojo detrás) + secundario, y **chips de contacto reales** de
  `business.ts` (Maps, horario, Instagram) sobre un hairline. Reveal
  escalonado fail-safe (`data-reveal` + `--d`; sin JS o reduced-motion
  todo visible). La portada ABRE con el carrusel de promociones +
  acordeón (su titular es el h1); el buscador por vehículo vive en la
  escena del logo (`CompatHero`), entre Línea propia y Destacados.
- Carrusel de promociones (debajo del hero): foto horizontal a todo lo
  ancho (`cover`) con un degradado oscuro a la izquierda y el texto encima
  — eyebrow, titular grande, subtítulo y UN solo botón (el primario rojo
  con el CTA de la promo; el de WhatsApp se quitó a pedido del dueño — el
  flotante ya cubre esa acción). Donde iba el eyebrow de texto va el
  **pulso de avance**: tres flechas amarillas que se encienden en
  secuencia, como señal de giro secuencial (el dueño pidió una animación
  amarilla en vez de la marca escrita; el brillo sobre texto se probó
  primero y lo descartó). Animación infinita como excepción del dueño;
  con reduced-motion quedan encendidas estáticas y es `aria-hidden`
  (decoración, no contenido). Flechas y puntos van en el mismo vidrio
  translúcido que usaba ese botón (`rgba(255,255,255,.12)` + blur y borde
  claro): son controles de la escena, no parches blancos sobre la foto.
  El hover de la flecha conserva el degradado cálido. Toma las promociones de
  admin > Promociones; sin promociones activas cae a las líneas de
  catálogo. Fotos horizontales ambientales (taller/vehículos/servicios),
  NUNCA los afiches cuadrados de producto. Fotos de ejemplo en
  `public/hero/`.
- Modales: SIEMPRE montados con `createPortal(…, document.body)`; backdrop
  `rgba(15,23,42,.48)` a viewport completo.

### Ficha de producto en móvil (patrón Airbnb)

En ≤640px la ficha abre con la **foto a sangre completa** (sin marco ni
radios), el volver flota encima en un círculo de vidrio y la **hoja de
contenido se monta sobre la foto** con esquinas redondeadas. La barra
fija inferior de precio se probó y **el dueño la descartó** — no volver
a proponerla; los flotantes de WhatsApp e Instagram quedan visibles como
en el resto del sitio. La galería es una pista `scroll-snap` con
contador "1/N"; en
escritorio conserva el marco redondeado y las miniaturas funcionan como
control (tocar una desplaza la pista).

OJO: `.product-detail-hero` tiene capas de CSS posteriores que también
lo estilan en 640px — al tocar la ficha móvil, buscar TODAS las reglas
(`grep "product-detail-hero {"`) o la capa de abajo pisa el layout.

### Guía del admin (recorrido paso a paso)

Cada módulo del panel tiene su recorrido: sale **solo la primera vez** que
se abre y queda el botón **Guía** del encabezado para repetirlo. Motor
propio (`src/components/admin/GuiaTour.tsx`), montado UNA vez en
`admin/page.tsx` y disparado por evento (`src/lib/guia.ts`, mismo patrón
que `cotizar.ts`). Reglas al tocarlo o al agregar un módulo nuevo:

- Los pasos viven en `RECORRIDOS` (`src/lib/guia.ts`), en español de
  "usted" y CON TILDES: es copy visible, no comentarios de código.
- Cada paso apunta a un `data-guia="…"` puesto **en el JSX**, no a clases
  de CSS. Las listas simples comparten `lista-panel`, `lista-crear`,
  `lista-fila` y `lista-acciones` porque comparten componente.
- Empiece el recorrido por un ancla que exista SIEMPRE (el panel), porque
  los pasos cuya ancla falta o mide 0 se saltan solos — un módulo vacío
  (marcas, galería, solicitudes recién estrenadas) se quedaría sin guía.
- Un recorrido sin ninguna ancla visible NO se marca como visto: debe
  poder salir después, cuando el módulo ya tenga contenido.
- El globo se coloca con su **alto real** (medido tras pintar) y se
  encierra dentro de la pantalla; con anclas más altas que la ventana
  calcularlo a ojo lo sacaba del viewport.
- El foco es un solo recuadro con `box-shadow: 0 0 0 9999px` — nada de
  capas apiladas ni `clip-path`.

## 6. Motion

- Motor de animación de scroll: **GSAP** vía `src/components/ScrollFx.tsx`
  (montado en el layout). Los reveals (0.7s `power2.out`), staggers (0.08s)
  y el pop del precio héroe se disparan con **IntersectionObserver**
  (rootMargin -12% ≈ "top 88%"), NO con posiciones de ScrollTrigger — así
  los cambios tardíos de layout (imágenes/datos) no dejan secciones
  ocultas. ScrollTrigger queda solo para efectos scrubbed (LogoSequence y
  la espina de la línea de tiempo del taller).
  Nuevas secciones/grillas se registran en los selectores de ese
  componente.
- La tarjeta de producto muestra la imagen **a sangre**, sin relleno ni marco
  blanco, en un contenedor cuadrado con `object-fit: cover`; las fotos deben
  sentirse protagonistas y pueden tener un zoom leve al hover. La galería de
  la ficha mantiene `object-fit: contain` para inspeccionar la imagen completa.
- **Scroll suave global** con Lenis (`src/components/SmoothScroll.tsx`),
  equivalente libre del ScrollSmoother de pago de GSAP. Integrado con
  ScrollTrigger (los reveals siguen funcionando), activo en escritorio y
  táctil (`syncTouch`), con soporte de anclas. CSS de Lenis en
  `globals.css`. Se desactiva con reduced-motion.
  **Trampa pagada**: con `syncTouch` Lenis escucha `touchmove` en `window`
  con `passive: false` y lo cancela en cuanto el gesto tiene componente
  vertical — cualquier scroller anidado (rieles de productos, miniaturas
  de la ficha, marquee de categorías) queda MUERTO en el celular. La cura
  es `allowNestedScroll: true` en la config (viene en `false` por
  defecto); no basta con `data-lenis-prevent`, que además apagaría el
  scroll suave dentro del bloque.
- Los carriles horizontales usan `scroll-snap-type: x proximity`, **nunca
  `mandatory`**: con padding lateral y `scroll-snap-align: start`, el punto
  de snap de la última tarjeta cae más allá del scroll máximo y el snap
  obligatorio devuelve al tope los arrastres de vuelta — el riel se siente
  trabado al llegar al final.
- `prefers-reduced-motion: reduce` desactiva todas las animaciones.
- Estados iniciales los pone GSAP (no CSS): sin JavaScript el contenido se
  ve completo.
- CSS keyframes (`fadeUp`) solo para micro-elementos (diálogos del admin,
  paneles del acordeón); los keyframes con `transform` deben terminar en
  `transform: none` (un transform retenido convierte al contenedor en
  containing block y rompe los `position: fixed` internos).
- Hovers: `translateY(-2px)` + sombra; transiciones 180ms ease.
- El **pulso rojo que respira** es la firma de los elementos de cotización:
  bandeja flotante, buscador enfocado y su desplegable de sugerencias
  (keyframes `softPulse`/`suggestGlow`, solo `box-shadow`). No usarlo en
  otros elementos.
- El desplegable de sugerencias es vidrio ligero: fondo blanco translúcido
  + `backdrop-filter: blur(16px)` + borde rojo transparente.
- **Hero del logo** (`CompatHero` + `LogoSequence`): escena oscura radial
  (excepción aprobada por el dueño, junto a carrusel/footer/bandeja) con el
  logo flotando (bob 2.6s), halo rojo que respira, brillos que derivan y
  **giro rotateY ligado al scroll** (scrub) tipo secuencia; el buscador por
  vehículo flota encima en vidrio. Vive entre Línea propia y Destacados.
  Respeta reduced-motion. (Se retiró brevemente con el hero claro y se
  RESTAURÓ a pedido del dueño.)
- El logo en alta resolución vive en `public/gv-system-logo.png` (256px,
  extraído del .ico).
- Efecto **glare** (destello diagonal que barre al pasar el mouse):
  pieza reutilizable — contenedor con `.glare-host` + `<span class="glare">`.
  Se usa en el panel del taller, banda CTA y hero. Solo `:hover`, se
  apaga en touch (`@media (hover: none)`) y con reduced-motion. No es
  animación infinita; es un barrido único por hover.
- Efecto **spotlight**: RETIRADO junto con la fila de beneficios (la
  portada compacta no lo usa; el CSS `.spotlight-*` queda inerte).
- Efecto **BlurText** (título que entra palabra por palabra desde arriba,
  desenfocado → nítido): componente `src/components/BlurText.tsx` —
  adaptación de React Bits a GSAP (sin la dependencia `motion`). Se usa en
  el título del hero y re-anima al cambiar de slide. Texto accesible
  (`aria-label`), respeta reduced-motion.
- Efecto **Sliding Cards** (mazo deslizable): componente
  `src/components/CategoryShowcase.tsx`. Se usa **solo en móvil**
  (`max-width: 640px`) para la sección de categorías: en escritorio queda
  la `.category-grid` de siempre y en móvil **todas** las categorías madre
  se apilan en un mazo que se arrastra con el dedo; la tarjeta de arriba
  se va al fondo y los puntos (`.sliding-cards__dot`) marcan la posición. La
  tarjeta conserva su estilo propio (`.category-card`), el degradado
  cálido de marca vive solo en el punto activo.
  Detalles que hay que respetar si se toca:
  - La tarjeta **entera es un enlace**, así que se arrastra desde
    cualquier punto y, tras un arrastre real, se traga el clic fantasma
    para no navegar sin querer.
  - El puntero se captura **solo al superar el umbral de arrastre**: si
    se capturara desde el `pointerdown`, el `click` se redirigiría al
    contenedor y un toque simple nunca abriría la categoría.
  - `dragstart` anulado y `-webkit-user-drag: none`, o el navegador
    arranca su arrastre nativo de enlace/imagen y mata el gesto con
    `pointercancel`.
  - La profundidad del apilado está topada en `DEPTH_MAX` tarjetas: el
    mazo lleva casi veinte categorías y sin el tope la pila se desborda
    más de cien píxeles por debajo del contenedor.
  - La elevación completa (`--shadow-card`) va solo en la tarjeta del
    frente (`.is-front`); las de atrás llevan una sombra mínima. Si las
    seis llevaran la elevación completa se suman una sobre otra y el borde
    inferior del mazo se convierte en una mancha.
- Efecto **marquee de categorías** (`.category-marquee`, estilo Logo Loop
  de React Bits): carril de píldoras de vidrio sobre el hero en móvil
  (excepción a "sin animaciones infinitas", aprobada por el dueño). Es un
  scroll horizontal **real** (`overflow-x: auto`): el usuario las desliza a
  mano y, en reposo, un auto-scroll lento (~21px/s, vía `scrollLeft` en
  `HomeShowcase`) las avanza; se pausa al tocar y reanuda al soltar. La
  lista se duplica en el JSX para un ciclo sin costura, tiene `padding`
  vertical para que la sombra no se corte, bordes desvanecidos con
  `mask-image` y se desactiva con reduced-motion. Es el único marquee.
- Fondo "Pixel Snow" (cuadritos del logo cayendo por toda la web):
  probado y **DESCARTADO por el dueño** — saturaba las secciones sin
  tarjetas (el texto convive directo con el canvas). NO reintroducir
  fondos animados de página completa.
- **Overlay de carga** (`LoadingOverlay`, adaptación propia a GSAP del de
  Estética Dalay): pantalla completa con el degradado cálido en dos
  mitades, marca en versalitas, **tres puntos que laten** y la etiqueta
  ("Verificando sesión"). Al terminar, una costura blanca crece en el
  centro y las dos mitades se abren hacia los lados revelando la app
  ("line reveal"). Va por **portal al body** y debe mantenerse SIEMPRE
  montado alternando `show` (si se desmonta, la salida no se ve). Los
  puntos son excepción aprobada a "sin animaciones infinitas" — solo
  viven mientras carga; con reduced-motion quedan quietos y la salida es
  un fundido.
- Nada de otras animaciones infinitas llamativas.

## 7. Voice

- Tono: profesional que vende — seguro, directo, sin jerga interna ni
  coloquialismos ("entra su carro, sale otro" ❌).
- Trato de "usted" (norma en Costa Rica).
- Hablar del beneficio del cliente, no de la operación de la tienda
  ("stock real" ❌ → "llévelo el mismo día" ✅).
- Botones de acción: fórmula verbo + objeto ("Cotizar polarizado",
  "Solicitar cotización", "Cotizar este producto").
- WhatsApp es el canal de cierre: cada bloque comercial termina en un CTA.

## 8. Brand

- Negocio: Auto Decoración G&V (G&V System), Liberia, Guanacaste.
- Local físico con inventario + pedidos a distribuidores de confianza +
  servicios de polarizado e instalación (audio/video, accesorios, 4x4).
- Categorías en 2 niveles: madre (sin `parent`) → subcategorías (`parent`
  = slug de la madre). Los productos viven en la subcategoría más
  específica. La categoría madre agrupa y muestra los productos de sus
  hijas (`categoryScope` en `src/lib/catalog.ts`). La madre lleva a
  `/categoria/[slug]` (grid de subcategorías); la subcategoría/plana lleva
  al catálogo filtrado. Utilidades: `topCategories`, `childCategories`,
  `categoryScope`, `findCategoryBySlug`.
- Datos del negocio centralizados en `src/lib/business.ts` (dirección,
  horario, enlaces de Maps) — nunca hardcodear en componentes.
- Mensajes de WhatsApp: helpers de `src/lib/whatsapp.ts` (no armar URLs a
  mano). **Formato único** de todos los mensajes: saludo, renglón en blanco,
  bloques con emoji de sección (🛒 producto · 🏷️ categoría · 🏭 marca ·
  💰 precio · 🔧 compatibilidad · 🚗 vehículo · 🔗 enlace a la ficha), con
  tildes correctas. Reglas que no se rompen:
  - El precio sale de `productHasPublicPrice` (`src/lib/catalog.ts`); sin
    precio público se escribe "a consultar" — **nunca ₡0**. En oferta va
    "₡X (antes ₡Y · ahorra ₡Z)".
  - El enlace usa `siteUrl` (`src/lib/seo.ts`), nunca `window.location`.
  - El **vehículo del cliente** se recuerda en `src/lib/vehiculo.ts`
    (localStorage `gv-vehiculo` + evento propio, mismo patrón que la
    bandeja de cotización): lo escriben el buscador por vehículo, los
    filtros del catálogo y el formulario de contacto, y lo leen todos los
    botones de WhatsApp que son client components. Sin vehículo guardado el
    mensaje deja las líneas "Marca: / Modelo: / Año:" para completar.
  - Un CTA de WhatsApp dentro de un server component no puede leer el
    vehículo: se envuelve en un componente cliente (ver
    `src/components/ProductQuoteLink.tsx`).
  - En el armador de mensajes (`texto()`), `null` descarta la línea y `""`
    es un renglón en blanco a propósito: filtrar con `Boolean` borra los
    separadores y el mensaje llega apelmazado.

## 9. Anti-patterns (prohibido)

1. Bloques grandes negros/charcoal como fondo de contenido.
2. Lenguaje interno de tienda en el copy ("stock real", "seed", "demo").
3. Información duplicada en la misma vista (ej. estado como chip Y como fila).
4. Botón secundario antes que el primario.
5. Tarjetas casi vacías que no justifican su espacio.
6. Grids con anchos arbitrarios o alturas forzadas que produzcan bloques vacíos.
7. Faltas de ortografía o imperativos inventados ("Dígnos").
8. Emojis en la interfaz.
9. URLs de WhatsApp armadas a mano fuera de `src/lib/whatsapp.ts`.
10. Modales renderizados dentro de secciones animadas sin portal.
11. Capas superpuestas (`::before` / `::after` con `inset: 0`) sobre un
    bloque redondeado sin `border-radius: inherit`: la capa es un
    rectángulo recto y sus esquinas se asoman por fuera del cuadro.
