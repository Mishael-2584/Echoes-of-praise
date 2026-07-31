-- Choir members roster (admin-managed).
-- Safe to re-run: seeds only when table is empty.

create table if not exists public.choir_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  section text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists choir_members_published_idx
  on public.choir_members (published, sort_order, name);

drop trigger if exists choir_members_touch on public.choir_members;
create trigger choir_members_touch before update on public.choir_members
  for each row execute function public.touch_updated_at();

alter table public.choir_members enable row level security;

drop policy if exists "Public read published choir members" on public.choir_members;
create policy "Public read published choir members"
  on public.choir_members for select
  using (published = true or public.is_admin());

drop policy if exists "Admin manage choir members" on public.choir_members;
create policy "Admin manage choir members"
  on public.choir_members for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.choir_members (name, section, sort_order, published)
select v.name, v.section, v.sort_order, v.published
from (values
  ('Aaron Misati', null, 1, true),
  ('Abigael Jepkoech', null, 2, true),
  ('Agnes Benita Mong''are', null, 3, true),
  ('Alicia Makori', null, 4, true),
  ('Andrew Oroko Nyakina', null, 5, true),
  ('Anne Atonga', null, 6, true),
  ('Baraka Naomi', null, 7, true),
  ('Barkley Chugi', null, 8, true),
  ('Beth Mwangi', null, 9, true),
  ('Betty Wakesho', null, 10, true),
  ('Caprice Tuvako', null, 11, true),
  ('Carlson Bichanga', null, 12, true),
  ('Caroline Laurah Gathundia', null, 13, true),
  ('Chantelle Ogenga', null, 14, true),
  ('Cindy Florie Nyambichu', null, 15, true),
  ('David Okuthe', null, 16, true),
  ('Deborah Onwong''a', null, 17, true),
  ('Denis Bichanga', null, 18, true),
  ('Denis Chibu', null, 19, true),
  ('Dennis Mariko Ndubi', null, 20, true),
  ('Derrick Bichanga', null, 21, true),
  ('Diana Kerubo', null, 22, true),
  ('Dylan Bichanga', null, 23, true),
  ('Dylan Mbeche Tuvako', null, 24, true),
  ('Eddy Fidel Sum', null, 25, true),
  ('Edgar Zeke', 'Trumpet / Piano', 26, true),
  ('Eld. James Wanyanga', null, 27, true),
  ('Eld. Stanley Gichaba', null, 28, true),
  ('Elaine Oigo', null, 29, true),
  ('Eleanor Kerubo Oigo', null, 30, true),
  ('Elvis Omondi Odhiambo', null, 31, true),
  ('Emmanuel Kiprotich', null, 32, true),
  ('Emmanuel Rono', null, 33, true),
  ('Erick Ogweno Gaya', null, 34, true),
  ('Eunice Kelly', null, 35, true),
  ('Favour Njeri', null, 36, true),
  ('Gift Motari', null, 37, true),
  ('Grace Kibaara', null, 38, true),
  ('Harriet Safari', null, 39, true),
  ('Hellen Makori', null, 40, true),
  ('Hellen Momanyi', null, 41, true),
  ('Huldah Chepkoech Rotich', null, 42, true),
  ('Hulda Tirimba', null, 43, true),
  ('Isaiah Gidayi', 'Organ / Piano', 44, true),
  ('Ivy Bosibori Ondieki', null, 45, true),
  ('Janice Ayiemba', 'Violin', 46, true),
  ('Janet Agasa', null, 47, true),
  ('Jefferson Bichanga', null, 48, true),
  ('Job Ngugi', 'Bass', 49, true),
  ('Job Sagini', 'Conductor · Saxophone / Clarinet', 50, true),
  ('Jonathan Suvira', null, 51, true),
  ('Judith Chepchirchir Kitur', null, 52, true),
  ('Kahama Nderitu Kibaara', null, 53, true),
  ('Kareem Kelly', null, 54, true),
  ('Kathleen Berly', null, 55, true),
  ('Keila Okwano', null, 56, true),
  ('Kyle Ogola', null, 57, true),
  ('Marlin King', null, 58, true),
  ('Marsha Mokeira', null, 59, true),
  ('Martha Mong''ina', null, 60, true),
  ('Mary Loriko Loyelei', null, 61, true),
  ('Mercy Bore', null, 62, true),
  ('Michal Juma', 'Violin', 63, true),
  ('Michael Steve', null, 64, true),
  ('Mikneah Mulungi', 'Piano', 65, true),
  ('Mila Tirimba', null, 66, true),
  ('Mishael Gebre', 'Saxophone', 67, true),
  ('Mrs. David Okuthe', null, 68, true),
  ('Mrs. Stanley Gichaba', null, 69, true),
  ('Musumba Collince', null, 70, true),
  ('Naomi Zablon', null, 71, true),
  ('Natalie Achieng', null, 72, true),
  ('Nicole Bowen', null, 73, true),
  ('Nina Kagendo Kibaara', null, 74, true),
  ('Noel Bobby', null, 75, true),
  ('Peris Njeri', null, 76, true),
  ('Polycarp Mwamba', null, 77, true),
  ('Precious Machuki', null, 78, true),
  ('Priyanka Rose', null, 79, true),
  ('Reuel Musumba', null, 80, true),
  ('Rick Oigo', null, 81, true),
  ('Risper Nyabero', null, 82, true),
  ('Rispah Bichanga', null, 83, true),
  ('Rispah Momanyi', null, 84, true),
  ('Ronny Joram Monari', null, 85, true),
  ('Roseann Ngunyi', null, 86, true),
  ('Ruby Gweth Akinyi Ogola', null, 87, true),
  ('Ryan Makori', null, 88, true),
  ('Ryn Chelimo', null, 89, true),
  ('Samwel Tumaini', null, 90, true),
  ('Sandra Chepkoech Metto', null, 91, true),
  ('Seth Tirimba', null, 92, true),
  ('Shiphrah Musumba', 'Conductor', 93, true),
  ('Skylar Tirimba', null, 94, true),
  ('Sophia Thomas', null, 95, true),
  ('Spirit Drummer', 'Drums', 96, true),
  ('Steeve Monari', null, 97, true),
  ('Steve Nyaundi', null, 98, true),
  ('Timothy Gebre', null, 99, true),
  ('Wycliffe Tirimba', null, 100, true)
) as v(name, section, sort_order, published)
where not exists (select 1 from public.choir_members limit 1);
