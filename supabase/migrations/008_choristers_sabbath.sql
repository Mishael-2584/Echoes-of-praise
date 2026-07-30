-- Past event: Choristers' Sabbath (Sunshine SDA Church, 9 May 2026).
-- Safe to re-run: upserts by slug.

insert into public.events (
  slug, title, tagline, description, starts_at, ends_at,
  venue, city, county, location_notes, cover_image_url,
  status, is_free, featured, external_ticket_url
)
values (
  'choristers-sabbath-2026',
  'Choristers'' Sabbath',
  'The Password of Thanksgiving · Sunshine SDA Church',
  'Echoes of Praise ministered at Choristers'' Sabbath at Sunshine SDA Church—The Password of Thanksgiving—a full Sabbath of worship and choral praise from 8 AM to 6 PM.',
  '2026-05-09 08:00:00+03',
  '2026-05-09 18:00:00+03',
  'Sunshine SDA Church',
  'Nakuru',
  'Nakuru',
  'Featuring The Echoes of Praise Choir',
  '/images/events/choristers-sabbath-2026.png',
  'published',
  true,
  false,
  null
)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  venue = excluded.venue,
  city = excluded.city,
  county = excluded.county,
  location_notes = excluded.location_notes,
  cover_image_url = excluded.cover_image_url,
  status = excluded.status,
  is_free = excluded.is_free,
  featured = excluded.featured,
  updated_at = now();
