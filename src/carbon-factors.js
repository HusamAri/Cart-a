// Carta — cradle-to-retail-ish GHG intensity proxy (kg CO2e per kg ingredient mass)
// Simplified tiered factors informed by Poore & Nemecek (Science, 2018) medians
// and FAO/Our World in Data snapshots. Not a full LCA; for menu comparison only.
import { lookupNutrient, nutrientCategoryId, turkNorm } from './nutrient-db.js';

function meatKgCo2ePerKg(keyNorm) {
  const n = keyNorm;
  if (n.includes('kuzu')) return 48;
  if (n.includes('dana') || n.includes('kiyma') || n.includes('antrikot') || n.includes('bonfile')
    || (n.includes('but') && n.includes('dana')) || n.includes('kavurma')) return 55;
  if (n.includes('tavuk') || n.includes('hindi') || n.includes('bildircin')) return 6.5;
  if (n.includes('ordek')) return 10;
  if (n.includes('jambon') || n.includes('bacon')) return 12;
  if (n.includes('sucuk') || n.includes('salam') || n.includes('sosis') || n.includes('pastirma') || n.includes('doner')) return 16;
  return 28;
}

function seafoodKgCo2ePerKg(keyNorm) {
  const n = keyNorm;
  if (n.includes('karides')) return 12;
  if (n.includes('midye') || n.includes('istiridye')) return 6;
  if (n.includes('somon') || n.includes('ton') || n.includes('fume')) return 7;
  if (n.includes('hamsi') || n.includes('sardalya') || n.includes('mezgit')) return 3.5;
  return 5.5;
}

function dairyKgCo2ePerKg(keyNorm) {
  const n = keyNorm;
  if (n.includes('yumurta')) return 4.5;
  if (n.includes('tereyag') || n.includes('kaymak')) return 24;
  if (n.includes('peynir') || n.includes('mozzarella') || n.includes('parmesan') || n.includes('ricotta')
    || n.includes('feta') || n.includes('gorgonzola') || n.includes('brie') || n.includes('camembert')
    || n.includes('cheddar') || n.includes('tulum') || n.includes('ezine') || n.includes('lor peyn')
    || n.includes('mascarpone') || n.includes('labne') || n.includes('cokelek')) return 18;
  if (n.includes('sut') || n.includes('yogurt') || n.includes('ayran') || n.includes('kefir')) return 3.4;
  if (n.includes('krema')) return 7;
  return 8;
}

function grainsKgCo2ePerKg(keyNorm) {
  if (keyNorm.includes('pirinc')) return 4;
  if (keyNorm.includes('misir') && keyNorm.includes('un')) return 2;
  return 1.8;
}

function intensityForResolvedKey(category, key) {
  const n = turkNorm(key);
  switch (category) {
    case 'meat': return meatKgCo2ePerKg(n);
    case 'seafood': return seafoodKgCo2ePerKg(n);
    case 'dairy': return dairyKgCo2ePerKg(n);
    case 'legumes': return 1.1;
    case 'grains': return grainsKgCo2ePerKg(n);
    case 'vegetables': return 0.9;
    case 'fruits': return 1.0;
    case 'oils': return 6;
    case 'nuts': return 2.5;
    case 'condiments': return 2;
    case 'beverages': return 1.2;
    case 'bakery': return 2.4;
    default: {
      const n = turkNorm(key);
      if (n.includes('barbunya') || n.includes('borulce') || n.includes('kuru bezelye')
        || n.includes('soya fasulyesi') || n === 'tofu') return 1.3;
      return 3;
    }
  }
}

function heuristicUnknown(nameNorm) {
  const n = nameNorm;
  if (!n) return 3;
  if (n.includes('dana') || n.includes('kuzu') || n.includes('kiyma') || n.includes('et ')) return 50;
  if (n.includes('tavuk') || n.includes('hindi')) return 6.5;
  if (n.includes('balik') || n.includes('somon') || n.includes('levrek')) return 5.5;
  if (n.includes('peynir') || n.includes('tereyag')) return 18;
  if (n.includes('pirinc')) return 4;
  if (n.includes('mercimek') || n.includes('nohut') || n.includes('fasulye')) return 1.1;
  return 3;
}

/** kg CO2e per kg of ingredient (mass as used in recipe after unit conversion). */
export function emissionIntensityKgCo2ePerKg(ingredientName) {
  const hit = lookupNutrient(ingredientName);
  if (hit) {
    const cat = nutrientCategoryId(hit.key, hit);
    return intensityForResolvedKey(cat, hit.key);
  }
  return heuristicUnknown(turkNorm(ingredientName));
}
