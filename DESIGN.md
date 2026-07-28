# DESIGN.md — Sistema de diseño Auto Decoración G&V

Esquema de 9 secciones (estándar Open Design / awesome-claude-design).
Todo cambio visual del sitio debe respetar este documento. Los tokens
viven en `src/app/globals.css` (`:root`); si un valor cambia, actualizar
ambos archivos.

**Referencia visual de la marca**: estilo Dribbble minimal (tipo Ronas IT):
superficies claras y aireadas, canvas neutro plano, tarjetas blancas,
botones píldora de color plano, sombras suaves y difusas, chips
redondeados, un solo acento fuerte (el rojo G&V), fotos protagonistas en
tiles con overlay.

## 1. Color

Tokens:

| Token | Valor | Uso |
|---|---|---|
| `--red` | `#e62135` | Acción primaria, acentos, iconos de marca |
| `--red-dark` | `#b91527` | Precios, hovers de enlaces, texto sobre amarillo claro |
| `--yellow` | `#ffc72c` | Badges de oferta, acentos sobre fondos oscuros/rojos, hover de CTA invertido |
| `--ink` | `#11151c` | Texto principal |
| `--muted` | `#697383` | Texto secundario |
| `--line` | `#e2e7ee` | Bordes y separadores |
| `--soft` | `#f3f6f9` | Fondos suaves de tarjetas internas |
| `--surface` / `--surface-strong` | `#fff` / `#f8fafc` | Superficies de tarjetas |
| `--green` | `#0a9f73` | SOLO estados positivos (disponible, checks) |
| WhatsApp | `#25d366` | SOLO el botón flotante de WhatsApp |

Reglas:
- **Degradado cálido de marca** (rojo → naranja,
  `linear-gradient(135deg, var(--red), #ff6b42)`, a juego con el logo): es
  la norma de TODOS los acentos — **botones primarios** (`button--primary`,
  `quote-link`; hover profundiza a `--red-dark → #ff5a2c`), insignias,
  listones/chips de estado, chips activos (banco de etiquetas), estados
  hover/activo de flechas, puntos de carrusel, controles del admin y el
  **título del acordeón de categorías** junto al slider de promociones.
  Los estados verdes usan `var(--green) → #0bbf88` y los ámbar
  `#ffc72c → #ff9e2c`. NO usar degradados oscuros (negro → rojo) en
  botones: probado y descartado por el dueño. La franja del topbar mantiene
  su degradado propio (negro → rojo) como banda informativa, y las demás
  superficies grandes (banda CTA, bandeja de cotización) siguen planas.
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
- Eyebrow/píldoras: 12px, `--font-semibold`, uppercase con letter-spacing.
- Cuerpo: 15-17px, `line-height: 1.55`, color `--muted` para descripciones.
  Cursiva SOLO en las descripciones del timeline y los énfasis `em` de los
  titulares display.
- Español correcto con tildes en textos visibles ("díganos", nunca "dígnos").

## 3. Spacing

- Padding de tarjetas: 22-30px según jerarquía; el aire es parte del estilo.
- Gaps internos: 14-20px; listas compactas 10-12px.
- Radios: **botones píldora 999px**; chips/pills 999px; tarjetas 20-28px;
  inputs 12px.
- Sombras SIEMPRE suaves y difusas (tokens `--shadow-sm/md/lg`); nunca
  sombras duras u oscuras.
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

## 5. Components

- `button--primary` (y `quote-link` del header): **degradado cálido
  rojo → naranja** (`var(--red) → #ff6b42`), texto blanco. Un solo primario
  por bloque, siempre ANTES que el secundario. Lleva **sombra roja elevada**
  que crece al hover con `translateY(-2px)` (el hover profundiza a
  `--red-dark → #ff5a2c`), y un **destello diagonal que barre UNA vez al
  pasar el mouse** (keyframe `btn-shine`, nunca infinito; se apaga en touch
  y reduced-motion).
- `button--secondary`: blanco con borde `--line`; hover borde/texto rojo.
- `button--ghost`: solo sobre fotos/fondos oscuros.
- Tarjetas: superficie blanca, borde suave, sombra `--shadow-sm/md`; su cuerpo
  se ajusta al contenido y nunca usa espacios flexibles que separen el título
  del precio o las acciones.
- Chips (`product-tags`, banco de etiquetas): pill 999px con fondo tenue del
  color y **sombra suave de elevación** en reposo; al hover suben `-1px` con
  sombra mayor. El chip/etiqueta **activo** va en rojo con **sombra de color**
  (`rgba(230,33,53,.32)`).
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
- Insignias de tarjeta (`badge`): pill con **degradado cálido** — "Destacado"
  rojo → naranja; "Oferta" ámbar → naranja (texto oscuro) para distinguirse.
  Van sobre la esquina superior izquierda de la imagen.
- Listones de estado ("Disponible/Bajo pedido/Agotado"): listón con forma de
  etiqueta sobre la esquina superior derecha, con **degradado** a juego
  (verde para disponible, ámbar para bajo pedido, gris para agotado) y sombra
  de color suave. Frente al badge de oferta/destacado.
- **Dashboard del admin** (`.admin-stats` + `.admin-dash`): fila de KPIs
  con ícono rojo y rejilla `auto-fit` (nunca dejar tarjetas huérfanas en
  una fila sola), y debajo tres paneles: **Requiere atención** (avisos
  calculados de datos reales — sin foto, precio vacío, oferta sin
  descuento, destacados vencidos, agotados; cada fila lleva a la pestaña
  donde se arregla y si no hay nada muestra un mensaje en verde),
  **Accesos rápidos** y **Catálogo por categoría** (barras con el
  degradado de marca). PROHIBIDO inventar métricas: si el dato no existe
  en el catálogo, no se muestra.
- Banco de etiquetas del admin: opciones agrupadas en chips seleccionables,
  selección activa roja y área separada para las etiquetas elegidas; permite
  crear etiquetas propias sin sustituir las sugerencias del negocio.
- Ficha de producto: **precio héroe sin cajón** (número grande en
  `--red-dark` junto al tachado y chip verde "Ahorra ₡X"); badge de
  descuento "−N%" en píldora sobre la foto; acciones lado a lado 1.5:1
  (primario dominante); meta-información como chips suaves en una fila.
- Bloques relacionados se unifican en paneles con divisores internos, no
  tarjetas sueltas de alturas dispares.
- **Encabezados de sección de la portada** (`.section-head`): **píldora
  con ícono** (uppercase, letter-spacing, fondo `--soft`) y **titular
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
  (`.section-head`: píldora con ícono + uppercase), titular grande con
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
  — eyebrow, titular grande, subtítulo y botones. Toma las promociones de
  admin > Promociones; sin promociones activas cae a las líneas de
  catálogo. Fotos horizontales ambientales (taller/vehículos/servicios),
  NUNCA los afiches cuadrados de producto. Fotos de ejemplo en
  `public/hero/`.
- Modales: SIEMPRE montados con `createPortal(…, document.body)`; backdrop
  `rgba(15,23,42,.48)` a viewport completo.

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
  la `.category-grid` de siempre y en móvil las seis categorías se apilan
  en un mazo que se arrastra con el dedo; la tarjeta de arriba se va al
  fondo y los puntos (`.sliding-cards__dot`) marcan la posición. La
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
  - Sombra únicamente en la tarjeta del frente (`.is-front`); apilar seis
    sombras convierte el borde inferior en una mancha.
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
  mano).

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
