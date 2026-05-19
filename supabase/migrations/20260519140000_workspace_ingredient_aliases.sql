-- SAP / ERP ingredient labels → Carta canonical keys (per workspace).
-- Allergen and macro overrides stay in custom_ingredients (canonical name = maps_to).

create table if not exists public.workspace_ingredient_aliases (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  alias text not null,
  maps_to text not null,
  sap_code text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_ws_ingredient_aliases_uq
  on public.workspace_ingredient_aliases (workspace_id, alias);

create index if not exists idx_ws_ingredient_aliases_maps
  on public.workspace_ingredient_aliases (workspace_id, maps_to);

alter table public.workspace_ingredient_aliases enable row level security;

drop policy if exists "workspace_ingredient_aliases_member_read" on public.workspace_ingredient_aliases;
drop policy if exists "workspace_ingredient_aliases_member_write" on public.workspace_ingredient_aliases;

create policy "workspace_ingredient_aliases_member_read" on public.workspace_ingredient_aliases
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_ingredient_aliases_member_write" on public.workspace_ingredient_aliases
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

drop trigger if exists trg_ws_ingredient_aliases_updated on public.workspace_ingredient_aliases;
create trigger trg_ws_ingredient_aliases_updated before update on public.workspace_ingredient_aliases
  for each row execute function public.set_updated_at();
