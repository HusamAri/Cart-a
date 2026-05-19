// Workspace-aware ingredient resolution: SAP aliases, brands, allergen overrides.

import {
  NUTRIENT_DB,
  lookupNutrient,
  turkNorm,
  ALLERGEN_LABELS,
} from './nutrient-db.js';

export const ALLERGEN_IDS = Object.keys(ALLERGEN_LABELS);

/**
 * @typedef {{
 *   P?: number, F?: number, C?: number, Fi?: number, ethanol?: number,
 *   allergens?: string[],
 *   maps_to?: string,
 *   allergen_override?: boolean,
 * }} IngredientData
 *
 * @typedef {{
 *   workspace_id: string,
 *   alias: string,
 *   maps_to: string,
 *   brand_name?: string|null,
 *   sap_code?: string|null,
 * }} AliasRow
 *
 * @typedef {{
 *   workspace_id: string,
 *   canonical_key: string,
 *   brand_name: string,
 *   data: IngredientData,
 *   sap_code?: string|null,
 * }} BrandRow
 */

function brandIndexKey(canonical, brand) {
  return `${turkNorm(canonical)}|${turkNorm(brand)}`;
}

function mergeHit(base, patch, source) {
  if (!patch) return { ...base, source };
  return {
    key: base.key,
    brand: patch.brand || base.brand || null,
    P: patch.P != null ? Number(patch.P) : base.P,
    F: patch.F != null ? Number(patch.F) : base.F,
    C: patch.C != null ? Number(patch.C) : base.C,
    Fi: patch.Fi != null ? Number(patch.Fi) : base.Fi,
    ethanol: patch.ethanol != null ? Number(patch.ethanol) : (base.ethanol || 0),
    allergens: patch.allergens != null ? [...patch.allergens] : (base.allergens || []),
    source,
  };
}

function brandPatchFromData(brandName, data) {
  const d = data && typeof data === 'object' ? data : {};
  const patch = { brand: brandName };
  if (d.P != null) patch.P = Number(d.P);
  if (d.F != null) patch.F = Number(d.F);
  if (d.C != null) patch.C = Number(d.C);
  if (d.Fi != null) patch.Fi = Number(d.Fi);
  if (d.ethanol != null) patch.ethanol = Number(d.ethanol);
  if (d.allergen_override || Array.isArray(d.allergens)) {
    patch.allergens = parseAllergenList(d.allergens);
  }
  return patch;
}

/**
 * @param {{
 *   aliasRows?: AliasRow[],
 *   brandRows?: BrandRow[],
 *   customRows?: import('./ingredient-registry.js').CustomIngredientRow[],
 *   localCustom?: object[],
 * }} opts
 */
export function createIngredientRegistry(opts = {}) {
  /** @type {Map<string, { maps_to: string, brand?: string|null }>} */
  const aliasToTarget = new Map();
  /** @type {Map<string, IngredientData>} */
  const defaultOverrides = new Map();
  /** @type {Map<string, { canonical_key: string, brand_name: string, data: IngredientData }>} */
  const brandByKey = new Map();
  /** @type {Map<string, IngredientData & { key: string }>} */
  const pureCustom = new Map();

  for (const row of opts.aliasRows || []) {
    const a = String(row.alias || '').trim();
    const m = String(row.maps_to || '').trim();
    if (!a || !m) continue;
    aliasToTarget.set(turkNorm(a), {
      maps_to: m,
      brand: row.brand_name ? String(row.brand_name).trim() : null,
    });
  }

  for (const row of opts.brandRows || []) {
    const canonical = String(row.canonical_key || '').trim();
    const brand = String(row.brand_name || '').trim();
    if (!canonical || !brand) continue;
    brandByKey.set(brandIndexKey(canonical, brand), {
      canonical_key: canonical,
      brand_name: brand,
      data: row.data && typeof row.data === 'object' ? row.data : {},
    });
  }

  for (const row of opts.customRows || []) {
    const name = String(row.name || '').trim();
    if (!name) continue;
    const data = row.data && typeof row.data === 'object' ? row.data : {};
    const mapsTo = String(data.maps_to || '').trim();
    if (mapsTo) {
      aliasToTarget.set(turkNorm(name), { maps_to: mapsTo, brand: null });
    }
    if (data.allergen_override || Array.isArray(data.allergens)) {
      if (!data.brand_name && !mapsTo) {
        defaultOverrides.set(turkNorm(name), data);
      }
    } else if (!mapsTo) {
      pureCustom.set(turkNorm(name), { key: name, ...normalizeCustomData(data) });
    }
  }

  for (const row of opts.localCustom || []) {
    const name = String(row.name || '').trim();
    if (!name) continue;
    pureCustom.set(turkNorm(name), {
      key: name,
      P: Number(row.P) || 0,
      F: Number(row.F) || 0,
      C: Number(row.C) || 0,
      Fi: Number(row.Fi) || 0,
      ethanol: Number(row.ethanol ?? row.E) || 0,
      allergens: parseAllergenList(row.allergens ?? row.a),
    });
  }

  function baseHitForCanonical(canonicalName) {
    return lookupNutrient(canonicalName);
  }

  function applyDefaultOverride(hit) {
    const ov = defaultOverrides.get(turkNorm(hit.key));
    if (!ov) return { ...hit, source: 'reference' };
    return mergeHit(
      hit,
      {
        P: ov.P,
        F: ov.F,
        C: ov.C,
        Fi: ov.Fi,
        ethanol: ov.ethanol,
        allergens: ov.allergen_override || Array.isArray(ov.allergens)
          ? parseAllergenList(ov.allergens)
          : null,
      },
      'override',
    );
  }

  function applyBrand(hit, canonical, brandName) {
    const row = brandByKey.get(brandIndexKey(canonical, brandName));
    if (!row) return hit;
    const patch = brandPatchFromData(brandName, row.data);
    return mergeHit(hit, patch, 'brand');
  }

  /**
   * @param {string} name
   * @param {{ brand?: string|null }} [opts2]
   */
  function resolve(name, opts2 = {}) {
    const raw = String(name || '').trim();
    if (!raw) return null;
    const n = turkNorm(raw);
    const brandOpt = opts2.brand ? String(opts2.brand).trim() : null;

    if (pureCustom.has(n)) {
      const c = pureCustom.get(n);
      return { ...c, source: 'custom' };
    }

    const aliasTarget = aliasToTarget.get(n);
    let canonicalName = aliasTarget?.maps_to || raw;
    const aliasBrand = aliasTarget?.brand || null;
    const useBrand = brandOpt || aliasBrand || null;

    let hit = baseHitForCanonical(canonicalName);
    if (!hit && aliasTarget?.maps_to) {
      canonicalName = aliasTarget.maps_to;
      hit = baseHitForCanonical(canonicalName);
    }
    if (!hit) return null;

    let out = applyDefaultOverride(hit);
    if (useBrand) {
      out = applyBrand(out, hit.key, useBrand);
    }
    return out;
  }

  function canonicalKeyFor(name) {
    const n = turkNorm(name);
    const aliasTarget = aliasToTarget.get(n);
    if (aliasTarget?.maps_to) return aliasTarget.maps_to;
    const r = resolve(name);
    return r?.key || null;
  }

  function listBrands(canonicalKey) {
    const ck = turkNorm(canonicalKey);
    return [...brandByKey.values()].filter((b) => turkNorm(b.canonical_key) === ck);
  }

  function brandCount(canonicalKey) {
    return listBrands(canonicalKey).length;
  }

  function hasDefaultAllergenOverride(key) {
    return defaultOverrides.has(turkNorm(key));
  }

  return {
    resolve,
    canonicalKeyFor,
    listBrands,
    brandCount,
    hasDefaultAllergenOverride,
    aliasToTarget,
    defaultOverrides,
    brandByKey,
    pureCustom,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 * @param {{ localCustom?: object[] }} [extra]
 */
export async function loadIngredientRegistry(supabase, workspaceId, extra = {}) {
  const empty = createIngredientRegistry({ localCustom: extra.localCustom });

  const [aliasRes, brandRes, customRes] = await Promise.all([
    supabase
      .from('workspace_ingredient_aliases')
      .select('workspace_id,alias,maps_to,sap_code,brand_name')
      .eq('workspace_id', workspaceId),
    supabase
      .from('workspace_ingredient_brands')
      .select('workspace_id,canonical_key,brand_name,data,sap_code')
      .eq('workspace_id', workspaceId),
    supabase.from('custom_ingredients').select('workspace_id,name,kind,data').eq('workspace_id', workspaceId),
  ]);

  if (
    aliasRes.error?.code === '42P01'
    || brandRes.error?.code === '42P01'
    || customRes.error?.code === '42P01'
  ) {
    return { registry: empty, tableMissing: true };
  }

  return {
    registry: createIngredientRegistry({
      aliasRows: aliasRes.data || [],
      brandRows: brandRes.data || [],
      customRows: customRes.data || [],
      localCustom: extra.localCustom,
    }),
    tableMissing: false,
  };
}

export async function upsertIngredientAlias(supabase, workspaceId, row) {
  const alias = String(row.alias || '').trim();
  const maps_to = String(row.maps_to || '').trim();
  if (!alias || !maps_to) return { error: new Error('alias and maps_to required') };

  const { data: existing } = await supabase
    .from('workspace_ingredient_aliases')
    .select('alias')
    .eq('workspace_id', workspaceId)
    .eq('alias', alias)
    .maybeSingle();

  const payload = {
    workspace_id: workspaceId,
    alias,
    maps_to,
    brand_name: row.brand_name ? String(row.brand_name).trim() : null,
    sap_code: row.sap_code || null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    return supabase.from('workspace_ingredient_aliases').update(payload).eq('workspace_id', workspaceId).eq('alias', alias);
  }
  return supabase.from('workspace_ingredient_aliases').insert(payload);
}

export async function saveAllergenOverride(supabase, workspaceId, canonicalKey, allergens) {
  const name = String(canonicalKey || '').trim();
  if (!name) return { error: new Error('canonical key required') };
  const data = {
    allergen_override: true,
    allergens: parseAllergenList(allergens),
  };
  return supabase.from('custom_ingredients').upsert(
    {
      workspace_id: workspaceId,
      name,
      kind: 'food',
      data,
      is_auto_created: false,
    },
    { onConflict: 'workspace_id,name,kind' },
  );
}

export async function clearAllergenOverride(supabase, workspaceId, canonicalKey) {
  return supabase
    .from('custom_ingredients')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('name', canonicalKey)
    .eq('kind', 'food');
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} workspaceId
 * @param {string} canonicalKey
 * @param {{ brand_name: string, P?: number, F?: number, C?: number, Fi?: number, ethanol?: number, allergens?: string[], sap_code?: string|null }} row
 */
export async function saveIngredientBrand(supabase, workspaceId, canonicalKey, row) {
  const canonical_key = String(canonicalKey || '').trim();
  const brand_name = String(row.brand_name || '').trim();
  if (!canonical_key || !brand_name) return { error: new Error('canonical_key and brand_name required') };

  const data = {
    P: row.P != null ? Number(row.P) : undefined,
    F: row.F != null ? Number(row.F) : undefined,
    C: row.C != null ? Number(row.C) : undefined,
    Fi: row.Fi != null ? Number(row.Fi) : undefined,
    ethanol: row.ethanol != null ? Number(row.ethanol) : undefined,
    allergen_override: true,
    allergens: parseAllergenList(row.allergens),
  };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);

  const payload = {
    workspace_id: workspaceId,
    canonical_key,
    brand_name,
    data,
    sap_code: row.sap_code || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('workspace_ingredient_brands')
    .select('brand_name')
    .eq('workspace_id', workspaceId)
    .eq('canonical_key', canonical_key)
    .eq('brand_name', brand_name)
    .maybeSingle();

  if (existing) {
    return supabase
      .from('workspace_ingredient_brands')
      .update(payload)
      .eq('workspace_id', workspaceId)
      .eq('canonical_key', canonical_key)
      .eq('brand_name', brand_name);
  }
  return supabase.from('workspace_ingredient_brands').insert(payload);
}

export async function deleteIngredientBrand(supabase, workspaceId, canonicalKey, brandName) {
  return supabase
    .from('workspace_ingredient_brands')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('canonical_key', canonicalKey)
    .eq('brand_name', brandName);
}

export function parseAllergenList(raw) {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim().toLowerCase()).filter((x) => ALLERGEN_IDS.includes(x));
  }
  if (!raw) return [];
  return String(raw)
    .split(/[,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((x) => ALLERGEN_IDS.includes(x));
}

function normalizeCustomData(data) {
  return {
    P: Number(data.P) || 0,
    F: Number(data.F) || 0,
    C: Number(data.C) || 0,
    Fi: Number(data.Fi) || 0,
    ethanol: Number(data.ethanol) || 0,
    allergens: parseAllergenList(data.allergens),
  };
}

export function suggestCanonicalForLabel(label, limit = 8) {
  const direct = lookupNutrient(label);
  if (direct) return [direct.key];
  const q = turkNorm(label);
  const out = [];
  const seen = new Set();
  for (const k of Object.keys(NUTRIENT_DB)) {
    const nk = turkNorm(k);
    if (nk.includes(q) || q.includes(nk)) {
      if (!seen.has(k)) {
        seen.add(k);
        out.push(k);
      }
    }
    if (out.length >= limit) break;
  }
  return out;
}
