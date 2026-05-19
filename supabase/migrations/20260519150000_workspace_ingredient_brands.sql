-- Per-workspace sub-brands (alt marka): macros + allergens per canonical ingredient.

create table if not exists public.workspace_ingredient_brands (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  canonical_key text not null,
  brand_name text not null,
  data jsonb not null default '{}'::jsonb,
  sap_code text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_ws_ingredient_brands_uq
  on public.workspace_ingredient_brands (workspace_id, canonical_key, brand_name);

create index if not exists idx_ws_ingredient_brands_canonical
  on public.workspace_ingredient_brands (workspace_id, canonical_key);

alter table public.workspace_ingredient_brands enable row level security;

drop policy if exists "workspace_ingredient_brands_member_read" on public.workspace_ingredient_brands;
drop policy if exists "workspace_ingredient_brands_member_write" on public.workspace_ingredient_brands;

create policy "workspace_ingredient_brands_member_read" on public.workspace_ingredient_brands
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_ingredient_brands_member_write" on public.workspace_ingredient_brands
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop trigger if exists trg_ws_ingredient_brands_updated on public.workspace_ingredient_brands;
create trigger trg_ws_ingredient_brands_updated before update on public.workspace_ingredient_brands
  for each row execute function public.set_updated_at();

-- Optional brand on SAP alias rows
alter table public.workspace_ingredient_aliases
  add column if not exists brand_name text;
