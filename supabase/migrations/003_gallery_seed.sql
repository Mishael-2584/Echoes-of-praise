-- Seed gallery items using static files hosted on Netlify.
-- Update base_url if you switch to a custom domain.

do $$
declare
  base_url text := 'https://thriving-klepon-4f8cc0.netlify.app';
begin
  if not exists (select 1 from public.gallery_items limit 1) then
    insert into public.gallery_items (title, caption, image_url, category, published, sort_order, taken_at)
    values
      ('In rehearsal', 'Preparing the blend.', base_url || '/images/gallery/eop-01.jpg', 'rehearsals', true, 1, '2025-11-28'),
      ('On stage together', 'Echoes of Praise — full choir.', base_url || '/images/gallery/eop-02.jpg', 'concerts', true, 2, '2025-11-28'),
      ('Worship moment', 'Voices lifted in praise.', base_url || '/images/gallery/eop-03.jpg', 'concerts', true, 3, '2025-11-28'),
      ('Ministry in song', 'Serving from Nakuru.', base_url || '/images/gallery/eop-04.jpg', 'outreach', true, 4, '2025-11-28'),
      ('Choir family', 'Generations singing as one.', base_url || '/images/gallery/eop-05.jpg', 'concerts', true, 5, '2025-11-28'),
      ('Front row joy', 'Young voices in the ministry.', base_url || '/images/gallery/eop-06.jpg', 'concerts', true, 6, '2025-11-28'),
      ('Harmony', 'Green and white — our colours.', base_url || '/images/gallery/eop-07.jpg', 'concerts', true, 7, '2025-11-28'),
      ('Afterglow', 'A night of praise remembered.', base_url || '/images/gallery/eop-08.jpg', 'concerts', true, 8, '2025-11-28'),
      ('Stage light', 'Ready for the next song.', base_url || '/images/gallery/eop-09.jpg', 'concerts', true, 9, '2025-11-28'),
      ('Fellowship', 'Side by side in worship.', base_url || '/images/gallery/eop-10.jpg', 'outreach', true, 10, '2025-11-28'),
      ('Focus', 'Eyes on the Director.', base_url || '/images/gallery/eop-11.jpg', 'rehearsals', true, 11, '2025-11-28'),
      ('Presence', 'Holding the room in song.', base_url || '/images/gallery/eop-12.jpg', 'concerts', true, 12, '2025-11-28'),
      ('Sound check', 'Building toward Lift the Sound.', base_url || '/images/gallery/eop-13.jpg', 'rehearsals', true, 13, '2025-11-28'),
      ('Together', 'The choir that carries Nakuru''s praise.', base_url || '/images/gallery/eop-14.jpg', 'concerts', true, 14, '2025-11-28'),
      ('Celebration', 'Joy in every part.', base_url || '/images/gallery/eop-15.jpg', 'concerts', true, 15, '2025-11-28'),
      ('Encore spirit', 'One more song for His glory.', base_url || '/images/gallery/eop-16.jpg', 'concerts', true, 16, '2025-11-28');
  end if;
end $$;
