-- Echoes of Praise — Supabase schema
-- Run in Supabase SQL editor (or via CLI migration).

create extension if not exists "pgcrypto";

-- Profiles (admin users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'admin'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text not null default '',
  city text not null default 'Nakuru',
  county text not null default 'Nakuru',
  location_notes text not null default '',
  cover_image_url text,
  status text not null default 'published'
    check (status in ('draft', 'published', 'cancelled')),
  is_free boolean not null default false,
  featured boolean not null default false,
  external_ticket_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at desc);
create index if not exists events_status_idx on public.events (status);

-- Ticket tiers
create table if not exists public.ticket_tiers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  description text not null default '',
  price_kes integer not null default 0 check (price_kes >= 0),
  capacity integer,
  perks text[] not null default '{}',
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists ticket_tiers_event_idx on public.ticket_tiers (event_id, sort_order);

-- Ticket orders + attendee analytics
create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete restrict,
  tier_id uuid not null references public.ticket_tiers (id) on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'refunded')),
  quantity integer not null default 1 check (quantity > 0),
  amount_kes integer not null default 0,
  currency text not null default 'KES',
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  -- analytics / later reporting
  buyer_city text,
  buyer_county text,
  buyer_country text default 'Kenya',
  age_range text,
  heard_about text,
  notes text,
  mpesa_checkout_id text,
  mpesa_receipt text,
  confirmation_code text not null default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ticket_orders_event_idx on public.ticket_orders (event_id, created_at desc);
create index if not exists ticket_orders_status_idx on public.ticket_orders (status);

-- Gallery
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  caption text not null default '',
  image_url text not null,
  category text not null default 'general',
  published boolean not null default true,
  sort_order integer not null default 0,
  taken_at date,
  created_at timestamptz not null default now()
);

create index if not exists gallery_published_idx on public.gallery_items (published, sort_order);

-- Fundraisers
-- kind: ongoing_support (always-on choir support) | campaign (event/project with optional goal)
create table if not exists public.fundraisers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  subtitle text not null default '',
  story text not null default '',
  kind text not null check (kind in ('ongoing_support', 'campaign')),
  goal_kes integer,
  raised_kes integer not null default 0 check (raised_kes >= 0),
  show_progress boolean not null default true,
  cover_image_url text,
  active boolean not null default true,
  event_id uuid references public.events (id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists fundraisers_active_idx on public.fundraisers (active, kind);

-- Donations
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  fundraiser_id uuid not null references public.fundraisers (id) on delete restrict,
  amount_kes integer not null check (amount_kes > 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'failed')),
  donor_name text not null,
  donor_email text,
  donor_phone text not null,
  donor_city text,
  donor_county text,
  message text,
  mpesa_checkout_id text,
  mpesa_receipt text,
  created_at timestamptz not null default now()
);

create index if not exists donations_fundraiser_idx on public.donations (fundraiser_id, created_at desc);

-- Auto-bump raised_kes when donation confirmed
create or replace function public.on_donation_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'confirmed' and (tg_op = 'INSERT' or old.status is distinct from 'confirmed') then
    update public.fundraisers
      set raised_kes = raised_kes + new.amount_kes,
          updated_at = now()
      where id = new.fundraiser_id;
  end if;
  return new;
end;
$$;

drop trigger if exists donation_confirmed on public.donations;
create trigger donation_confirmed
  after insert or update of status on public.donations
  for each row execute function public.on_donation_confirmed();

-- updated_at helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_touch on public.events;
create trigger events_touch before update on public.events
  for each row execute function public.touch_updated_at();

drop trigger if exists fundraisers_touch on public.fundraisers;
create trigger fundraisers_touch before update on public.fundraisers
  for each row execute function public.touch_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.ticket_tiers enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.gallery_items enable row level security;
alter table public.fundraisers enable row level security;
alter table public.donations enable row level security;

-- Public read for published content
create policy "Public read published events"
  on public.events for select
  using (status = 'published' or public.is_admin());

create policy "Admin manage events"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read tiers for published events"
  on public.ticket_tiers for select
  using (
    active = true and exists (
      select 1 from public.events e
      where e.id = event_id and (e.status = 'published' or public.is_admin())
    )
    or public.is_admin()
  );

create policy "Admin manage tiers"
  on public.ticket_tiers for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Anyone can create ticket orders"
  on public.ticket_orders for insert
  with check (true);

create policy "Admin read ticket orders"
  on public.ticket_orders for select
  using (public.is_admin());

create policy "Admin update ticket orders"
  on public.ticket_orders for update
  using (public.is_admin());

create policy "Public read published gallery"
  on public.gallery_items for select
  using (published = true or public.is_admin());

create policy "Admin manage gallery"
  on public.gallery_items for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Public read active fundraisers"
  on public.fundraisers for select
  using (active = true or public.is_admin());

create policy "Admin manage fundraisers"
  on public.fundraisers for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Anyone can create donations"
  on public.donations for insert
  with check (true);

create policy "Admin read donations"
  on public.donations for select
  using (public.is_admin());

create policy "Admin update donations"
  on public.donations for update
  using (public.is_admin());

create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Storage buckets (run in dashboard or via API): gallery, events, fundraisers
-- Example policies after creating buckets:
-- public read, authenticated admin write

-- Seed: ongoing support fundraiser
insert into public.fundraisers (slug, title, subtitle, story, kind, show_progress, active)
values (
  'support-the-choir',
  'Support the Choir',
  'Ongoing giving for ministry, rehearsals, and outreach',
  'Your gifts help Echoes of Praise travel, rehearse, costume, and minister across Nakuru and beyond. This fund is always open.',
  'ongoing_support',
  false,
  true
)
on conflict (slug) do nothing;

insert into public.fundraisers (
  slug, title, subtitle, story, kind, goal_kes, raised_kes, show_progress, active
) values (
  'lift-the-sound',
  'Lift the Sound',
  'Professional sound system for Echoes of Praise',
  'Help us purchase a full professional sound system—mixer, mics, mains, and monitors—so every concert is heard clearly.',
  'campaign',
  850000,
  312500,
  true,
  true
)
on conflict (slug) do nothing;
