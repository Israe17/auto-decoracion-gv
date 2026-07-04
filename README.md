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

La app funciona sin Firebase usando datos de ejemplo, pero para publicar productos
desde el admin hay que crear un proyecto Firebase:

1. Entrar a Firebase Console y crear un proyecto.
2. Activar Authentication con proveedor Email/Password.
3. Crear Firestore Database.
4. Crear Cloud Storage.
5. En Project settings, crear una app Web y copiar las credenciales.
6. Crear un archivo `.env.local` basado en `.env.example`.

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

Conectar login real del admin, cargar productos desde Firestore en el catalogo y
subir imagenes directamente a Firebase Storage desde el formulario.
