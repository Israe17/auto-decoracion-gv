-- Esquema base de Auto Decoracion G&V en Supabase.
--
-- Misma forma que el proyecto de Unas Dalay: cada tabla guarda el
-- documento completo en `data` (jsonb) con su id de texto. Se eligio asi a
-- proposito: los documentos vienen de Firestore y los tipos de
-- `src/types.ts` no cambian, con lo cual la migracion no puede introducir
-- errores de mapeo de columnas. Si mas adelante hace falta consultar por
-- campo, se agregan indices sobre expresiones del jsonb.

create table if not exists public.products   (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.categories (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.vehicles   (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.promos     (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
create table if not exists public.brands     (id text primary key, data jsonb not null, updated_at timestamptz not null default now());

alter table public.products   enable row level security;
alter table public.categories enable row level security;
alter table public.vehicles   enable row level security;
alter table public.promos     enable row level security;
alter table public.brands     enable row level security;

-- Traduccion literal de firestore.rules: el catalogo es publico de solo
-- lectura y la escritura queda reservada a una sesion autenticada.
do $$
declare t text;
begin
  foreach t in array array['products','categories','vehicles','promos','brands'] loop
    execute format('drop policy if exists "lectura publica" on public.%I', t);
    execute format('create policy "lectura publica" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "escritura del admin" on public.%I', t);
    execute format('create policy "escritura del admin" on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- `updated_at` se mantiene solo: el admin no tiene que acordarse.
create or replace function public.marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['products','categories','vehicles','promos','brands'] loop
    execute format('drop trigger if exists marcar_actualizado on public.%I', t);
    execute format('create trigger marcar_actualizado before update on public.%I for each row execute function public.marcar_actualizado()', t);
  end loop;
end $$;
