-- Contact submissions + editable public contact settings.
-- Also clears Crater SDA venue wording on ONE Concert if still present.
-- Safe to re-run.

-- ── ONE Concert venue copy (no Crater affiliation) ──────────────────────────
update public.events
set
  venue = case when venue ilike '%crater%' then 'Nakuru' else venue end,
  description = replace(description, 'live at Crater SDA Church, Nakuru', 'live in Nakuru'),
  updated_at = now()
where slug = 'one-concert-2026';

update public.fundraisers
set
  story = replace(story, 'ONE Concert at Crater SDA Church, Nakuru', 'ONE Concert in Nakuru'),
  updated_at = now()
where slug = 'one-concert-2026';

-- ── Contact settings (single row) ───────────────────────────────────────────
create table if not exists public.contact_settings (
  id int primary key default 1 check (id = 1),
  email text not null default 'hello@echoesofpraize.com',
  whatsapp text not null default '',
  response_time text not null default 'We aim to respond within 2–3 business days.',
  facebook_url text not null default '',
  instagram_url text not null default '',
  youtube_url text not null default '',
  tiktok_url text not null default '',
  x_url text not null default '',
  updated_at timestamptz not null default now()
);

drop trigger if exists contact_settings_touch on public.contact_settings;
create trigger contact_settings_touch before update on public.contact_settings
  for each row execute function public.touch_updated_at();

alter table public.contact_settings enable row level security;

drop policy if exists "Public read contact settings" on public.contact_settings;
create policy "Public read contact settings"
  on public.contact_settings for select
  using (true);

drop policy if exists "Admin manage contact settings" on public.contact_settings;
create policy "Admin manage contact settings"
  on public.contact_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.contact_settings (id)
values (1)
on conflict (id) do nothing;

-- ── Contact submissions ─────────────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  enquiry_type text not null
    check (enquiry_type in ('invite', 'tickets', 'partnership', 'media', 'general')),
  status text not null default 'new'
    check (status in (
      'new', 'under_review', 'more_info', 'available', 'confirmed', 'declined', 'completed'
    )),
  full_name text not null,
  phone text not null default '',
  email text not null default '',
  organisation text not null default '',
  position_role text not null default '',
  -- invitation
  event_name text not null default '',
  event_type text not null default '',
  event_description text not null default '',
  proposed_date date,
  performance_time text not null default '',
  town_venue text not null default '',
  expected_length text not null default '',
  expected_attendance text not null default '',
  sound_system text not null default ''
    check (sound_system in ('', 'yes', 'no', 'not_confirmed')),
  sound_equipment text not null default '',
  facilitation text[] not null default '{}',
  facilitation_details text not null default '',
  programme_notes text not null default '',
  theme_requests text not null default '',
  additional_notes text not null default '',
  attachment_url text,
  -- ticket holder enquiry
  ticket_event_id uuid references public.events (id) on delete set null,
  ticket_event_title text not null default '',
  ticket_reference text not null default '',
  assistance_required text not null default '',
  -- general / partnership / media
  message text not null default '',
  preferred_response text not null default ''
    check (preferred_response in ('', 'phone', 'whatsapp', 'email')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_submissions_list_idx
  on public.contact_submissions (status, enquiry_type, proposed_date desc, created_at desc);

drop trigger if exists contact_submissions_touch on public.contact_submissions;
create trigger contact_submissions_touch before update on public.contact_submissions
  for each row execute function public.touch_updated_at();

alter table public.contact_submissions enable row level security;

-- Public may insert (form submissions); only admins read/update/delete
drop policy if exists "Public insert contact submissions" on public.contact_submissions;
create policy "Public insert contact submissions"
  on public.contact_submissions for insert
  with check (true);

drop policy if exists "Admin manage contact submissions" on public.contact_submissions;
create policy "Admin manage contact submissions"
  on public.contact_submissions for all
  using (public.is_admin())
  with check (public.is_admin());
