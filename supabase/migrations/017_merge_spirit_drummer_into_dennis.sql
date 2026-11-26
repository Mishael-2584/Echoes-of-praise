-- "Spirit Drummer" is Dennis (drums); keep the Dennis row and hide the old one.
update public.choir_members set published = false where name = 'Spirit Drummer';
