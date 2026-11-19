-- Progress slide: current cash received plus M-Pesa details admins can edit.
-- Safe to re-run. Does not overwrite a total or paybill already saved in admin.

alter table public.fundraisers
  add column if not exists paybill text not null default '',
  add column if not exists account_number text not null default '',
  add column if not exists account_name text not null default '',
  add column if not exists slide_kicker text not null default '',
  add column if not exists slide_tagline text not null default '';

update public.fundraisers
set
  goal_kes = case
    when goal_kes is null or goal_kes = 500000 then 3000000
    else goal_kes
  end,
  raised_kes = case when raised_kes = 0 then 99500 else raised_kes end,
  show_progress = true,
  paybill = case when paybill = '' then '522533' else paybill end,
  account_number = case when account_number = '' then '8148850' else account_number end,
  account_name = case when account_name = '' then 'Echoes of Praise' else account_name end,
  slide_kicker = case
    when slide_kicker = '' then 'Praise Amplified Fundraiser'
    else slide_kicker
  end,
  slide_tagline = case
    when slide_tagline = '' then 'Together, we are building a greater sound.'
    else slide_tagline
  end,
  updated_at = now()
where slug = 'one-concert-2026';
