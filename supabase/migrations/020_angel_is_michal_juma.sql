-- "Angel" (violin) is Michal Juma; keep Michal Juma and hide the duplicate.
update public.choir_members set published = false where name = 'Angel';
