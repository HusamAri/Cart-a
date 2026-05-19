-- Workspace "My presets" — archived recipes (e.g. after delete from library).

create table if not exists public.workspace_recipe_presets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null check (kind in ('food','drink')),
  name text not null,
  data jsonb not null,
  source text not null default 'deleted' check (source in ('deleted','saved')),
  archived_at timestamptz not null default now()
);

create unique index if not exists idx_ws_recipe_presets_uq
  on public.workspace_recipe_presets (workspace_id, kind, name);

create index if not exists idx_ws_recipe_presets_ws
  on public.workspace_recipe_presets (workspace_id, archived_at desc);

alter table public.workspace_recipe_presets enable row level security;

drop policy if exists "workspace_recipe_presets_member_read" on public.workspace_recipe_presets;
drop policy if exists "workspace_recipe_presets_member_write" on public.workspace_recipe_presets;

create policy "workspace_recipe_presets_member_read" on public.workspace_recipe_presets
  for select using (public.is_workspace_member(workspace_id));

create policy "workspace_recipe_presets_member_write" on public.workspace_recipe_presets
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));
