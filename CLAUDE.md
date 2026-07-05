# Auto Decoración G&V — guía para Claude Code

Catálogo Next.js (App Router) de accesorios automotrices en Liberia,
Guanacaste, con cotización por WhatsApp, catálogo público desde Firestore
y panel admin protegido con Firebase Auth.

## Comandos

- `npm run dev` — desarrollo en http://localhost:3000
- `npm run build` — build de producción (verificar siempre antes de commit)
- Sin Firebase (`.env.local` ausente) la app corre en modo demo con datos
  de ejemplo y el admin guarda en localStorage.

## Regla de diseño (obligatoria)

Para CUALQUIER cambio visual — páginas, secciones, componentes, estilos,
colores o copy visible — leer y respetar **`DESIGN.md`** (raíz del repo)
antes de editar. La skill `diseno-gv` (`.claude/skills/diseno-gv/`)
describe el flujo completo: reusar tokens y clases de
`src/app/globals.css`, verificar con build + captura, y pasar el checklist
de anti-patrones.

## Arquitectura breve

- `src/lib/store.ts` — lectura/escritura Firestore con fallback a datos de
  ejemplo (público) y localStorage (admin demo).
- `src/lib/whatsapp.ts` — TODOS los enlaces de WhatsApp salen de aquí.
- `src/lib/business.ts` — dirección, horario y datos del negocio.
- `src/app/admin/` — panel CRUD (cliente); login en
  `src/components/AdminGate.tsx`.
- Reglas de seguridad: `firestore.rules` y `storage.rules` (publicar en la
  consola de Firebase).
