-- Expand menu_clusters.type for hospitality menu formats (cocktail, wine, buffet, etc.)

alter table public.menu_clusters
  drop constraint if exists menu_clusters_type_check;

alter table public.menu_clusters
  add constraint menu_clusters_type_check
  check (type in (
    'food',
    'drinks',
    'mixed',
    'cocktail',
    'wine',
    'bar',
    'buffet',
    'snack',
    'breakfast',
    'coffee'
  ));
