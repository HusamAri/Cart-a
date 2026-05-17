-- ============================================================
-- One-off: Barceló Istanbul workspace members
-- ============================================================
-- Run in Supabase SQL Editor (postgres or service role).
-- Prerequisites:
--   1) Migration 20260517183000_expand_workspace_member_roles.sql applied
--   2) Each email has signed up at least once (row in auth.users)
-- Adjust the workspace filter if the name does not match.

-- Preview workspace (must return exactly one row)
-- select id, name, slug from public.workspaces
--   where name ilike '%barceló%istanbul%' or name ilike '%barcelo%istanbul%';

with ws as (
  select id
  from public.workspaces
  where name ilike '%barcelo%istanbul%'
     or name ilike '%Barceló%Istanbul%'
  order by created_at asc
  limit 1
),
pairs (email, role) as (
  values
    ('istanbul.fb4@barcelo.com',  'food_engineer'::text),
    ('istanbul.fbm@barcelo.com',  'manager'::text),
    ('istanbul.acc4@barcelo.com', 'cost_controller'::text)
)
insert into public.workspace_members (workspace_id, user_id, role, joined_at)
select ws.id, u.id, pairs.role, now()
from ws
cross join pairs
join auth.users u on lower(trim(u.email)) = lower(trim(pairs.email))
on conflict (workspace_id, user_id)
do update set role = excluded.role;

-- Verify (optional)
-- select w.name, u.email, m.role
-- from workspace_members m
-- join workspaces w on w.id = m.workspace_id
-- join auth.users u on u.id = m.user_id
-- where w.id = (select id from workspaces where ... limit 1)
-- order by u.email;
