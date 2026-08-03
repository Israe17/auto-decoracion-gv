insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalog-media',
  'catalog-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "catalog media admin insert" on storage.objects;
drop policy if exists "catalog media admin update" on storage.objects;
drop policy if exists "catalog media admin delete" on storage.objects;

create policy "catalog media admin insert"
on storage.objects for insert
to authenticated
with check (bucket_id = 'catalog-media');

create policy "catalog media admin update"
on storage.objects for update
to authenticated
using (bucket_id = 'catalog-media')
with check (bucket_id = 'catalog-media');

create policy "catalog media admin delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'catalog-media');
