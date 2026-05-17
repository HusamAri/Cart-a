-- ============================================================
-- Org-wide workspace visibility (şirket içi tüm tesisler)
-- When a user joins any facility in an organization, they also
-- receive a viewer membership on every other workspace in the
-- same organization (existing roles are never overwritten).
-- Requires public.org_members, public.organizations, and
-- public.workspaces.organization_id (already used by invites).
-- ============================================================

create or replace function public.sync_org_after_workspace_member_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  oid uuid;
begin
  select organization_id into oid from public.workspaces where id = new.workspace_id;
  if oid is null then
    return new;
  end if;

  -- Org directory row (for listMyOrganizations etc.)
  insert into public.org_members (organization_id, user_id, role, joined_at)
  values (oid, new.user_id, 'member', coalesce(new.joined_at, now()))
  on conflict (organization_id, user_id) do nothing;

  -- Same-company facilities: add read membership where missing
  insert into public.workspace_members (workspace_id, user_id, role, invited_at, joined_at)
  select w.id, new.user_id, 'viewer', now(), now()
  from public.workspaces w
  where w.organization_id = oid
    and w.id <> new.workspace_id
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_wm_sync_org_scope on public.workspace_members;
create trigger trg_wm_sync_org_scope
  after insert on public.workspace_members
  for each row execute function public.sync_org_after_workspace_member_insert();

-- After a new facility is created, grant org peers viewer access (owner row is added separately).
create or replace function public.sync_org_peers_to_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_id is null then
    return new;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, invited_at, joined_at)
  select new.id, om.user_id, 'viewer', now(), now()
  from public.org_members om
  where om.organization_id = new.organization_id
    and om.user_id is distinct from new.owner_id
  on conflict (workspace_id, user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists zzz_ws_sync_org_peers on public.workspaces;
create trigger zzz_ws_sync_org_peers
  after insert on public.workspaces
  for each row execute function public.sync_org_peers_to_new_workspace();

-- One-time backfill (idempotent)
insert into public.org_members (organization_id, user_id, role, joined_at)
select distinct w.organization_id, wm.user_id, 'member', coalesce(wm.joined_at, now())
from public.workspace_members wm
inner join public.workspaces w on w.id = wm.workspace_id
where w.organization_id is not null
on conflict (organization_id, user_id) do nothing;

insert into public.workspace_members (workspace_id, user_id, role, invited_at, joined_at)
select w.id, om.user_id, 'viewer', now(), now()
from public.workspaces w
inner join public.org_members om on om.organization_id = w.organization_id
where w.organization_id is not null
on conflict (workspace_id, user_id) do nothing;
