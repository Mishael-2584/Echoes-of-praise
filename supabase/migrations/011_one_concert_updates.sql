-- ONE Concert copy: title, Crater SDA venue, free admission,
-- Abide instead of Merge, and a KSh 3,000,000 instruments fund.
-- Does not reset money already raised. Safe to re-run.

update public.events
set
  title = 'Echoes of Praise at ONE Concert',
  tagline = '1-year anniversary · Theme: Praise Amplified',
  description = 'Celebrate one year of Echoes of Praise with our anniversary concert—Praise Amplified. Featuring The Cenacle Ministry (Uganda) and Abide, live at Crater SDA Church, Nakuru. Admission is free. Gifts toward the anniversary fundraiser purchase a sound system and instruments for the ministry.',
  venue = 'Crater SDA Church',
  city = 'Nakuru',
  county = '',
  location_notes = 'Guests: The Cenacle Ministry (Uganda) · Abide. Free admission.',
  is_free = true,
  updated_at = now()
where slug = 'one-concert-2026';

update public.fundraisers
set
  subtitle = 'Sound system and instruments for the ministry',
  story = 'This fund is being raised to purchase a sound system and instruments for Echoes of Praise. The goal is KSh 3,000,000. The concert itself—Echoes of Praise at ONE Concert, 29 November 2026 at Crater SDA Church, Nakuru, with The Cenacle Ministry (Uganda) and Abide—is free.',
  goal_kes = 3000000,
  updated_at = now()
where slug = 'one-concert-2026';
