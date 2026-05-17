-- ============================================================
-- Carta — Workspace invite links (signup-first onboarding)
-- ============================================================
-- This migration adds invite-link based onboarding so invited users do
-- not need a pre-existing account. Invite acceptance happens after auth.

create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  invitee_email text not null,
  invitee_role text not null check (
    invitee_role in ('viewer','chef','food_engineer','manager','cost_controller','admin')
  ),
  token text not null unique,
  invited_by uuid references auth.users(id) on delete set null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index if not exists idx_workspace_invites_ws on public.workspace_invites(workspace_id, created_at desc);
create index if not exists idx_workspace_invites_email on public.workspace_invites(lower(invitee_email));
create index if not exists idx_workspace_invites_token on public.workspace_invites(token);

alter table public.workspace_invites enable row level security;

-- No direct table policies on purpose.
-- Access is only through SECURITY DEFINER RPC functions below.

create or replace function public.create_workspace_invite(
  ws_id uuid,
  invitee_email text,
  invitee_role text default 'viewer',
  invite_base_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  clean_email text;
  clean_role text;
  can_manage boolean := false;
  existing_user_id uuid;
  invite_token text;
  final_base_url text;
  invite_url text;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  clean_email := lower(trim(coalesce(invitee_email, '')));
  clean_role := lower(trim(coalesce(invitee_role, 'viewer')));
  if clean_email = '' then
    return jsonb_build_object('ok', false, 'error', 'email_required');
  end if;
  if position('@' in clean_email) = 0 then
    return jsonb_build_object('ok', false, 'error', 'invalid_email');
  end if;
  if clean_role not in ('viewer','chef','food_engineer','manager','cost_controller','admin') then
    return jsonb_build_object('ok', false, 'error', 'invalid_role');
  end if;

  if to_regprocedure('public.has_role(uuid,text[])') is not null then
    select public.has_role(ws_id, array['owner','admin']) into can_manage;
  else
    select public.is_workspace_admin(ws_id) into can_manage;
  end if;
  if not coalesce(can_manage, false) then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;

  -- If the account already exists, ensure membership immediately.
  select u.id
    into existing_user_id
  from auth.users u
  where lower(u.email) = clean_email
  limit 1;

  if existing_user_id is not null then
    insert into public.workspace_members (workspace_id, user_id, role, joined_at)
    values (ws_id, existing_user_id, clean_role, now())
    on conflict (workspace_id, user_id)
    do update set role = excluded.role;
  end if;

  invite_token := replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');

  insert into public.workspace_invites (
    workspace_id, invitee_email, invitee_role, token, invited_by
  )
  values (
    ws_id, clean_email, clean_role, invite_token, auth.uid()
  );

  final_base_url := nullif(trim(coalesce(invite_base_url, '')), '');
  if final_base_url is null then
    final_base_url := 'https://cart-a.live/app/signup.html';
  end if;

  invite_url := final_base_url
    || case when strpos(final_base_url, '?') > 0 then '&' else '?' end
    || 'invite=' || invite_token
    || '&email=' || clean_email;

  return jsonb_build_object(
    'ok', true,
    'invite_url', invite_url,
    'token', invite_token,
    'auto_joined', existing_user_id is not null
  );
end;
$$;

create or replace function public.accept_workspace_invite(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  tok text;
  inv public.workspace_invites%rowtype;
  current_email text;
  ws_org_id uuid;
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  tok := trim(coalesce(invite_token, ''));
  if tok = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_invite_token');
  end if;

  select *
    into inv
  from public.workspace_invites
  where token = tok
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if inv.id is null then
    return jsonb_build_object('ok', false, 'error', 'invite_not_found_or_expired');
  end if;

  select lower(email) into current_email from auth.users where id = auth.uid();
  if current_email is distinct from lower(inv.invitee_email) then
    return jsonb_build_object('ok', false, 'error', 'invite_email_mismatch');
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (inv.workspace_id, auth.uid(), inv.invitee_role, now())
  on conflict (workspace_id, user_id)
  do update set role = excluded.role;

  update public.workspace_invites
  set accepted_by = auth.uid(),
      accepted_at = now()
  where id = inv.id;

  select organization_id into ws_org_id from public.workspaces where id = inv.workspace_id;

  return jsonb_build_object(
    'ok', true,
    'workspace_id', inv.workspace_id,
    'organization_id', ws_org_id,
    'role', inv.invitee_role
  );
end;
$$;

grant execute on function public.create_workspace_invite(uuid, text, text, text) to authenticated;
grant execute on function public.accept_workspace_invite(text) to authenticated;
