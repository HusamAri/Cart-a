// Carta — Menu cluster dish layout (type-specific sections + backward-compatible flat lists)

/** @typedef {{ key: string, dish_ids: string[] }} MenuSection */

/** Menu cluster types (menu_clusters.type). */
export const MENU_TYPE_KEYS = [
  'food',
  'drinks',
  'cocktail',
  'wine',
  'bar',
  'buffet',
  'snack',
  'breakfast',
  'coffee',
  'mixed',
];

/** Section keys per menu type (order = print / editor order). */
export const MENU_TYPE_SECTIONS = {
  food: ['starters', 'soups', 'salads', 'mains', 'sides', 'desserts', 'cheese', 'other'],
  drinks: ['soft_drinks', 'juices', 'hot_drinks', 'cold_drinks', 'other'],
  cocktail: ['signature', 'classics', 'aperitif', 'digestif', 'mocktails', 'other'],
  wine: ['sparkling', 'white', 'rose', 'red', 'dessert_wine', 'by_glass', 'by_bottle', 'other'],
  bar: ['beer', 'spirits', 'shots', 'highballs', 'bar_cocktails', 'non_alcoholic', 'other'],
  buffet: ['cold', 'hot', 'salad_bar', 'live_station', 'soup', 'dessert', 'bread', 'other'],
  snack: ['savory', 'sweet', 'finger_food', 'dips', 'other'],
  breakfast: ['hot_breakfast', 'cold_breakfast', 'pastries', 'eggs', 'breakfast_beverages', 'other'],
  coffee: ['espresso_based', 'filter_coffee', 'cold_coffee', 'tea', 'other'],
  mixed: [
    'starters', 'soups', 'salads', 'mains', 'sides', 'desserts', 'drinks', 'cheese', 'bar',
    'soft_drinks', 'cocktails', 'wine', 'snack', 'other',
  ],
};

/** All section keys ever used (legacy normalize + CSV). */
export const MENU_SECTION_KEYS = [...new Set([
  ...Object.values(MENU_TYPE_SECTIONS).flat(),
  'drinks', 'bar', 'cocktails',
])];

export function normalizeMenuType(type) {
  const t = String(type || 'mixed').toLowerCase();
  return MENU_TYPE_KEYS.includes(t) ? t : 'mixed';
}

/** Ordered section keys for a menu type. */
export function sectionsForMenuType(menuType) {
  const key = normalizeMenuType(menuType);
  return [...(MENU_TYPE_SECTIONS[key] || MENU_TYPE_SECTIONS.mixed)];
}

/** i18n key: menus.section.<key> */
export function menuSectionI18nKey(sectionKey) {
  return `menus.section.${sectionKey}`;
}

export function emptySectionsForMenuType(menuType) {
  return sectionsForMenuType(menuType).map((key) => ({ key, dish_ids: [] }));
}

/** @deprecated Use emptySectionsForMenuType('mixed') */
export function emptySections() {
  return emptySectionsForMenuType('mixed');
}

/** Default recipe section when linking to a menu. */
export function defaultSectionForMenuType(menuType, recipeKind = 'food') {
  const sections = sectionsForMenuType(menuType);
  const isDrink = recipeKind === 'drink';
  const drinkMap = {
    food: 'drinks',
    drinks: 'cold_drinks',
    cocktail: 'classics',
    wine: 'white',
    bar: 'bar_cocktails',
    buffet: 'other',
    snack: 'other',
    breakfast: 'breakfast_beverages',
    coffee: 'espresso_based',
    mixed: 'drinks',
  };
  const foodMap = {
    food: 'mains',
    drinks: 'other',
    cocktail: 'other',
    wine: 'other',
    bar: 'other',
    buffet: 'hot',
    snack: 'finger_food',
    breakfast: 'hot_breakfast',
    coffee: 'other',
    mixed: 'mains',
  };
  const pick = isDrink ? drinkMap : foodMap;
  const key = pick[normalizeMenuType(menuType)] || sections[0];
  return sections.includes(key) ? key : (sections[0] || 'other');
}

/** @deprecated */
export function defaultSectionForKind(kind) {
  return defaultSectionForMenuType('mixed', kind);
}

/**
 * Rebuild sections for a new menu type; dishes in removed sections move to "other" or last section.
 * @param {MenuSection[]} existingSections
 * @param {string} menuType
 */
export function mergeDraftSectionsForType(existingSections, menuType) {
  const targetKeys = sectionsForMenuType(menuType);
  const fallback = targetKeys.includes('other') ? 'other' : targetKeys[targetKeys.length - 1];
  const buckets = new Map(targetKeys.map((k) => [k, []]));

  for (const sec of existingSections || []) {
    for (const id of sec.dish_ids || []) {
      const key = targetKeys.includes(sec.key) ? sec.key : fallback;
      const list = buckets.get(key);
      if (!list.includes(id)) list.push(id);
    }
  }
  return targetKeys.map((key) => ({ key, dish_ids: buckets.get(key) }));
}

/**
 * @param {unknown} raw
 * @param {string} [menuType]
 * @returns {{ v: 2, sections: MenuSection[] }}
 */
export function normalizeMenuDishes(raw, menuType = 'mixed') {
  const templateKeys = sectionsForMenuType(menuType);

  if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.sections)) {
    const byKey = new Map(raw.sections.map((s) => [s.key, [...(s.dish_ids || [])]]));
    const sections = templateKeys.map((key) => ({
      key,
      dish_ids: byKey.get(key) || [],
    }));
    for (const [key, ids] of byKey) {
      if (!templateKeys.includes(key) && ids.length) {
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

  const sections = emptySectionsForMenuType(menuType);
  const fallback = defaultSectionForMenuType(menuType, 'food');
  const sec = sections.find((s) => s.key === fallback) || sections[0];
  if (sec) sec.dish_ids = [...flat];
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
  const { sections } = normalizeMenuDishes(cluster?.dishes, cluster?.type);
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
  return normalizeMenuDishes(cluster?.dishes, cluster?.type).sections;
}

/** Sections that have at least one dish (for print layout). */
export function clusterSectionsWithDishes(cluster) {
  const type = normalizeMenuType(cluster?.type);
  const allowed = new Set(sectionsForMenuType(type));
  return clusterSections(cluster).filter(
    (s) => (s.dish_ids || []).length > 0 && (allowed.has(s.key) || s.dish_ids.length),
  );
}

/** Visible sections for editor/print: type template + legacy keys that still hold dishes. */
export function sectionsForMenuDisplay(cluster, draftSections = null) {
  const type = normalizeMenuType(cluster?.type);
  const templateKeys = sectionsForMenuType(type);
  const source = draftSections || clusterSections(cluster);
  const byKey = new Map(source.map((s) => [s.key, { ...s, dish_ids: [...(s.dish_ids || [])] }]));
  const out = templateKeys.map((key) => byKey.get(key) || { key, dish_ids: [] });
  for (const sec of source) {
    if (!templateKeys.includes(sec.key) && (sec.dish_ids || []).length) {
      out.push(sec);
    }
  }
  return out;
}

export function menusContainingDish(clusters, dishId) {
  if (!dishId) return [];
  return clusters.filter((cl) => clusterDishIds(cl).includes(dishId)).map((cl) => cl.id);
}

/**
 * Sync one recipe across all workspace menus (add/remove + default section).
 */
export async function syncRecipeMenus({ supabase, workspaceId, dishId, kind, selectedMenuIds, clusters }) {
  const selected = new Set(selectedMenuIds || []);
  const updates = [];

  for (const cl of clusters) {
    const menuType = normalizeMenuType(cl.type);
    const sectionKey = defaultSectionForMenuType(menuType, kind);
    const norm = normalizeMenuDishes(cl.dishes, menuType);
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
