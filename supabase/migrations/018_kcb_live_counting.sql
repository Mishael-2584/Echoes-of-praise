-- Live fundraiser counting from KCB payment notifications (IPN).
-- Paste into the Supabase SQL editor and run. Safe to re-run.

-- 1. Live-counting switch on fundraisers.
alter table public.fundraisers
  add column if not exists live_counting boolean not null default false,
  add column if not exists live_started_at timestamptz;

-- 2. Every payment KCB reports, stored once per transaction.
create table if not exists public.kcb_payments (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null unique,
  amount_kes numeric(12, 2) not null check (amount_kes >= 0),
  currency text not null default 'KES',
  payer_name text not null default '',
  payer_phone text not null default '',
  reference text not null default '',
  narration text not null default '',
  channel text not null default '',
  notification_type text not null default '',
  signature_verified boolean not null default false,
  counted boolean not null default false,
  fundraiser_id uuid references public.fundraisers (id) on delete set null,
  raw jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);

create index if not exists kcb_payments_received_idx
  on public.kcb_payments (received_at desc);

alter table public.kcb_payments enable row level security;

drop policy if exists "Admin read kcb payments" on public.kcb_payments;
create policy "Admin read kcb payments"
  on public.kcb_payments for select
  using (public.is_admin());

-- 3. When a verified payment arrives while a fundraiser is counting live,
--    add it to that fundraiser's total.
create or replace function public.on_kcb_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid;
begin
  if not new.signature_verified then
    return new;
  end if;

  select id into target
  from public.fundraisers
  where live_counting = true
    and live_started_at is not null
    and new.received_at >= live_started_at
  order by live_started_at desc
  limit 1;

  if target is null then
    return new;
  end if;

  update public.fundraisers
    set raised_kes = raised_kes + floor(new.amount_kes)::integer,
        updated_at = now()
    where id = target;

  update public.kcb_payments
    set counted = true, fundraiser_id = target
    where id = new.id;

  return new;
end;
$$;

drop trigger if exists kcb_payment_inserted on public.kcb_payments;
create trigger kcb_payment_inserted
  after insert on public.kcb_payments
  for each row execute function public.on_kcb_payment();
