// Carta — workspace "My presets" (archived recipes) + apply helpers.

import { computeRecipe } from './recipe-compute.js';

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 * @param {{ name: string, kind: 'food'|'drink', data: object }} recipe
 */
export async function archiveDeletedRecipe(supabase, workspaceId, recipe) {
  const name = String(recipe?.name || '').trim();
  if (!name || !workspaceId) return { ok: false, skipped: true };
  const kind = recipe.kind === 'drink' ? 'drink' : 'food';
  const data = recipe.data && typeof recipe.data === 'object' ? recipe.data : {};
  const payload = {
    workspace_id: workspaceId,
    name,
    kind,
    data,
    source: 'deleted',
    archived_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase
    .from('workspace_recipe_presets')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('kind', kind)
    .eq('name', name)
    .maybeSingle();
  const { error } = existing?.id
    ? await supabase.from('workspace_recipe_presets').update(payload).eq('id', existing.id)
    : await supabase.from('workspace_recipe_presets').insert(payload);
  if (error) {
    const code = String(error.code || '');
    if (code === '42P01' || /workspace_recipe_presets/i.test(String(error.message || ''))) {
      return { ok: false, tableMissing: true, error };
    }
    return { ok: false, error };
  }
  return { ok: true };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 */
export async function fetchMyPresets(supabase, workspaceId) {
  const { data, error } = await supabase
    .from('workspace_recipe_presets')
    .select('id,name,kind,data,source,archived_at')
    .eq('workspace_id', workspaceId)
    .order('archived_at', { ascending: false });
  if (error) {
    if (String(error.code) === '42P01') return { rows: [], tableMissing: true, error };
    return { rows: [], error };
  }
  return { rows: data || [] };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} presetId
 */
export async function removeMyPreset(supabase, presetId) {
  return supabase.from('workspace_recipe_presets').delete().eq('id', presetId);
}

/**
 * @param {Set<string>} existingKeys — `kind|lowercase name`
 * @param {{ name: string, kind: 'food'|'drink', data: { servings?: number, ingredients?: object[] } }} recipe
 */
export function buildPresetInsertPayload(recipe) {
  const name = String(recipe.name || '').trim();
  const kind = recipe.kind === 'drink' ? 'drink' : 'food';
  const servings = Math.max(1, Number(recipe.data?.servings) || 1);
  const ingredients = Array.isArray(recipe.data?.ingredients) ? recipe.data.ingredients : [];
  const computed = computeRecipe({ ingredients, servings });
  return { name, kind, data: { servings, ingredients, computed } };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 * @param {Set<string>} existingKeys
 * @param {object[]} recipes
 */
export async function applyPresetRecipes(supabase, workspaceId, existingKeys, recipes) {
  let added = 0;
  let skipped = 0;
  const errors = [];
  const keys = new Set(existingKeys);

  for (const r of recipes) {
    const { name, kind, data } = buildPresetInsertPayload(r);
    if (!name) continue;
    const k = `${kind}|${name.toLowerCase()}`;
    if (keys.has(k)) {
      skipped++;
      continue;
    }
    const { error } = await supabase
      .from('saved_dishes')
      .insert({ workspace_id: workspaceId, name, kind, data });
    if (error) {
      errors.push(error.message);
      continue;
    }
    keys.add(k);
    added++;
  }
  return { added, skipped, errors, keys };
}
