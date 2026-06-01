// Carta — Workspace management
import { supabase } from './supabase-client.js';
import { PUBLIC_APP_ORIGIN } from './config.js';

const ACTIVE_WS_KEY = 'carta_active_workspace_id';
const STALE_WS_FLAG = 'carta_ws_stale_flash';
const ACTIVE_ORG_KEY = 'carta_active_org_id';
const INVITE_TOKEN_KEY = 'carta_invite_token';
const SIGNUP_PLAN_KEY = 'carta_signup_plan';

const ALLOWED_SIGNUP_PLANS = new Set(['free', 'starter', 'pro', 'enterprise']);

/** Merge duplicate org_members rows (same org, different role labels) for stable UI. */
const ORG_ROLE_RANK = {
  owner: 100,
  admin: 80,
  manager: 60,
  member: 40,
  viewer: 20,
};
function strongerOrgRole(a, b) {
  const ra = ORG_ROLE_RANK[a] ?? 0;
  const rb = ORG_ROLE_RANK[b] ?? 0;
  if (rb > ra) return b;
  return a || b || 'member';
}

// ----- Organizations -----

export async function listMyOrganizations() {
  // org_members join organizations — RLS only returns orgs the user is in
  const { data, error } = await supabase
    .from('org_members')
    .select('role, joined_at, organizations(id, name, slug, created_at)')
    .order('joined_at', { ascending: false });
  if (error) { console.error('listMyOrganizations', error); return []; }
  const rows = (data || [])
    .map(r => {
      const o = r.organizations;
      if (!o?.id) return null;
      return { ...o, role: r.role || 'member', _joined: r.joined_at };
    })
    .filter(Boolean);
  const byId = new Map();
  for (const row of rows) {
    const prev = byId.get(row.id);
    if (!prev) {
      byId.set(row.id, row);
    } else {
      byId.set(row.id, {
        ...prev,
        role: strongerOrgRole(prev.role, row.role),
      });
    }
  }
  const merged = [...byId.values()].map(({ _joined, ...o }) => o);
  merged.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'tr', { sensitivity: 'base' }));
  return merged;
}

export async function createOrganization(name) {
  // created_by and the owner membership are filled by DB default + trigger.
  const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ name, slug })
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, organization: org };
}

export function getActiveOrgId() {
  try { return localStorage.getItem(ACTIVE_ORG_KEY); } catch(e) { return null; }
}
export function setActiveOrg(id) {
  try { id ? localStorage.setItem(ACTIVE_ORG_KEY, id) : localStorage.removeItem(ACTIVE_ORG_KEY); } catch(e) {}
}

// ----- Workspaces (facilities) -----

export async function listMyWorkspaces(orgId = null) {
  // Facilities where this user has a workspace_members row. Joining one
  // property in an organization adds viewer membership to sibling properties
  // (see migration org_wide_workspace_membership).
  const { data: directMembers, error: e1 } = await supabase
    .from('workspace_members')
    .select('role, workspaces(id, name, slug, plan, currency, created_at, organization_id, organizations(name))')
    .order('joined_at', { ascending: false });
  if (e1) { console.error(e1); return []; }
  let workspaces = (directMembers || [])
    .map(r => normalizeWorkspaceRow(r.workspaces, r.role))
    .filter(Boolean);

  const seen = new Set();
  workspaces = workspaces.filter((w) => {
    if (!w.id || seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
  if (orgId) workspaces = workspaces.filter(w => w.organization_id === orgId);
  return workspaces;
}

/**
 * createWorkspace({name, currency, organizationId, plan})
 *   If organizationId is omitted, a new organization with the same name is created.
 *   The new workspace becomes a facility under that organization.
 */
export async function createWorkspace({ name, slug, currency = '₺', organizationId = null, plan = null }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { ok: false, error: 'Not signed in' };

  // 1. Ensure we have an organization to attach the workspace to
  let orgId = organizationId;
  if (!orgId) {
    const orgResult = await createOrganization(name);
    if (!orgResult.ok) return orgResult;
    orgId = orgResult.organization.id;
  }

  // 2. Create the workspace (facility) inside the org
  const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Math.random().toString(36).slice(2, 6);
  const row = { name, slug: finalSlug, currency, organization_id: orgId };
  const normalizedPlan = normalizeSignupPlan(plan);
  if (normalizedPlan) row.plan = normalizedPlan;
  const { data, error } = await supabase
    .from('workspaces')
    .insert(row)
    .select()
    .single();
  if (error) {
    console.error('createWorkspace error', error);
    return { ok: false, error: error.message };
  }
  setActiveWorkspace(data.id);
  setActiveOrg(orgId);
  return { ok: true, workspace: data, organizationId: orgId };
}

export function getActiveWorkspaceId() {
  try { return localStorage.getItem(ACTIVE_WS_KEY); } catch(e) { return null; }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidWorkspaceId(id) {
  return typeof id === 'string' && UUID_RE.test(id);
}

export function clearActiveWorkspace() {
  try { localStorage.removeItem(ACTIVE_WS_KEY); } catch (e) {}
}

export function setActiveWorkspace(id) {
  try {
    if (id && isValidWorkspaceId(id)) localStorage.setItem(ACTIVE_WS_KEY, id);
    else localStorage.removeItem(ACTIVE_WS_KEY);
  } catch (e) {}
}

async function fetchWorkspaceById(id) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*, organizations(name)')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.warn('fetchWorkspaceById', error);
    return null;
  }
  if (!data) return null;
  return normalizeWorkspaceRow(data);
}

/**
 * Resolve the active workspace for studio pages.
 * Reconciles stale localStorage IDs against listMyWorkspaces (membership join).
 * Auto-selects when exactly one workspace is available.
 */
export async function getActiveWorkspace() {
  let id = getActiveWorkspaceId();
  if (id && !isValidWorkspaceId(id)) {
    clearActiveWorkspace();
    id = null;
  }
  if (id) {
    const direct = await fetchWorkspaceById(id);
    if (direct) return direct;
  }

  const list = await listMyWorkspaces();
  if (id) {
    const fromList = list.find((w) => w.id === id);
    if (fromList) return fromList;
    clearActiveWorkspace();
    try { sessionStorage.setItem(STALE_WS_FLAG, '1'); } catch (e) {}
  }

  if (list.length === 1) {
    const only = list[0];
    setActiveWorkspace(only.id);
    if (only.organization_id) setActiveOrg(only.organization_id);
    return only;
  }

  return null;
}

export async function updateWorkspace(id, patch) {
  const { data, error } = await supabase
    .from('workspaces')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, workspace: data };
}

// Count of artifacts that will be lost when a workspace is deleted.
// Used in the strong-confirmation UI.
export async function getWorkspaceArtifactCounts(id) {
  const [dishes, costs, sales, snaps] = await Promise.all([
    supabase.from('saved_dishes').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
    supabase.from('cost_db').select('ingredient_name', { count: 'exact', head: true }).eq('workspace_id', id),
    supabase.from('sales_data').select('dish_name', { count: 'exact', head: true }).eq('workspace_id', id),
    supabase.from('cost_history').select('id', { count: 'exact', head: true }).eq('workspace_id', id),
  ]);
  return {
    recipes:   dishes.count ?? 0,
    costEntries: costs.count ?? 0,
    salesRows: sales.count ?? 0,
    snapshots: snaps.count ?? 0,
  };
}

// Permanently delete the workspace (and all child rows via DB cascades).
// Caller MUST have run a strong-confirmation flow before invoking this.
// Only the owner (auth.uid() = owner_id) can succeed via RLS.
export async function deleteWorkspace(id) {
  const { error } = await supabase.from('workspaces').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  // Clear active workspace cache if it was this one
  try {
    if (getActiveWorkspaceId() === id) localStorage.removeItem(ACTIVE_WS_KEY);
  } catch (e) {}
  return { ok: true };
}

// ----- Member management -----

export async function listMembers(wsId) {
  const { data, error } = await supabase.rpc('workspace_members_with_email', { ws_id: wsId });
  if (error) { console.error('listMembers', error); return []; }
  return data || [];
}

export async function inviteMember(wsId, email, role = 'viewer') {
  const cleanEmail = (email || '').trim().toLowerCase();

  // New flow: always produce an invite link so invited people do not need a pre-existing account.
  const { data: inviteData, error: inviteError } = await supabase.rpc('create_workspace_invite', {
    ws_id: wsId,
    invitee_email: cleanEmail,
    invitee_role: role,
    invite_base_url: `${PUBLIC_APP_ORIGIN}/app/signup.html`,
  });
  if (!inviteError && inviteData?.ok) return inviteData;

  const msg = (inviteError?.message || '').toLowerCase();
  const missingInviteRpc =
    inviteError?.code === '42883'
    || inviteError?.code === 'PGRST202'
    || msg.includes('create_workspace_invite')
    || msg.includes('function public.create_workspace_invite');
  if (missingInviteRpc) {
    return { ok: false, error: 'invite_link_flow_not_deployed' };
  }
  if (inviteError) return { ok: false, error: inviteError.message };
  return inviteData || { ok: false, error: 'unknown' };
}

export async function acceptWorkspaceInvite(inviteToken) {
  const token = (inviteToken || '').trim();
  if (!token) return { ok: false, error: 'missing_invite_token' };
  const { data, error } = await supabase.rpc('accept_workspace_invite', { invite_token: token });
  if (error) return { ok: false, error: error.message };
  return data || { ok: false, error: 'unknown' };
}

export function storeInviteToken(token) {
  const clean = (token || '').trim();
  if (!clean) return;
  try { localStorage.setItem(INVITE_TOKEN_KEY, clean); } catch (e) {}
}

export function readStoredInviteToken() {
  try { return localStorage.getItem(INVITE_TOKEN_KEY); } catch (e) { return null; }
}

export function consumeStoredInviteToken() {
  let token = null;
  try {
    token = localStorage.getItem(INVITE_TOKEN_KEY);
    localStorage.removeItem(INVITE_TOKEN_KEY);
  } catch (e) {}
  return token;
}

/** Persist plan from onboarding link (?plan=pro) through magic-link auth. */
export function normalizeSignupPlan(plan) {
  const p = String(plan || '').trim().toLowerCase();
  return ALLOWED_SIGNUP_PLANS.has(p) ? p : null;
}

export function storeSignupPlan(plan) {
  const normalized = normalizeSignupPlan(plan);
  if (!normalized) return;
  try { localStorage.setItem(SIGNUP_PLAN_KEY, normalized); } catch (e) {}
}

export function consumeStaleWorkspaceFlash() {
  try {
    const v = sessionStorage.getItem(STALE_WS_FLAG);
    sessionStorage.removeItem(STALE_WS_FLAG);
    return v === '1';
  } catch (e) {
    return false;
  }
}

export function readStoredSignupPlan() {
  try { return normalizeSignupPlan(localStorage.getItem(SIGNUP_PLAN_KEY)); } catch (e) { return null; }
}

export function consumeStoredSignupPlan() {
  const plan = readStoredSignupPlan();
  if (!plan) return null;
  try { localStorage.removeItem(SIGNUP_PLAN_KEY); } catch (e) {}
  return plan;
}

function normalizeWorkspaceRow(workspace, role = null) {
  if (!workspace) return null;
  const orgRel = Array.isArray(workspace.organizations) ? workspace.organizations[0] : workspace.organizations;
  const organizationName = orgRel?.name || workspace.organization_name || null;
  const { organizations, ...rest } = workspace;
  return { ...rest, organization_name: organizationName, role };
}

export async function changeMemberRole(wsId, userId, role) {
  const { data, error } = await supabase.rpc('set_member_role', {
    ws_id: wsId, target_user: userId, new_role: role,
  });
  if (error) return { ok: false, error: error.message };
  return data || { ok: false, error: 'unknown' };
}

export async function removeMember(wsId, userId) {
  const { data, error } = await supabase.rpc('remove_member', {
    ws_id: wsId, target_user: userId,
  });
  if (error) return { ok: false, error: error.message };
  return data || { ok: false, error: 'unknown' };
}
