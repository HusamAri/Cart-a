-- Expose workspace currency on public guest menu payload (for menu_price display).

create or replace function public.get_guest_menu(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cl public.menu_clusters%rowtype;
  ws public.workspaces%rowtype;
  dish_ids uuid[] := array[]::uuid[];
  sec jsonb;
  did text;
  dishes jsonb := '[]'::jsonb;
  sections_out jsonb := '[]'::jsonb;
begin
  if p_token is null or char_length(trim(p_token)) < 16 then
    return jsonb_build_object('error', 'invalid_token');
  end if;

  select mc.* into cl
  from public.menu_clusters mc
  where mc.guest_token = trim(p_token)
    and mc.guest_published_at is not null;

  if not found then
    return jsonb_build_object('error', 'not_found');
  end if;

  select * into ws from public.workspaces where id = cl.workspace_id;

  if cl.dishes is not null and cl.dishes ? 'sections' then
    for sec in select * from jsonb_array_elements(cl.dishes->'sections')
    loop
      if sec ? 'dish_ids' then
        for did in select * from jsonb_array_elements_text(sec->'dish_ids')
        loop
          begin
            dish_ids := array_append(dish_ids, did::uuid);
          exception when others then
            null;
          end;
        end loop;
      end if;
    end loop;
  elsif jsonb_typeof(cl.dishes) = 'array' then
    for did in select * from jsonb_array_elements_text(cl.dishes)
    loop
      begin
        dish_ids := array_append(dish_ids, did::uuid);
      exception when others then
        null;
      end;
    end loop;
  end if;

  dish_ids := array(select distinct unnest(dish_ids));

  if coalesce(array_length(dish_ids, 1), 0) > 0 then
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'id', sd.id,
        'name', sd.name,
        'kind', sd.kind,
        'data', sd.data
      ) order by sd.name
    ), '[]'::jsonb)
    into dishes
    from public.saved_dishes sd
    where sd.id = any(dish_ids)
      and sd.workspace_id = cl.workspace_id;
  end if;

  if cl.dishes is not null and cl.dishes ? 'sections' then
    sections_out := cl.dishes->'sections';
  else
    sections_out := jsonb_build_array(
      jsonb_build_object('key', 'mains', 'dish_ids', to_jsonb(dish_ids::text[]))
    );
  end if;

  return jsonb_build_object(
    'menu', jsonb_build_object(
      'name', cl.name,
      'type', cl.type,
      'color', cl.color,
      'icon', cl.icon,
      'published_at', cl.guest_published_at
    ),
    'workspace', jsonb_build_object(
      'name', ws.name,
      'logo_url', ws.logo_url,
      'currency', coalesce(ws.currency, '₺')
    ),
    'sections', sections_out,
    'dishes', dishes
  );
end;
$$;
