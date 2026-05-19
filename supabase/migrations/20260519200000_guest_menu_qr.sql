-- Guest-facing QR menus: workspace logo + published menu token + public read RPC.

alter table public.workspaces
  add column if not exists logo_url text;

alter table public.menu_clusters
  add column if not exists guest_token text,
  add column if not exists guest_published_at timestamptz;

create unique index if not exists idx_menu_clusters_guest_token
  on public.menu_clusters (guest_token)
  where guest_token is not null;

-- Returns menu + workspace branding + dish rows for anonymous guests (token-gated).
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
      'logo_url', ws.logo_url
    ),
    'sections', sections_out,
    'dishes', dishes
  );
end;
$$;

revoke all on function public.get_guest_menu(text) from public;
grant execute on function public.get_guest_menu(text) to anon, authenticated;

-- Public workspace logos (property branding for QR cards).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-logos',
  'workspace-logos',
  true,
  524288,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "workspace_logos_public_read" on storage.objects;
create policy "workspace_logos_public_read"
  on storage.objects for select
  using (bucket_id = 'workspace-logos');

drop policy if exists "workspace_logos_member_insert" on storage.objects;
create policy "workspace_logos_member_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "workspace_logos_member_update" on storage.objects;
create policy "workspace_logos_member_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin((storage.foldername(name))[1]::uuid)
  );

drop policy if exists "workspace_logos_member_delete" on storage.objects;
create policy "workspace_logos_member_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin((storage.foldername(name))[1]::uuid)
  );
