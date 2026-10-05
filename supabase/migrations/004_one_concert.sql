-- Seed ONE Concert (1-year anniversary) + anniversary fundraiser.
-- Safe to re-run: upserts by slug.

do $$
declare
  base_url text := 'https://thriving-klepon-4f8cc0.netlify.app';
  event_uuid uuid;
begin
  insert into public.events (
    slug, title, tagline, description, starts_at, ends_at,
    venue, city, county, location_notes, cover_image_url,
    status, is_free, featured, external_ticket_url
  )
  values (
    'one-concert-2026',
    'Echoes of Praise at ONE Concert',
    '1-year anniversary · Theme: Praise Amplified',
    'Celebrate one year of Echoes of Praise with our anniversary concert—Praise Amplified. Featuring The Cenacle Ministry (Uganda) and Abide, live at Crater SDA Church, Nakuru. Admission is free. Gifts toward the anniversary fundraiser purchase a sound system and instruments for the ministry.',
    '2026-11-29 14:00:00+03',
    '2026-11-29 18:00:00+03',
    'Crater SDA Church',
    'Nakuru',
    '',
    'Guests: The Cenacle Ministry (Uganda) · Abide. Free admission.',
    base_url || '/images/events/one-concert-cenacle.png',
    'published',
    true,
    true,
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
    updated_at = now()
  returning id into event_uuid;

  select id into event_uuid from public.events where slug = 'one-concert-2026';

  -- Ensure only this concert is featured among published events
  update public.events
  set featured = (slug = 'one-concert-2026'),
      updated_at = now()
  where status = 'published';

  insert into public.fundraisers (
    slug, title, subtitle, story, kind, goal_kes, raised_kes,
    show_progress, cover_image_url, active, event_id, starts_at, ends_at
  )
  values (
    'one-concert-2026',
    'ONE Concert Anniversary Fund',
    'Sound system and instruments for the ministry',
    'This fund is being raised to purchase a sound system and instruments for Echoes of Praise. The goal is KSh 3,000,000. The concert itself—Echoes of Praise at ONE Concert, 29 November 2026 at Crater SDA Church, Nakuru, with The Cenacle Ministry (Uganda) and Abide—is free.',
    'campaign',
    3000000,
    0,
    true,
    base_url || '/images/events/one-concert-cenacle.png',
    true,
    event_uuid,
    '2026-07-01 00:00:00+03',
    '2026-11-29 23:59:00+03'
  )
  on conflict (slug) do update set
    title = excluded.title,
    subtitle = excluded.subtitle,
    story = excluded.story,
    kind = excluded.kind,
    goal_kes = excluded.goal_kes,
    show_progress = excluded.show_progress,
    cover_image_url = excluded.cover_image_url,
    active = excluded.active,
    event_id = excluded.event_id,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    updated_at = now();
end $$;
