# Auto Decoración G&V — guía para Claude Code

Catálogo Next.js (App Router) de accesorios automotrices en Liberia,
Guanacaste, con cotización por WhatsApp, catálogo público desde Firestore
y panel admin protegido con Supabase Auth.

## Comandos

- `npm run dev` — desarrollo en http://localhost:3000
- `npm run build` — build de producción (verificar siempre antes de commit)
- Sin Supabase (`.env.local` ausente) la app corre en modo demo con datos
  de ejemplo y el admin guarda en localStorage.

## Regla de diseño (obligatoria)

Para CUALQUIER cambio visual — páginas, secciones, componentes, estilos,
colores o copy visible — leer y respetar **`DESIGN.md`** (raíz del repo)
antes de editar. La skill `diseno-gv` (`.claude/skills/diseno-gv/`)
describe el flujo completo: reusar tokens y clases de
`src/app/globals.css`, verificar con build + captura, y pasar el checklist
de anti-patrones.

## Componentes externos (MCP de shadcn)

Los componentes de terceros se buscan con el servidor MCP `shadcn`
(`.mcp.json`); el registro `@reactbits` está configurado en
`components.json` (usar las variantes JS + CSS, el proyecto NO usa
Tailwind). Nunca pegar el código tal cual: adaptarlo SIEMPRE a DESIGN.md
— tokens y clases de `src/app/globals.css`, enlaces internos con
`next/link` y efecto apagado en touch/reduced-motion cuando aplique.

## Arquitectura breve

- `src/lib/store.ts` — lectura/escritura Supabase con fallback a datos de
  ejemplo (público) y localStorage (admin demo).
- `src/lib/whatsapp.ts` — TODOS los enlaces de WhatsApp salen de aquí.
- `src/lib/business.ts` — dirección, horario y datos del negocio.
- `src/app/admin/` — panel CRUD (cliente); login en
  `src/components/AdminGate.tsx`.
- Base de datos: Supabase. El esquema y las politicas RLS viven en
  `supabase/migrations/`. Cada tabla guarda el documento completo en `data`
  (jsonb) con su `id` de texto, igual que el proyecto de Uñas Dalay: los
  tipos de `src/types.ts` no cambian y la migracion no puede introducir
  errores de mapeo de columnas. Excepción de políticas: `contact_requests`
  (solicitudes del formulario de contacto) permite al anónimo SOLO
  insertar; leer y borrar exige sesión — contiene nombres y teléfonos de
  clientes y nunca debe tener lectura pública.
- Las imagenes del admin se suben a **Supabase Storage** (bucket
  `catalog-media`, `src/lib/storage.ts`). Al agregar un origen nuevo de
  imagenes hay que autorizar su host en `remotePatterns` de
  `next.config.mjs`: el optimizador de `next/image` rechaza los hosts no
  listados y las tarjetas salen en blanco en el sitio aunque en el admin
  (que usa `<img>` normal) se vean bien. El host de Supabase se deriva de
  `NEXT_PUBLIC_SUPABASE_URL`.
