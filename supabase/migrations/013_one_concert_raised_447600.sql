-- Latest cash received for the ONE Concert anniversary fundraiser (19 Nov 2026).
-- Same as setting "Cash received" to 447,600 in Admin → Fundraisers.

update public.fundraisers
set raised_kes = 447600,
    updated_at = now()
where slug = 'one-concert-2026';
