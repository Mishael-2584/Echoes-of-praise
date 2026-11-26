-- Log of M-Pesa Express (STK push) requests, gateway replies and callbacks,
-- so admins can see results without Netlify function logs. Safe to re-run.

create table if not exists public.kcb_stk_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('request', 'callback')),
  checkout_request_id text not null default '',
  phone text not null default '',
  amount_kes numeric(12, 2),
  result_code text not null default '',
  result_desc text not null default '',
  request jsonb,
  response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists kcb_stk_log_created_idx
  on public.kcb_stk_log (created_at desc);

alter table public.kcb_stk_log enable row level security;

drop policy if exists "Admin read stk log" on public.kcb_stk_log;
create policy "Admin read stk log"
  on public.kcb_stk_log for select
  using (public.is_admin());
