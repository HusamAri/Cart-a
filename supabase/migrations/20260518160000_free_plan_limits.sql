-- ============================================================
-- Carta — Free plan quotas (recipes + team members)
-- ============================================================
-- Apply in Supabase SQL Editor. Enforces workspace.plan = 'free' caps
-- even if the client is bypassed.

create or replace function public.enforce_saved_dishes_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
  cnt int;
begin
  if tg_op <> 'INSERT' then
    return new;
  end if;
  select coalesce(plan, 'free') into p from public.workspaces where id = new.workspace_id;
  if p is distinct from 'free' then
    return new;
  end if;
  select count(*)::int into cnt from public.saved_dishes where workspace_id = new.workspace_id;
  if cnt >= 20 then
    raise exception 'CARTA_FREE_PLAN_RECIPE_LIMIT'
      using errcode = '23514',
            hint = 'Free workspaces may store at most 20 recipes. Upgrade the plan or remove dishes.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_saved_dishes_plan_limit on public.saved_dishes;
create trigger trg_saved_dishes_plan_limit
  before insert on public.saved_dishes
  for each row execute function public.enforce_saved_dishes_plan_limit();

create or replace function public.enforce_workspace_member_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
  cnt int;
  already_member boolean;
begin
  if tg_op <> 'INSERT' then
    return new;
  end if;

  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = new.workspace_id
      and wm.user_id = new.user_id
  ) into already_member;

  if already_member then
    return new;
  end if;

  select coalesce(plan, 'free') into p from public.workspaces where id = new.workspace_id;

  if p is distinct from 'free' then
    return new;
  end if;

  select count(*)::int into cnt from public.workspace_members where workspace_id = new.workspace_id;
  if cnt >= 1 then
    raise exception 'CARTA_FREE_PLAN_MEMBER_LIMIT'
      using errcode = '23514',
            hint = 'Free workspaces support a single user. Upgrade to invite teammates.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_workspace_members_plan_limit on public.workspace_members;
create trigger trg_workspace_members_plan_limit
  before insert on public.workspace_members
  for each row execute function public.enforce_workspace_member_plan_limit();
