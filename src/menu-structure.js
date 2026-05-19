// Carta — Menu cluster dish layout (sections + backward-compatible flat lists)

/** @typedef {{ key: string, dish_ids: string[] }} MenuSection */

export const MENU_SECTION_KEYS = [
  'starters',
  'soups',
  'salads',
  'mains',
  'sides',
  'desserts',
  'drinks',
  'cheese',
  'bar',
  'other',
];

/** i18n key for each section: menus.section.<key> */
export function menuSectionI18nKey(key) {
  return `menus.section.${key}`;
}

export function defaultSectionForKind(kind) {
  return kind === 'drink' ? 'drinks' : 'mains';
}

export function emptySections() {
  return MENU_SECTION_KEYS.map((key) => ({ key, dish_ids: [] }));
}

/**
 * Normalize menu_clusters.dishes (legacy string[] or v2 sections object).
 * @returns {{ v: 2, sections: MenuSection[] }}
 */
export function normalizeMenuDishes(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.sections)) {
    const byKey = new Map(raw.sections.map((s) => [s.key, [...(s.dish_ids || [])]]));
    const sections = MENU_SECTION_KEYS.map((key) => ({
      key,
      dish_ids: byKey.get(key) || [],
    }));
    for (const [key, ids] of byKey) {
      if (!MENU_SECTION_KEYS.includes(key)) {
        sections.push({ key, dish_ids: ids });
      }
    }
    return { v: 2, sections };
  }

  const flat = [];
  if (Array.isArray(raw)) {
    for (const d of raw) {
      if (typeof d === 'string') flat.push(d);
      else if (d && typeof d.id === 'string') flat.push(d.id);
    }
  }

  const sections = emptySections();
  const mains = sections.find((s) => s.key === 'mains');
  if (mains) mains.dish_ids = [...flat];
  return { v: 2, sections };
}

/** Payload stored in menu_clusters.dishes */
export function menuDishesPayload(sections) {
  return {
    v: 2,
    sections: sections.map((s) => ({
      key: s.key,
      dish_ids: [...new Set((s.dish_ids || []).filter(Boolean))],
    })),
  };
}

/** All dish ids in a cluster (any section). */
export function clusterDishIds(cluster) {
  const { sections } = normalizeMenuDishes(cluster?.dishes);
  const out = [];
  const seen = new Set();
  for (const sec of sections) {
    for (const id of sec.dish_ids || []) {
      if (!seen.has(id)) {
        seen.add(id);
        out.push(id);
      }
    }
  }
  return out;
}

export function clusterSections(cluster) {
  return normalizeMenuDishes(cluster?.dishes).sections;
}

/** Sections that have at least one dish (for print layout). */
export function clusterSectionsWithDishes(cluster) {
  return clusterSections(cluster).filter((s) => (s.dish_ids || []).length > 0);
}

export function menusContainingDish(clusters, dishId) {
  if (!dishId) return [];
  return clusters.filter((cl) => clusterDishIds(cl).includes(dishId)).map((cl) => cl.id);
}

/**
 * Sync one recipe across all workspace menus (add/remove + default section).
 * @param {{ supabase: import('@supabase/supabase-js').SupabaseClient, workspaceId: string, dishId: string, kind: string, selectedMenuIds: string[], clusters: object[] }} opts
 */
export async function syncRecipeMenus({ supabase, workspaceId, dishId, kind, selectedMenuIds, clusters }) {
  const selected = new Set(selectedMenuIds || []);
  const sectionKey = defaultSectionForKind(kind);
  const updates = [];

  for (const cl of clusters) {
    const norm = normalizeMenuDishes(cl.dishes);
    for (const sec of norm.sections) {
      sec.dish_ids = (sec.dish_ids || []).filter((id) => id !== dishId);
    }
    if (selected.has(cl.id)) {
      let sec = norm.sections.find((s) => s.key === sectionKey);
      if (!sec) {
        sec = { key: sectionKey, dish_ids: [] };
        norm.sections.push(sec);
      }
      if (!sec.dish_ids.includes(dishId)) sec.dish_ids.push(dishId);
    }
    updates.push(
      supabase
        .from('menu_clusters')
        .update({ dishes: menuDishesPayload(norm.sections) })
        .eq('id', cl.id)
        .eq('workspace_id', workspaceId),
    );
  }

  const results = await Promise.all(updates);
  const err = results.find((r) => r.error)?.error;
  if (err) throw err;
}
