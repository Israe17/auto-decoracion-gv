# Auto Decoracion G&V

Catalogo en Next.js para productos automotrices con cotizacion por WhatsApp,
compatibilidad por vehiculo y admin preparado para Firebase.

## Comandos

```bash
npm install
npm run dev
```

Luego abrir `http://localhost:3000`.

## Firebase

La app funciona sin Firebase usando datos de ejemplo (y el admin guarda en
localStorage como demo). Con Firebase configurado:

- El catalogo publico lee productos y categorias desde Firestore.
- El admin (`/admin`) pide login con email y contrasena, y guarda en Firestore.
- Si la base esta vacia, el admin ofrece importar el catalogo de ejemplo.

Pasos para configurarlo:

1. Entrar a Firebase Console y crear un proyecto.
2. Activar Authentication con proveedor Email/Password.
3. En Authentication > Users, crear el usuario administrador (email y contrasena).
4. Crear Firestore Database y publicar las reglas de `firestore.rules`
   (Firestore Database > Rules).
5. Crear Cloud Storage y publicar las reglas de `storage.rules` (Storage > Rules).
6. En Project settings, crear una app Web y copiar las credenciales.
7. Crear un archivo `.env.local` basado en `.env.example`.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_WHATSAPP_NUMBER=50600000000
```

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
