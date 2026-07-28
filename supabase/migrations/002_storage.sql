-- Storage buckets + policies for Echoes of Praise media
-- Run in Supabase SQL editor after 001_schema.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('gallery', 'gallery', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('events', 'events', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif']),
  ('fundraisers', 'fundraisers', true, 10485760, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read gallery media" on storage.objects;
create policy "Public read gallery media"
  on storage.objects for select
  using (bucket_id in ('gallery', 'events', 'fundraisers'));

-- Admin write/update/delete
drop policy if exists "Admin upload media" on storage.objects;
create policy "Admin upload media"
  on storage.objects for insert
  with check (
    bucket_id in ('gallery', 'events', 'fundraisers')
    and public.is_admin()
  );

drop policy if exists "Admin update media" on storage.objects;
create policy "Admin update media"
  on storage.objects for update
  using (
    bucket_id in ('gallery', 'events', 'fundraisers')
    and public.is_admin()
  );

drop policy if exists "Admin delete media" on storage.objects;
create policy "Admin delete media"
  on storage.objects for delete
  using (
    bucket_id in ('gallery', 'events', 'fundraisers')
    and public.is_admin()
  );
