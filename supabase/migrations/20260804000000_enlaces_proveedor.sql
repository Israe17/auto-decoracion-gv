-- Enlace a la pagina del proveedor de cada producto.
--
-- Vive en su propia tabla y NO dentro del documento del producto: la tabla
-- `products` tiene lectura publica para el anonimo (el catalogo del sitio),
-- asi que cualquier campo suyo es legible por cualquiera aunque no se
-- muestre. Este dato dice donde compra el negocio y no puede salir de aqui.
--
-- Por eso la unica politica es para `authenticated`: al anonimo no se le da
-- ninguna, con lo cual ni leer puede.

create table if not exists public.product_sources (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.product_sources enable row level security;

drop policy if exists "solo el admin" on public.product_sources;
create policy "solo el admin" on public.product_sources
  for all to authenticated using (true) with check (true);

drop trigger if exists marcar_actualizado on public.product_sources;
create trigger marcar_actualizado before update on public.product_sources
  for each row execute function public.marcar_actualizado();
