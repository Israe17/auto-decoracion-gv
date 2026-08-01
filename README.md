# Auto Decoracion G&V

Catalogo en Next.js para productos automotrices con cotizacion por WhatsApp,
compatibilidad por vehiculo y admin sobre Supabase.

## Comandos

```bash
npm install
npm run dev
```

Luego abrir `http://localhost:3000`.

## Supabase

La app funciona sin Supabase usando datos de ejemplo (y el admin guarda en
localStorage como demo). Con Supabase configurado:

- El catalogo publico lee productos y categorias desde Postgres.
- El admin (`/admin`) pide login con email y contrasena, y guarda en Postgres.
- Si la base esta vacia, el admin ofrece importar el catalogo de ejemplo.

Pasos para configurarlo:

1. Crear un proyecto en supabase.com.
2. Aplicar la migracion de `supabase/migrations/` (SQL Editor o Supabase CLI).
   Crea las cinco tablas con RLS: lectura publica y escritura solo para una
   sesion autenticada.
3. En Authentication > Users, crear el usuario administrador del negocio.
4. En Project settings > API, copiar la URL y la clave `anon`.
5. Crear un archivo `.env.local` basado en `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Las imagenes del catalogo van a Cloudinary, no a Supabase Storage.

## Modelo de producto

Cada producto maneja:

- `saleMode`: `price_quote` para mostrar precio y cotizar, o `quote_only`
  para solo cotizar.
- `compatibilityMode`: `universal` o `specific`.
- `vehicles`: lista de marca, modelo y rango de anos cuando es especifico.
- `status`: disponible, bajo pedido o agotado.

## Siguiente paso recomendado

Subir imagenes directamente a Firebase Storage desde el formulario del admin
(hoy se pegan URLs), y hacer funcionales los filtros del catalogo y el buscador
por vehiculo.
