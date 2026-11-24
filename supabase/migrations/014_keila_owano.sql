-- Correct Keila's surname to match her membership form.
update public.choir_members
   set name = 'Keila Owano'
 where name = 'Keila Okwano';
