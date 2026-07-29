-- Soft-archive metadata for fundraisers + album cover focal point (object-position).

alter table public.fundraisers
  add column if not exists archived_at timestamptz;

comment on column public.fundraisers.archived_at is
  'When set, campaign is soft-deleted (hidden from public). Row kept as backup.';

alter table public.gallery_albums
  add column if not exists cover_focus_x numeric not null default 50
    check (cover_focus_x >= 0 and cover_focus_x <= 100);

alter table public.gallery_albums
  add column if not exists cover_focus_y numeric not null default 50
    check (cover_focus_y >= 0 and cover_focus_y <= 100);

comment on column public.gallery_albums.cover_focus_x is
  'Horizontal focal point for cover crop (0–100, used as object-position %).';
comment on column public.gallery_albums.cover_focus_y is
  'Vertical focal point for cover crop (0–100, used as object-position %).';
