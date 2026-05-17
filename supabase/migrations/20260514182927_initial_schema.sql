-- ============================================================
-- Carta — F&B Operations Studio · Multi-tenant SaaS schema
-- ============================================================
-- Apply via Supabase SQL Editor (Dashboard → SQL → New query)

-- ============================================================
-- 1. WORKSPACES (one per company / property group)
-- ============================================================
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  owner_id uuid references auth.users(id) on delete set null,
  plan text not null default 'free' check (plan in ('free','starter','pro','enterprise')),
  currency text default '₺',
  vat_rate numeric default 10,
  target_gp numeric default 70,
  q_factor numeric default 3,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. WORKSPACE MEMBERS (multi-user per workspace)
-- ============================================================
create table if not exists public.workspace_members (
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('owner','admin','manager','chef','viewer')),
  invited_at timestamptz default now(),
  joined_at timestamptz,
  primary key (workspace_id, user_id)
);

create index if not exists idx_members_user on public.workspace_members(user_id);

-- ============================================================
-- 3. SAVED DISHES / DRINKS
-- ============================================================
create table if not exists public.saved_dishes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('food','drink')),
  name text not null,
  data jsonb not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_dishes_ws on public.saved_dishes(workspace_id);
create unique index if not exists idx_dishes_ws_name_kind on public.saved_dishes(workspace_id, name, kind);

-- ============================================================
-- 4. MENU CLUSTERS
-- ============================================================
create table if not exists public.menu_clusters (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  type text default 'food' check (type in ('food','drinks','mixed')),
  color text default 'navy',
  icon text default 'menu_fork_knife',
  dishes jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_clusters_ws on public.menu_clusters(workspace_id);

-- ============================================================
-- 5. COST DB (ingredient prices)
-- ============================================================
create table if not exists public.cost_db (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  ingredient_name text not null,
  per_100g numeric not null,
  yield_pct numeric default 100,
  original_price numeric,
  uom text default '100G',
  sap_code text,
  as_of date,
  source text default 'manual' check (source in ('manual','SAP','csv','SAP_auto_new')),
  primary key (workspace_id, ingredient_name)
);

-- ============================================================
-- 6. COST HISTORY (snapshots for variance)
-- ============================================================
create table if not exists public.cost_history (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source text not null,
  file_name text,
  snapshot jsonb not null,
  count integer,
  created_at timestamptz default now()
);

create index if not exists idx_history_ws on public.cost_history(workspace_id, created_at desc);

-- ============================================================
-- 7. AUDIT LOG (KVKK/VUK compliance)
-- ============================================================
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  type text not null,
  count integer,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_audit_ws on public.audit_log(workspace_id, created_at desc);

-- ============================================================
-- 8. SALES DATA (Menu Engineering)
-- ============================================================
create table if not exists public.sales_data (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  dish_name text not null,
  sold integer default 0,
  price numeric default 0,
  period text,
  primary key (workspace_id, dish_name)
);

-- ============================================================
-- 9. CUSTOM INGREDIENT DB (per-workspace additions / overrides)
-- ============================================================
create table if not exists public.custom_ingredients (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  kind text not null default 'food' check (kind in ('food','drink')),
  data jsonb not null,
  is_auto_created boolean default false,
  created_at timestamptz default now(),
  primary key (workspace_id, name, kind)
);

-- ============================================================
-- ROW LEVEL SECURITY — multi-tenant isolation
-- ============================================================
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.saved_dishes enable row level security;
alter table public.menu_clusters enable row level security;
alter table public.cost_db enable row level security;
alter table public.cost_history enable row level security;
alter table public.audit_log enable row level security;
alter table public.sales_data enable row level security;
alter table public.custom_ingredients enable row level security;

-- Helper: is user a member of this workspace?
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$;

-- Helper: is user an admin/owner of this workspace?
create or replace function public.is_workspace_admin(ws_id uuid)
returns boolean
language sql stable security definer
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- Workspaces: members can read, owners/admins can update
create policy "ws_read_member" on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "ws_insert_self" on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "ws_update_admin" on public.workspaces for update
  using (public.is_workspace_admin(id));

create policy "ws_delete_owner" on public.workspaces for delete
  using (owner_id = auth.uid());

-- Workspace members: visible to members, manageable by admins
create policy "wm_read_member" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "wm_insert_admin" on public.workspace_members for insert
  with check (public.is_workspace_admin(workspace_id) or user_id = auth.uid());

create policy "wm_update_admin" on public.workspace_members for update
  using (public.is_workspace_admin(workspace_id));

create policy "wm_delete_admin" on public.workspace_members for delete
  using (public.is_workspace_admin(workspace_id) or user_id = auth.uid());

-- Generic: data tables follow workspace membership
do $$ declare t text; begin
  foreach t in array array['saved_dishes','menu_clusters','cost_db','cost_history','audit_log','sales_data','custom_ingredients']
  loop
    execute format('drop policy if exists "%I_member_read" on public.%I', t, t);
    execute format('drop policy if exists "%I_member_write" on public.%I', t, t);
    execute format('create policy "%I_member_read" on public.%I for select using (public.is_workspace_member(workspace_id))', t, t);
    execute format('create policy "%I_member_write" on public.%I for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))', t, t);
  end loop;
end $$;

-- ============================================================
-- TRIGGERS — updated_at + auto-add owner as workspace member
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_ws_updated on public.workspaces;
create trigger trg_ws_updated before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists trg_dishes_updated on public.saved_dishes;
create trigger trg_dishes_updated before update on public.saved_dishes
  for each row execute function public.set_updated_at();

-- When a workspace is created, auto-add owner as member with 'owner' role
create or replace function public.add_owner_as_member()
returns trigger language plpgsql security definer as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role, joined_at)
  values (new.id, new.owner_id, 'owner', now())
  on conflict do nothing;
  return new;
end; $$;

drop trigger if exists trg_ws_owner_member on public.workspaces;
create trigger trg_ws_owner_member after insert on public.workspaces
  for each row execute function public.add_owner_as_member();

-- ============================================================
-- DONE. Apply this whole file in Supabase SQL Editor.
-- ============================================================
