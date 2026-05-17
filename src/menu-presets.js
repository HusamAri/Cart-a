// Carta — curated starter recipe packs (property / training menus).
// Shipped as static data; applied into workspace via recipe_create.

/**
 * @typedef {{ name: string, kind: 'food'|'drink', data: { servings: number, ingredients: { name: string, amount: string|number, unit: string }[] } }} PresetRecipe
 * @typedef {{ id: string, recipes: PresetRecipe[] }} MenuPresetPack
 */

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
];
