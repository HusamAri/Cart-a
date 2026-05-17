-- ============================================================
-- Carta — Allow food_engineer & cost_controller workspace roles
-- ============================================================
-- Aligns public.workspace_members.role with app + invite RPCs.
-- Without this, inserts with food_engineer / cost_controller fail the
-- table CHECK from the initial schema.

-- Drop any existing CHECK on role (constraint name varies by Postgres version).
do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.workspace_members'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%role%'
  loop
    execute format(
      'alter table public.workspace_members drop constraint %I',
      r.conname
    );
  end loop;
end $$;

alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in (
    'owner',
    'admin',
    'manager',
    'chef',
    'food_engineer',
    'cost_controller',
    'viewer'
  ));
