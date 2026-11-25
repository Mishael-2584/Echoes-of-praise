-- New members and instrumentalists (applied via the admin panel on 25 Nov 2026).
insert into public.choir_members (name, section, sort_order, published)
select v.name, v.section, 200 + v.ord, true
from (values
  (1, 'Alvan Nyambichu', null),
  (2, 'Boaz', null),
  (3, 'Ian Kipruto', null),
  (4, 'Miller William', null),
  (5, 'Mary Kipyegon', null),
  (6, 'Balozi Mungwana', null),
  (7, 'Darius Mong''are', 'Trumpet'),
  (8, 'Brian Musembi', 'Violin'),
  (9, 'Kirk', 'Violin'),
  (10, 'Angel', 'Violin'),
  (11, 'Gianna', 'Violin'),
  (12, 'Travis Obunaka', 'Clarinet'),
  (13, 'Elaine Imbamba', 'Clarinet'),
  (14, 'Phoebe Waithaka', 'Tenor Saxophone'),
  (15, 'Amani Nyawalo', 'Flute'),
  (16, 'Elisha Wasaga', 'Guitar'),
  (17, 'Dennis', 'Drums')
) as v(ord, name, section)
where not exists (
  select 1 from public.choir_members m where m.name = v.name
);

update public.choir_members set section = 'Violin' where name = 'Kareem Kelly';
