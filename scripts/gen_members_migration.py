"""Generate 009_choir_members.sql from src/content/choir.ts MEMBER_NAMES."""
from __future__ import annotations

import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
text = (root / "src/content/choir.ts").read_text(encoding="utf-8")
block = re.search(r"const MEMBER_NAMES = \[(.*?)\] as const", text, re.S)
if not block:
    raise SystemExit("MEMBER_NAMES not found")
names = re.findall(r'"([^"]+)"', block.group(1))

sections = {
    "Shiphrah Musumba": "Conductor",
    "Job Sagini": "Conductor · Saxophone / Clarinet",
    "Job Ngugi": "Bass",
    "Isaiah Gidayi": "Organ / Piano",
    "Janice Ayiemba": "Violin",
    "Michal Juma": "Violin",
    "Mishael Gebre": "Saxophone",
    "Edgar Zeke": "Trumpet / Piano",
    "Mikneah Mulungi": "Piano",
    "Spirit Drummer": "Drums",
}


def esc(s: str) -> str:
    return s.replace("'", "''")


rows = []
for i, name in enumerate(names, 1):
    sec = sections.get(name)
    sec_sql = f"'{esc(sec)}'" if sec else "null"
    rows.append(f"  ('{esc(name)}', {sec_sql}, {i}, true)")

sql = f"""-- Choir members roster (admin-managed).
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
{',\n'.join(rows)}
) as v(name, section, sort_order, published)
where not exists (select 1 from public.choir_members limit 1);
"""

out = root / "supabase/migrations/009_choir_members.sql"
out.write_text(sql, encoding="utf-8")
print(f"Wrote {len(names)} members -> {out}")
