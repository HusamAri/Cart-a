-- Organization-scoped recipe sharing metadata + consent audit trail.
-- Application-layer queries may surface rows from sibling workspaces only when
-- share_with_org is true and consent was recorded.

alter table public.saved_dishes
  add column if not exists share_with_org boolean not null default false;

alter table public.saved_dishes
  add column if not exists share_consent_at timestamptz;

alter table public.saved_dishes
  add column if not exists share_consent_by uuid references auth.users (id) on delete set null;

create index if not exists idx_saved_dishes_org_share
  on public.saved_dishes (workspace_id)
  where share_with_org is true and share_consent_at is not null;

create or replace function public.saved_dishes_normalize_share_consent()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(NEW.share_with_org, false) = false then
    NEW.share_consent_at := null;
    NEW.share_consent_by := null;
  elsif NEW.share_consent_at is not null and NEW.share_consent_by is null then
    NEW.share_consent_by := auth.uid();
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_saved_dishes_share_consent on public.saved_dishes;
create trigger trg_saved_dishes_share_consent
  before insert or update on public.saved_dishes
  for each row execute function public.saved_dishes_normalize_share_consent();
