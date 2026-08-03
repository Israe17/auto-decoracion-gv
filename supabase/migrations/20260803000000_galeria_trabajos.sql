-- Galeria de trabajos del taller: fotos que el dueno sube desde el admin
-- y que el sitio muestra en /galeria. Misma forma jsonb y mismas politicas
-- que el resto del catalogo: lectura publica, escritura con sesion.

create table if not exists public.gallery (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.gallery enable row level security;

drop policy if exists "lectura publica" on public.gallery;
create policy "lectura publica" on public.gallery
  for select to anon, authenticated using (true);

drop policy if exists "escritura del admin" on public.gallery;
create policy "escritura del admin" on public.gallery
  for all to authenticated using (true) with check (true);

drop trigger if exists marcar_actualizado on public.gallery;
create trigger marcar_actualizado before update on public.gallery
  for each row execute function public.marcar_actualizado();
