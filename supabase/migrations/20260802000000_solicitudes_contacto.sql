-- Solicitudes del formulario de contacto: base de clientes del negocio.
--
-- Misma forma jsonb que el resto del esquema, pero con politicas propias:
-- el VISITANTE (anon) solo puede dejar una solicitud (insert); leerlas o
-- borrarlas exige la sesion del admin. Nunca dar select al anon aqui:
-- contiene nombres y telefonos de clientes.

create table if not exists public.contact_requests (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

drop policy if exists "insercion publica" on public.contact_requests;
create policy "insercion publica" on public.contact_requests
  for insert to anon, authenticated with check (true);

drop policy if exists "lectura del admin" on public.contact_requests;
create policy "lectura del admin" on public.contact_requests
  for select to authenticated using (true);

drop policy if exists "borrado del admin" on public.contact_requests;
create policy "borrado del admin" on public.contact_requests
  for delete to authenticated using (true);

drop trigger if exists marcar_actualizado on public.contact_requests;
create trigger marcar_actualizado before update on public.contact_requests
  for each row execute function public.marcar_actualizado();
