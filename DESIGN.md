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
- **Colores planos**: nada de gradientes en botones ni franjas. Topbar,
  banda CTA y bandeja de cotización van en `var(--red)` plano; el primario
  hace hover a `--red-dark`.
- Canvas neutro plano (`--bg #f6f7f8`), sin tintes ni degradados de fondo.
- Fondos siempre claros. **Prohibido** introducir bloques grandes oscuros
  (charcoal/negro); los únicos oscuros permitidos son el carrusel del hero
  (foto con sombreado), el footer y la bandeja flotante de cotización
  (`--ink`, decisión del dueño).
- El rojo es el único color de acción primaria; no competirlo con otros
  botones llamativos en la misma vista.
- Amarillo cálido (`#fff8e5 → #ffefc4`) para tarjetas de consejo/apoyo.

## 2. Typography

- Familia: Arial / Helvetica (system stack, sin webfonts).
- H1 de ficha/página: `clamp(30px, 3vw, 42px)`, peso 760.
- H2 de sección: ~1.35-1.6rem, peso 700-760.
- Eyebrow (etiqueta sobre títulos): 13px, 800, uppercase, color rojo o muted.
- Cuerpo: 15-17px, `line-height: 1.55`, color `--muted` para descripciones.
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
- Navegación móvil: menú drawer (`MobileMenu`) por portal al body; el
  header móvil es UNA fila (logo + CTA + hamburguesa).
- En listados con filtros, el producto va primero y los filtros después.

## 5. Components

- `button--primary`: rojo, texto blanco. Un solo primario por bloque, siempre
  ANTES que el secundario.
- `button--secondary`: blanco con borde `--line`; hover borde/texto rojo.
- `button--ghost`: solo sobre fotos/fondos oscuros.
- Tarjetas: superficie blanca, borde suave, sombra `--shadow-sm/md`.
- Chips (`product-tags`, estados): pill 999px con fondo tenue del color.
- Ficha de producto: **precio héroe sin cajón** (número grande en
  `--red-dark` junto al tachado y chip verde "Ahorra ₡X"); badge de
  descuento "−N%" en píldora sobre la foto; acciones lado a lado 1.5:1
  (primario dominante); meta-información como chips suaves en una fila.
- Bloques relacionados se unifican en paneles con divisores internos, no
  tarjetas sueltas de alturas dispares.
- Carrusel del inicio: foto horizontal a todo lo ancho (`cover`) con un
  degradado oscuro a la izquierda y el texto encima — eyebrow, titular
  grande, subtítulo y botones (primario al enlace + WhatsApp). Toma las
  promociones de admin > Promociones; sin promociones activas cae a las
  líneas de catálogo. Las fotos del hero son horizontales ambientales
  (taller/vehículos/servicios), NUNCA los afiches cuadrados de producto.
  Fotos de ejemplo self-hosted en `public/hero/`.
- Modales: SIEMPRE montados con `createPortal(…, document.body)`; backdrop
  `rgba(15,23,42,.48)` a viewport completo.

## 6. Motion

- Motor de animación de scroll: **GSAP + ScrollTrigger** vía
  `src/components/ScrollFx.tsx` (montado en el layout). Reveals de 0.7s
  `power2.out` al 88% del viewport, staggers de 0.08s en grillas y pop
  del precio héroe. Nuevas secciones/grillas se registran en los
  selectores de ese componente.
- La imagen de producto se muestra COMPLETA: tarjeta con contenedor
  cuadrado (los artes son 1:1) y galería con `object-fit: contain` sobre
  blanco — sin parallax ni zooms que recorten el arte.
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
- **Hero del logo** (`CompatHero`): escena oscura radial (excepción
  aprobada por el dueño, junto a carrusel/footer/bandeja) con el logo
  flotando (bob 2.6s), halo rojo que respira, brillos que derivan y
  **giro rotateY ligado al scroll** (scrub) tipo secuencia; el formulario
  flota encima en vidrio (`blur 16px`). Respeta reduced-motion.
- El logo en alta resolución vive en `public/gv-system-logo.png` (256px,
  extraído del .ico).
- Efecto **glare** (destello diagonal que barre al pasar el mouse):
  pieza reutilizable — contenedor con `.glare-host` + `<span class="glare">`.
  Se usa en tarjetas de servicio, banda CTA y hero. Solo `:hover`, se
  apaga en touch (`@media (hover: none)`) y con reduced-motion. No es
  animación infinita; es un barrido único por hover.
- Efecto **spotlight** (luz que sigue el cursor): componente
  `src/components/Spotlight.tsx` (`.spotlight-host` + `<span class="spotlight">`).
  Coordenadas por `onMouseMove`, color por prop (`--spot-color`). Blanco
  sobre fondos oscuros/foto (hero); rojo tenue sobre tarjetas claras
  (fila de beneficios). Se apaga en touch y reduced-motion.
- Efecto **BlurText** (título que entra palabra por palabra desde arriba,
  desenfocado → nítido): componente `src/components/BlurText.tsx` —
  adaptación de React Bits a GSAP (sin la dependencia `motion`). Se usa en
  el título del hero y re-anima al cambiar de slide. Texto accesible
  (`aria-label`), respeta reduced-motion.
- Efecto **Border Glow** (anillo de luz roja que sigue el cursor en el
  borde): componente `src/components/BorderGlow.tsx` — adaptación de React
  Bits; envuelve la tarjeta y enciende un anillo según cercanía al borde y
  ángulo del cursor. Se usa en las tarjetas de categoría/subcategoría
  (`CategoryCard`). Se apaga en touch y reduced-motion.
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
6. Grids con anchos arbitrarios y alturas desparejas.
7. Faltas de ortografía o imperativos inventados ("Dígnos").
8. Emojis en la interfaz.
9. URLs de WhatsApp armadas a mano fuera de `src/lib/whatsapp.ts`.
10. Modales renderizados dentro de secciones animadas sin portal.
