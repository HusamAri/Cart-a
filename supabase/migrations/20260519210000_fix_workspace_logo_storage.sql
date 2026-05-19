-- Fix workspace logo storage policies (path match + upsert update check).

create or replace function public.workspace_logo_path_workspace_id(object_name text)
returns uuid
language sql
immutable
as $$
  select nullif(split_part(object_name, '/', 1), '')::uuid;
$$;

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
    and public.is_workspace_admin(public.workspace_logo_path_workspace_id(name))
  );

drop policy if exists "workspace_logos_member_update" on storage.objects;
create policy "workspace_logos_member_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin(public.workspace_logo_path_workspace_id(name))
  )
  with check (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin(public.workspace_logo_path_workspace_id(name))
  );

drop policy if exists "workspace_logos_member_delete" on storage.objects;
create policy "workspace_logos_member_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'workspace-logos'
    and public.is_workspace_admin(public.workspace_logo_path_workspace_id(name))
  );
