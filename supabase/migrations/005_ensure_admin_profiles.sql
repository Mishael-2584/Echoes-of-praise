-- Ensure every Supabase Auth user has an admin profile.
-- Safe to re-run after creating accounts in Authentication → Users.

insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', u.email),
  'admin'
from auth.users u
on conflict (id) do update
  set role = 'admin',
      full_name = coalesce(excluded.full_name, public.profiles.full_name);

-- Quick check (optional): list who can access admin writes
-- select p.id, p.full_name, p.role, u.email
-- from public.profiles p
-- join auth.users u on u.id = p.id;
