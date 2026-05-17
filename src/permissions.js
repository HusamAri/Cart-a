// Carta — client-side permission helpers
// Mirrors the server-side has_role() RLS policies so the UI can hide
// or disable destructive actions before a user even tries.
// SERVER is the source of truth — RLS will reject anything the UI lets slip through.

import { supabase } from './supabase-client.js';

// Action → roles allowed (must match the RLS policies in /supabase/migrations/role_based_permissions)
// Roles:
//   owner            — full control of the workspace
//   admin            — like owner, minus workspace delete
//   manager          — F&B/property manager (operational)
//   chef             — kitchen lead (recipe + sales)
//   food_engineer    — corporate R&D (recipe + menu + pricing + matrix)
//   cost_controller  — finance (cost ledger + pricing + sales)
//   viewer           — read-only
export const ACTIONS = {
  workspace_delete:    ['owner'],
  workspace_update:    ['owner', 'admin'],
  member_manage:       ['owner', 'admin'],

  recipe_create:       ['owner', 'admin', 'manager', 'chef', 'food_engineer'],
  recipe_update:       ['owner', 'admin', 'manager', 'chef', 'food_engineer'],
  recipe_delete:       ['owner', 'admin', 'manager', 'food_engineer'],

  cost_create:         ['owner', 'admin', 'manager', 'cost_controller', 'food_engineer'],
  cost_update:         ['owner', 'admin', 'manager', 'cost_controller', 'food_engineer'],
  cost_delete:         ['owner', 'admin'],

  pricing_edit:        ['owner', 'admin', 'cost_controller', 'food_engineer'],

  sales_edit:          ['owner', 'admin', 'manager', 'chef', 'cost_controller', 'food_engineer'],
  sales_delete:        ['owner', 'admin', 'manager', 'food_engineer'],

  snapshot_capture:    ['owner', 'admin', 'manager', 'cost_controller', 'food_engineer'],
  snapshot_delete:     ['owner', 'admin'],

  menu_cluster_edit:   ['owner', 'admin', 'manager', 'chef', 'food_engineer'],
  menu_cluster_delete: ['owner', 'admin', 'manager', 'food_engineer'],

  // Everyone with read access can export
  export:              ['owner', 'admin', 'manager', 'chef', 'viewer', 'cost_controller', 'food_engineer'],
};

const _cache = new Map(); // wsId → role

export async function getMyRole(wsId) {
  if (!wsId) return 'viewer';
  if (_cache.has(wsId)) return _cache.get(wsId);
  const { data, error } = await supabase.rpc('user_workspace_role', { ws_id: wsId });
  if (error) { console.warn('getMyRole error', error); return 'viewer'; }
  const role = data || 'viewer';
  _cache.set(wsId, role);
  return role;
}

export function invalidateRoleCache(wsId = null) {
  if (wsId) _cache.delete(wsId);
  else _cache.clear();
}

export function can(role, action) {
  const allowed = ACTIONS[action];
  if (!allowed) { console.warn('Unknown action:', action); return false; }
  return allowed.includes(role);
}

// Convenience guard: returns true if the role can perform action; otherwise shows an alert
export function requireCan(role, action, msg) {
  if (can(role, action)) return true;
  alert(msg || `Bu işlem için yetkin yok (${role}).`);
  return false;
}

/**
 * applyRoleGates(role, root)
 * Hides/disables elements based on declarative attributes:
 *   data-require="<action>"          → element hidden if !can(role, action)
 *   data-require-disable="<action>"  → element disabled if !can(role, action) (input/button)
 * Root defaults to document so it covers later-rendered modal content too.
 * Idempotent.
 */
export function applyRoleGates(role, root = document) {
  root.querySelectorAll('[data-require]').forEach(el => {
    const action = el.getAttribute('data-require');
    if (!can(role, action)) {
      el.hidden = true;
      el.setAttribute('aria-hidden', 'true');
    } else {
      el.hidden = false;
      el.removeAttribute('aria-hidden');
    }
  });
  root.querySelectorAll('[data-require-disable]').forEach(el => {
    const action = el.getAttribute('data-require-disable');
    if (!can(role, action)) {
      el.disabled = true;
      el.setAttribute('aria-disabled', 'true');
      el.title = el.title || `Bu rol (${role}) için yetkili değil.`;
    } else {
      el.disabled = false;
      el.removeAttribute('aria-disabled');
    }
  });
  // Expose role on body for any CSS-only gating
  if (root === document || root === document.body) {
    document.body.setAttribute('data-role', role);
  }
}
