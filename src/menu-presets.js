// Carta — curated starter recipe packs + trusted searchable catalog.
// Shipped as static data; applied into workspace via recipe_create.

/**
 * @typedef {{ name: string, kind: 'food'|'drink', data: { servings: number, ingredients: { name: string, amount: string|number, unit: string }[] } }} PresetRecipe
 * @typedef {{ id: string, recipes: PresetRecipe[] }} MenuPresetPack
 * @typedef {'vegan'|'vegetarian'|'cocktail'|'plate'|'gluten_free'|'dairy_free'} PresetTagId
 * @typedef {PresetTagId} PresetTag
 *
 * @typedef {PresetRecipe & {
 *   id: string,
 *   tags: PresetTag[],
 *   nameEn?: string,
 *   nameEs?: string,
 *   searchAliases?: string[],
 *   packId?: string,
 * }} TrustedCatalogEntry
 */

/** @type {PresetTagId[]} */
export const PRESET_TAG_IDS = ['vegan', 'vegetarian', 'cocktail', 'plate', 'gluten_free', 'dairy_free'];

/** @type {MenuPresetPack[]} */
export const MENU_PRESET_PACKS = [
  {
    id: 'tr_breakfast_starter',
    recipes: [
      {
        name: 'Menemen',
        kind: 'food',
        data: {
          servings: 2,
          ingredients: [
            { name: 'yumurta', amount: 3, unit: 'ad' },
            { name: 'domates', amount: 180, unit: 'g' },
            { name: 'biber', amount: 60, unit: 'g' },
            { name: 'zeytinyağı', amount: 18, unit: 'ml' },
            { name: 'tuz', amount: 2, unit: 'g' },
          ],
        },
      },
      {
        name: 'Siyah çay',
        kind: 'drink',
        data: {
          servings: 1,
          ingredients: [
            { name: 'siyah çay', amount: 1, unit: 'g' },
            { name: 'su', amount: 220, unit: 'ml' },
          ],
        },
      },
    ],
  },
  {
    id: 'meze_salad_yogurt',
    recipes: [
      {
        name: 'Çoban salata',
        kind: 'food',
        data: {
          servings: 4,
          ingredients: [
            { name: 'domates', amount: 200, unit: 'g' },
            { name: 'salatalık', amount: 180, unit: 'g' },
            { name: 'soğan', amount: 80, unit: 'g' },
            { name: 'maydanoz', amount: 20, unit: 'g' },
            { name: 'zeytinyağı', amount: 35, unit: 'ml' },
            { name: 'limon', amount: 0.5, unit: 'ad' },
          ],
        },
      },
      {
        name: 'Yoğurt ezmesi',
        kind: 'food',
        data: {
          servings: 4,
          ingredients: [
            { name: 'yoğurt', amount: 350, unit: 'g' },
            { name: 'sarımsak', amount: 6, unit: 'g' },
            { name: 'zeytinyağı', amount: 15, unit: 'ml' },
            { name: 'tuz', amount: 2, unit: 'g' },
          ],
        },
      },
    ],
  },
  {
    id: 'grill_hotel_plate',
    recipes: [
      {
        name: 'Izgara tavuk göğsü',
        kind: 'food',
        data: {
          servings: 1,
          ingredients: [
            { name: 'tavuk göğsü', amount: 220, unit: 'g' },
            { name: 'zeytinyağı', amount: 12, unit: 'ml' },
            { name: 'limon', amount: 0.25, unit: 'ad' },
            { name: 'tuz', amount: 2, unit: 'g' },
          ],
        },
      },
      {
        name: 'Fırın patates',
        kind: 'food',
        data: {
          servings: 2,
          ingredients: [
            { name: 'patates', amount: 380, unit: 'g' },
            { name: 'zeytinyağı', amount: 22, unit: 'ml' },
            { name: 'tuz', amount: 2, unit: 'g' },
          ],
        },
      },
      {
        name: 'Ayran',
        kind: 'drink',
        data: {
          servings: 1,
          ingredients: [{ name: 'ayran', amount: 250, unit: 'ml' }],
        },
      },
    ],
  },
  {
    id: 'vegan_plates',
    recipes: [
      {
        name: 'Mercimek köftesi tabağı',
        kind: 'food',
        data: {
          servings: 4,
          ingredients: [
            { name: 'mercimek', amount: 220, unit: 'g' },
            { name: 'bulgur', amount: 80, unit: 'g' },
            { name: 'soğan', amount: 120, unit: 'g' },
            { name: 'domates salçası', amount: 25, unit: 'g' },
            { name: 'zeytinyağı', amount: 28, unit: 'ml' },
            { name: 'maydanoz', amount: 25, unit: 'g' },
            { name: 'limon', amount: 1, unit: 'ad' },
          ],
        },
      },
      {
        name: 'Fırın sebze tabağı',
        kind: 'food',
        data: {
          servings: 2,
          ingredients: [
            { name: 'kabak', amount: 180, unit: 'g' },
            { name: 'patlıcan', amount: 200, unit: 'g' },
            { name: 'biber', amount: 120, unit: 'g' },
            { name: 'domates', amount: 140, unit: 'g' },
            { name: 'zeytinyağı', amount: 30, unit: 'ml' },
            { name: 'sarımsak', amount: 8, unit: 'g' },
          ],
        },
      },
      {
        name: 'Nohut salatası',
        kind: 'food',
        data: {
          servings: 4,
          ingredients: [
            { name: 'nohut', amount: 320, unit: 'g' },
            { name: 'salatalık', amount: 100, unit: 'g' },
            { name: 'domates', amount: 120, unit: 'g' },
            { name: 'zeytinyağı', amount: 25, unit: 'ml' },
            { name: 'limon', amount: 0.5, unit: 'ad' },
            { name: 'maydanoz', amount: 15, unit: 'g' },
          ],
        },
      },
    ],
  },
  {
    id: 'vegetarian_mains',
    recipes: [
      {
        name: 'Ispanaklı börek (peynirli)',
        kind: 'food',
        data: {
          servings: 4,
          ingredients: [
            { name: 'ıspanak', amount: 400, unit: 'g' },
            { name: 'beyaz peynir', amount: 120, unit: 'g' },
            { name: 'yumurta', amount: 2, unit: 'ad' },
            { name: 'un', amount: 40, unit: 'g' },
            { name: 'zeytinyağı', amount: 20, unit: 'ml' },
          ],
        },
      },
      {
        name: 'Mantarlı risotto',
        kind: 'food',
        data: {
          servings: 2,
          ingredients: [
            { name: 'pirinç', amount: 160, unit: 'g' },
            { name: 'mantar', amount: 180, unit: 'g' },
            { name: 'soğan', amount: 60, unit: 'g' },
            { name: 'tereyağı', amount: 25, unit: 'g' },
            { name: 'parmesan', amount: 35, unit: 'g' },
            { name: 'sarımsak', amount: 4, unit: 'g' },
          ],
        },
      },
    ],
  },
  {
    id: 'cocktail_classics',
    recipes: [
      {
        name: 'Gin & tonic',
        kind: 'drink',
        data: {
          servings: 1,
          ingredients: [
            { name: 'gin', amount: 45, unit: 'ml' },
            { name: 'soda', amount: 150, unit: 'ml' },
            { name: 'limon', amount: 0.25, unit: 'ad' },
          ],
        },
      },
      {
        name: 'Mojito',
        kind: 'drink',
        data: {
          servings: 1,
          ingredients: [
            { name: 'rom', amount: 50, unit: 'ml' },
            { name: 'nane', amount: 12, unit: 'g' },
            { name: 'limon', amount: 0.5, unit: 'ad' },
            { name: 'şeker', amount: 12, unit: 'g' },
            { name: 'soda', amount: 80, unit: 'ml' },
          ],
        },
      },
      {
        name: 'Virgin mojito',
        kind: 'drink',
        data: {
          servings: 1,
          ingredients: [
            { name: 'nane', amount: 14, unit: 'g' },
            { name: 'limon', amount: 0.5, unit: 'ad' },
            { name: 'şeker', amount: 14, unit: 'g' },
            { name: 'soda', amount: 180, unit: 'ml' },
          ],
        },
      },
    ],
  },
  {
    id: 'special_diet_plates',
    recipes: [
      {
        name: 'Izgara somon tabağı',
        kind: 'food',
        data: {
          servings: 1,
          ingredients: [
            { name: 'somon', amount: 200, unit: 'g' },
            { name: 'brokoli', amount: 120, unit: 'g' },
            { name: 'havuç', amount: 80, unit: 'g' },
            { name: 'zeytinyağı', amount: 15, unit: 'ml' },
            { name: 'limon', amount: 0.25, unit: 'ad' },
          ],
        },
      },
      {
        name: 'Süzme yoğurt & meyve kasesi',
        kind: 'food',
        data: {
          servings: 1,
          ingredients: [
            { name: 'süzme yoğurt', amount: 180, unit: 'g' },
            { name: 'çilek', amount: 80, unit: 'g' },
            { name: 'bal', amount: 15, unit: 'g' },
            { name: 'badem', amount: 12, unit: 'g' },
          ],
        },
      },
    ],
  },
];

/** Standalone trusted recipes (also surfaced in catalog search). */
/** @type {TrustedCatalogEntry[]} */
const TRUSTED_STANDALONE = [
  {
    id: 'trusted_gin_tonic',
    name: 'Gin & tonic',
    nameEn: 'Gin & tonic',
    nameEs: 'Gin tonic',
    tags: ['cocktail'],
    searchAliases: ['gin tonic', 'cocktail', 'kokteyl'],
    kind: 'drink',
    data: {
      servings: 1,
      ingredients: [
        { name: 'gin', amount: 45, unit: 'ml' },
        { name: 'soda', amount: 150, unit: 'ml' },
        { name: 'limon', amount: 0.25, unit: 'ad' },
      ],
    },
  },
  {
    id: 'trusted_negroni_style',
    name: 'Negroni (şablon)',
    nameEn: 'Negroni (template)',
    nameEs: 'Negroni (plantilla)',
    tags: ['cocktail'],
    searchAliases: ['negroni', 'bitter', 'campari'],
    kind: 'drink',
    data: {
      servings: 1,
      ingredients: [
        { name: 'gin', amount: 30, unit: 'ml' },
        { name: 'şarap (kırmızı)', amount: 30, unit: 'ml' },
        { name: 'portakal', amount: 0.25, unit: 'ad' },
      ],
    },
  },
  {
    id: 'trusted_avocado_toast',
    name: 'Avokado tost',
    nameEn: 'Avocado toast',
    nameEs: 'Tostada de aguacate',
    tags: ['vegan', 'vegetarian', 'plate'],
    searchAliases: ['avocado', 'kahvaltı', 'breakfast'],
    kind: 'food',
    data: {
      servings: 1,
      ingredients: [
        { name: 'avokado', amount: 120, unit: 'g' },
        { name: 'tam buğday ekmeği', amount: 80, unit: 'g' },
        { name: 'domates', amount: 60, unit: 'g' },
        { name: 'zeytinyağı', amount: 8, unit: 'ml' },
        { name: 'limon', amount: 0.25, unit: 'ad' },
      ],
    },
  },
  {
    id: 'trusted_lentil_soup',
    name: 'Mercimek çorbası',
    nameEn: 'Lentil soup',
    nameEs: 'Sopa de lentejas',
    tags: ['vegan', 'vegetarian', 'gluten_free'],
    searchAliases: ['çorba', 'soup', 'mercimek'],
    kind: 'food',
    data: {
      servings: 4,
      ingredients: [
        { name: 'mercimek', amount: 200, unit: 'g' },
        { name: 'soğan', amount: 100, unit: 'g' },
        { name: 'havuç', amount: 80, unit: 'g' },
        { name: 'domates salçası', amount: 20, unit: 'g' },
        { name: 'zeytinyağı', amount: 20, unit: 'ml' },
      ],
    },
  },
  {
    id: 'trusted_grilled_fish_plate',
    name: 'Izgara levrek tabağı',
    nameEn: 'Grilled sea bass plate',
    nameEs: 'Plato de lubina a la parrilla',
    tags: ['plate', 'gluten_free', 'dairy_free'],
    searchAliases: ['fish', 'balık', 'levrek', 'seafood'],
    kind: 'food',
    data: {
      servings: 1,
      ingredients: [
        { name: 'levrek', amount: 220, unit: 'g' },
        { name: 'zeytinyağı', amount: 12, unit: 'ml' },
        { name: 'limon', amount: 0.5, unit: 'ad' },
        { name: 'roka', amount: 40, unit: 'g' },
      ],
    },
  },
  {
    id: 'trusted_chicken_caesar_style',
    name: 'Tavuklu sezar salata',
    nameEn: 'Chicken Caesar salad',
    nameEs: 'Ensalada César con pollo',
    tags: ['plate'],
    searchAliases: ['caesar', 'salad', 'salata', 'tavuk'],
    kind: 'food',
    data: {
      servings: 1,
      ingredients: [
        { name: 'tavuk göğsü', amount: 140, unit: 'g' },
        { name: 'marul', amount: 120, unit: 'g' },
        { name: 'parmesan', amount: 20, unit: 'g' },
        { name: 'zeytinyağı', amount: 18, unit: 'ml' },
        { name: 'limon', amount: 0.25, unit: 'ad' },
      ],
    },
  },
  {
    id: 'trusted_fresh_orange_juice',
    name: 'Taze portakal suyu',
    nameEn: 'Fresh orange juice',
    nameEs: 'Zumo de naranja natural',
    tags: ['vegetarian', 'vegan', 'dairy_free', 'gluten_free'],
    searchAliases: ['juice', 'breakfast drink'],
    kind: 'drink',
    data: {
      servings: 1,
      ingredients: [{ name: 'portakal', amount: 3, unit: 'ad' }],
    },
  },
  {
    id: 'trusted_coconut_rice_pudding',
    name: 'Hindistan cevizli sütlü tatlı',
    nameEn: 'Coconut rice pudding',
    nameEs: 'Arroz con leche de coco',
    tags: ['vegetarian', 'plate'],
    searchAliases: ['dessert', 'tatlı', 'coconut'],
    kind: 'food',
    data: {
      servings: 4,
      ingredients: [
        { name: 'pirinç', amount: 120, unit: 'g' },
        { name: 'süt', amount: 500, unit: 'ml' },
        { name: 'hindistan cevizi', amount: 40, unit: 'g' },
        { name: 'şeker', amount: 60, unit: 'g' },
      ],
    },
  },
];

const PACK_TAGS = {
  tr_breakfast_starter: ['plate', 'vegetarian'],
  meze_salad_yogurt: ['vegetarian', 'plate'],
  grill_hotel_plate: ['plate'],
  vegan_plates: ['vegan', 'plate'],
  vegetarian_mains: ['vegetarian', 'plate'],
  cocktail_classics: ['cocktail'],
  special_diet_plates: ['plate', 'gluten_free'],
};

/** @type {TrustedCatalogEntry[] | null} */
let _catalogCache = null;

/** @returns {TrustedCatalogEntry[]} */
export function getTrustedCatalogEntries() {
  if (_catalogCache) return _catalogCache;
  const fromPacks = [];
  const seen = new Set();
  for (const pack of MENU_PRESET_PACKS) {
    const packTags = PACK_TAGS[pack.id] || [];
    for (const r of pack.recipes) {
      const id = `pack_${pack.id}_${turkNormKey(r.name)}`;
      if (seen.has(id)) continue;
      seen.add(id);
      fromPacks.push({
        id,
        packId: pack.id,
        name: r.name,
        kind: r.kind,
        data: r.data,
        tags: [...packTags],
        searchAliases: [pack.id.replace(/_/g, ' ')],
      });
    }
  }
  for (const s of TRUSTED_STANDALONE) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      fromPacks.push(s);
    }
  }
  _catalogCache = fromPacks;
  return _catalogCache;
}

function turkNormKey(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
