-- Event-based gallery albums (past ministry events + their photos).
-- Run after 001_schema.sql (and 002_storage.sql for uploads).

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  event_date date,
  cover_image_url text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_albums_published_idx
  on public.gallery_albums (published, sort_order, event_date desc);

alter table public.gallery_items
  add column if not exists album_id uuid references public.gallery_albums (id) on delete set null;

create index if not exists gallery_items_album_idx
  on public.gallery_items (album_id, sort_order);

drop trigger if exists gallery_albums_touch on public.gallery_albums;
create trigger gallery_albums_touch before update on public.gallery_albums
  for each row execute function public.touch_updated_at();

alter table public.gallery_albums enable row level security;

drop policy if exists "Public read published gallery albums" on public.gallery_albums;
create policy "Public read published gallery albums"
  on public.gallery_albums for select
  using (published = true or public.is_admin());

drop policy if exists "Admin manage gallery albums" on public.gallery_albums;
create policy "Admin manage gallery albums"
  on public.gallery_albums for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed one album from existing gallery seed photos (if any, and no albums yet)
do $$
declare
  album_uuid uuid;
begin
  if not exists (select 1 from public.gallery_albums limit 1)
     and exists (select 1 from public.gallery_items limit 1) then
    insert into public.gallery_albums (slug, title, description, event_date, published, sort_order)
    values (
      'ministry-moments',
      'Ministry moments',
      'Highlights from rehearsals, concerts, and outreach with Echoes of Praise.',
      '2025-11-28',
      true,
      1
    )
    returning id into album_uuid;

    update public.gallery_items
      set album_id = album_uuid
      where album_id is null;

    update public.gallery_albums a
      set cover_image_url = (
        select g.image_url from public.gallery_items g
        where g.album_id = a.id
        order by g.sort_order
        limit 1
      )
      where a.id = album_uuid;
  end if;
end $$;
