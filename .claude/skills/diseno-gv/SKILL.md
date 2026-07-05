---
name: diseno-gv
description: Sistema de diseño de Auto Decoración G&V. Usar SIEMPRE antes de crear o modificar UI, páginas, secciones, tarjetas, colores, estilos o copy visible del sitio. Disparadores - diseño, rediseñar, mejorar visual, UI, sección, tarjeta, colores, estilos, página nueva, layout, botón, modal.
---

# Skill de diseño G&V

Flujo obligatorio para cualquier cambio visual en este proyecto:

## 1. Leer el sistema de diseño

Antes de escribir una línea de JSX o CSS, leer `DESIGN.md` (raíz del repo).
Es la fuente de verdad de color, tipografía, espaciado, componentes, voz y
anti-patrones de la marca.

## 2. Reusar antes que inventar

- Los tokens viven en `src/app/globals.css` (`:root`). Usar `var(--…)`,
  nunca hex sueltos duplicados.
- Buscar una clase existente (`.button--*`, `.section`, tarjetas, chips,
  `.form-grid`) antes de crear una nueva.
- Datos del negocio: `src/lib/business.ts`. Mensajes de WhatsApp:
  `src/lib/whatsapp.ts`.

## 3. Verificar en el navegador

1. `npm run build` debe pasar sin errores.
2. Levantar el server y capturar la página tocada con Playwright
   (chromium en `/opt/pw-browsers/chromium`) a 1400px de ancho, y a 390px
   si el cambio afecta el layout responsive.
3. Mirar la captura de verdad: alineación, jerarquía, espaciados parejos.

## 4. Checklist final (anti-patrones de DESIGN.md §9)

- [ ] ¿Ningún bloque negro grande nuevo?
- [ ] ¿El botón primario va primero y es único en su bloque?
- [ ] ¿Sin información duplicada en la vista?
- [ ] ¿Copy profesional, de "usted", centrado en el beneficio del cliente?
- [ ] ¿Grids proporcionados y alturas parejas?
- [ ] ¿Modales por portal y keyframes terminando en `transform: none`?
