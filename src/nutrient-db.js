// Carta — Minimal nutrient reference DB
// Values per 100g edible portion. Aligned with Turkish Food Codex Ek-10
// (Türk Gıda Kodeksi · Beslenme Tabelası Yönetmeliği, Ek-10).
// Macros in grams. Energy is computed via Atwater factors at runtime.
//
// This is a starter set (~70 items) covering common professional kitchen
// ingredients. Users can add custom ingredients via the Cost Ledger module.

export const NUTRIENT_DB = {
  // ---- Eggs & Dairy ----
  'yumurta':           { P: 12.5, F: 10.5, C: 0.7,  Fi: 0,   allergens: ['egg'] },
  'tavuk yumurtası':   { P: 12.5, F: 10.5, C: 0.7,  Fi: 0,   allergens: ['egg'] },
  'süt':               { P: 3.3,  F: 3.7,  C: 4.7,  Fi: 0,   allergens: ['milk'] },
  'yarım yağlı süt':   { P: 3.4,  F: 1.7,  C: 4.8,  Fi: 0,   allergens: ['milk'] },
  'yağsız süt':        { P: 3.5,  F: 0.2,  C: 4.9,  Fi: 0,   allergens: ['milk'] },
  'tereyağı':          { P: 0.85, F: 81.1, C: 0.06, Fi: 0,   allergens: ['milk'] },
  'krema':             { P: 2.3,  F: 35.0, C: 3.4,  Fi: 0,   allergens: ['milk'] },
  'yoğurt':            { P: 3.5,  F: 3.3,  C: 4.7,  Fi: 0,   allergens: ['milk'] },
  'süzme yoğurt':      { P: 9.5,  F: 9.0,  C: 3.6,  Fi: 0,   allergens: ['milk'] },
  'beyaz peynir':      { P: 14.5, F: 25.0, C: 4.0,  Fi: 0,   allergens: ['milk'] },
  'kaşar peyniri':     { P: 25.0, F: 27.0, C: 1.4,  Fi: 0,   allergens: ['milk'] },
  'parmesan':          { P: 35.8, F: 28.4, C: 3.2,  Fi: 0,   allergens: ['milk'] },
  'mozzarella':        { P: 22.2, F: 22.4, C: 2.2,  Fi: 0,   allergens: ['milk'] },

  // ---- Meat & Poultry ----
  'tavuk göğsü':       { P: 23.0, F: 1.2,  C: 0,    Fi: 0,   allergens: [] },
  'tavuk but':         { P: 17.0, F: 9.0,  C: 0,    Fi: 0,   allergens: [] },
  'dana eti':          { P: 21.5, F: 12.5, C: 0,    Fi: 0,   allergens: [] },
  'kıyma':             { P: 18.0, F: 20.0, C: 0,    Fi: 0,   allergens: [] },
  'kuzu eti':          { P: 20.0, F: 17.0, C: 0,    Fi: 0,   allergens: [] },
  'hindi göğsü':       { P: 24.0, F: 1.0,  C: 0,    Fi: 0,   allergens: [] },
  'pastırma':          { P: 30.0, F: 18.0, C: 0,    Fi: 0,   allergens: [] },
  'sucuk':             { P: 18.0, F: 35.0, C: 1.0,  Fi: 0,   allergens: [] },
  'jambon':            { P: 22.0, F: 6.0,  C: 1.0,  Fi: 0,   allergens: [] },

  // ---- Fish & Seafood ----
  'somon':             { P: 20.5, F: 13.4, C: 0,    Fi: 0,   allergens: ['fish'] },
  'levrek':            { P: 18.5, F: 2.5,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'çipura':            { P: 19.0, F: 6.5,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'hamsi':             { P: 20.4, F: 4.8,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'ton balığı':        { P: 25.0, F: 1.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'karides':           { P: 20.0, F: 1.7,  C: 0.3,  Fi: 0,   allergens: ['crustacean'] },
  'kalamar':           { P: 15.6, F: 1.4,  C: 3.1,  Fi: 0,   allergens: ['mollusk'] },
  'midye':             { P: 12.0, F: 2.0,  C: 3.7,  Fi: 0,   allergens: ['mollusk'] },

  // ---- Grains / Cereals ----
  'pirinç':            { P: 7.1,  F: 0.7,  C: 79.0, Fi: 1.3, allergens: [] },
  'bulgur':            { P: 12.3, F: 1.3,  C: 75.9, Fi: 12.5, allergens: ['gluten'] },
  'makarna':           { P: 12.5, F: 1.5,  C: 75.0, Fi: 3.2, allergens: ['gluten'] },
  'ekmek':             { P: 8.5,  F: 1.2,  C: 49.0, Fi: 2.7, allergens: ['gluten'] },
  'tam buğday ekmeği': { P: 10.0, F: 2.5,  C: 41.0, Fi: 7.0, allergens: ['gluten'] },
  'un':                { P: 10.0, F: 1.0,  C: 76.0, Fi: 2.7, allergens: ['gluten'] },
  'yulaf':             { P: 13.0, F: 7.0,  C: 67.0, Fi: 10.0, allergens: ['gluten'] },
  'mısır':             { P: 3.4,  F: 1.5,  C: 19.0, Fi: 2.7, allergens: [] },

  // ---- Legumes ----
  'mercimek':          { P: 24.6, F: 1.1,  C: 60.0, Fi: 10.7, allergens: [] },
  'nohut':             { P: 19.3, F: 6.0,  C: 61.0, Fi: 17.4, allergens: [] },
  'kuru fasulye':      { P: 21.0, F: 1.5,  C: 60.0, Fi: 15.0, allergens: [] },

  // ---- Vegetables ----
  'domates':           { P: 0.9,  F: 0.2,  C: 3.9,  Fi: 1.2, allergens: [] },
  'salatalık':         { P: 0.6,  F: 0.1,  C: 3.6,  Fi: 0.5, allergens: [] },
  'soğan':             { P: 1.1,  F: 0.1,  C: 9.3,  Fi: 1.7, allergens: [] },
  'sarımsak':          { P: 6.4,  F: 0.5,  C: 33.0, Fi: 2.1, allergens: [] },
  'patates':           { P: 2.0,  F: 0.1,  C: 17.0, Fi: 2.2, allergens: [] },
  'havuç':             { P: 0.9,  F: 0.2,  C: 9.6,  Fi: 2.8, allergens: [] },
  'kabak':             { P: 1.2,  F: 0.3,  C: 3.1,  Fi: 1.0, allergens: [] },
  'patlıcan':          { P: 1.0,  F: 0.2,  C: 5.9,  Fi: 3.0, allergens: [] },
  'biber':             { P: 1.0,  F: 0.3,  C: 6.0,  Fi: 2.1, allergens: [] },
  'ıspanak':           { P: 2.9,  F: 0.4,  C: 3.6,  Fi: 2.2, allergens: [] },
  'marul':             { P: 1.4,  F: 0.2,  C: 2.9,  Fi: 1.3, allergens: [] },
  'roka':              { P: 2.6,  F: 0.7,  C: 3.7,  Fi: 1.6, allergens: [] },
  'maydanoz':          { P: 3.0,  F: 0.8,  C: 6.3,  Fi: 3.3, allergens: [] },
  'mantar':            { P: 3.1,  F: 0.3,  C: 3.3,  Fi: 1.0, allergens: [] },
  'fesleğen':          { P: 3.2,  F: 0.6,  C: 2.7,  Fi: 1.6, allergens: [] },

  // ---- Fruits ----
  'elma':              { P: 0.3,  F: 0.2,  C: 14.0, Fi: 2.4, allergens: [] },
  'limon':             { P: 1.1,  F: 0.3,  C: 9.3,  Fi: 2.8, allergens: [] },
  'portakal':          { P: 0.9,  F: 0.1,  C: 12.0, Fi: 2.4, allergens: [] },
  'muz':               { P: 1.1,  F: 0.3,  C: 23.0, Fi: 2.6, allergens: [] },
  'çilek':             { P: 0.7,  F: 0.3,  C: 7.7,  Fi: 2.0, allergens: [] },

  // ---- Oils & Fats ----
  'zeytinyağı':        { P: 0,    F: 100.0, C: 0,   Fi: 0,   allergens: [] },
  'ayçiçek yağı':      { P: 0,    F: 100.0, C: 0,   Fi: 0,   allergens: [] },
  'tereyağı (eritilmiş)': { P: 0.3, F: 99.5, C: 0,  Fi: 0,   allergens: ['milk'] },

  // ---- Nuts / Seeds ----
  'ceviz':             { P: 15.0, F: 65.0, C: 14.0, Fi: 6.7, allergens: ['nuts'] },
  'badem':             { P: 21.0, F: 50.0, C: 22.0, Fi: 12.5, allergens: ['nuts'] },
  'fındık':            { P: 15.0, F: 61.0, C: 17.0, Fi: 9.7, allergens: ['nuts'] },
  'antep fıstığı':     { P: 20.0, F: 45.0, C: 28.0, Fi: 10.6, allergens: ['nuts'] },
  'susam':             { P: 18.0, F: 50.0, C: 23.0, Fi: 12.0, allergens: ['sesame'] },

  // ---- Sugar & Condiments ----
  'şeker':             { P: 0,    F: 0,    C: 100.0, Fi: 0,  allergens: [] },
  'bal':               { P: 0.3,  F: 0,    C: 82.0, Fi: 0.2, allergens: [] },
  'tuz':               { P: 0,    F: 0,    C: 0,    Fi: 0,   allergens: [] },
  'sirke':             { P: 0,    F: 0,    C: 0.9,  Fi: 0,   allergens: [] },
  'soya sosu':         { P: 8.0,  F: 0,    C: 5.5,  Fi: 0.8, allergens: ['soya', 'gluten'] },

  // ---- Beverages (alcohol uses ethanol field) ----
  'su':                { P: 0,    F: 0,    C: 0,    Fi: 0,   allergens: [] },
  'şarap (kırmızı)':   { P: 0.1,  F: 0,    C: 2.6,  Fi: 0,   ethanol: 10.6, allergens: ['sulphite'] },
  'şarap (beyaz)':     { P: 0.1,  F: 0,    C: 2.6,  Fi: 0,   ethanol: 9.8,  allergens: ['sulphite'] },
  'bira':              { P: 0.5,  F: 0,    C: 3.6,  Fi: 0,   ethanol: 4.6,  allergens: ['gluten'] },
  'vodka':             { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 31.0, allergens: [] },
  'rakı':              { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 35.0, allergens: [] },

  // ============ EXPANSION (Phase 2) ============

  // ---- Dairy (extended) ----
  'kefir':             { P: 3.3,  F: 1.0,  C: 4.7,  Fi: 0,   allergens: ['milk'] },
  'ayran':             { P: 1.7,  F: 1.8,  C: 2.4,  Fi: 0,   allergens: ['milk'] },
  'lor peyniri':       { P: 18.0, F: 4.5,  C: 3.5,  Fi: 0,   allergens: ['milk'] },
  'çökelek':           { P: 21.0, F: 6.0,  C: 3.0,  Fi: 0,   allergens: ['milk'] },
  'ricotta':           { P: 11.0, F: 13.0, C: 3.0,  Fi: 0,   allergens: ['milk'] },
  'feta':              { P: 14.2, F: 21.3, C: 4.1,  Fi: 0,   allergens: ['milk'] },
  'gorgonzola':        { P: 19.0, F: 32.0, C: 0.5,  Fi: 0,   allergens: ['milk'] },
  'brie':              { P: 20.8, F: 27.7, C: 0.5,  Fi: 0,   allergens: ['milk'] },
  'camembert':         { P: 19.8, F: 24.3, C: 0.5,  Fi: 0,   allergens: ['milk'] },
  'cheddar':           { P: 25.0, F: 33.1, C: 1.3,  Fi: 0,   allergens: ['milk'] },
  'mascarpone':        { P: 4.8,  F: 44.0, C: 4.0,  Fi: 0,   allergens: ['milk'] },
  'kaymak':            { P: 2.6,  F: 60.0, C: 3.0,  Fi: 0,   allergens: ['milk'] },
  'labne':             { P: 8.0,  F: 22.0, C: 4.0,  Fi: 0,   allergens: ['milk'] },
  'tulum peyniri':     { P: 22.0, F: 30.0, C: 2.5,  Fi: 0,   allergens: ['milk'] },
  'ezine peyniri':     { P: 16.0, F: 23.0, C: 3.0,  Fi: 0,   allergens: ['milk'] },

  // ---- Meat & poultry (extended) ----
  'dana antrikot':     { P: 20.5, F: 15.0, C: 0,    Fi: 0,   allergens: [] },
  'dana bonfile':      { P: 22.0, F: 7.5,  C: 0,    Fi: 0,   allergens: [] },
  'dana but':          { P: 21.0, F: 8.0,  C: 0,    Fi: 0,   allergens: [] },
  'dana pirzola':      { P: 19.5, F: 12.0, C: 0,    Fi: 0,   allergens: [] },
  'kuzu pirzola':      { P: 17.0, F: 21.0, C: 0,    Fi: 0,   allergens: [] },
  'kuzu but':          { P: 19.0, F: 14.0, C: 0,    Fi: 0,   allergens: [] },
  'kuzu kıyma':        { P: 17.0, F: 23.0, C: 0,    Fi: 0,   allergens: [] },
  'kavurma':           { P: 30.0, F: 35.0, C: 0,    Fi: 0,   allergens: [] },
  'döner':             { P: 19.0, F: 18.0, C: 1.0,  Fi: 0,   allergens: [] },
  'tavuk kanat':       { P: 18.0, F: 13.0, C: 0,    Fi: 0,   allergens: [] },
  'tavuk bonfile':     { P: 23.5, F: 0.9,  C: 0,    Fi: 0,   allergens: [] },
  'hindi but':         { P: 18.5, F: 7.0,  C: 0,    Fi: 0,   allergens: [] },
  'ördek göğsü':       { P: 19.5, F: 11.0, C: 0,    Fi: 0,   allergens: [] },
  'bıldırcın':         { P: 22.0, F: 12.0, C: 0,    Fi: 0,   allergens: [] },
  'salam':             { P: 13.0, F: 22.0, C: 1.5,  Fi: 0,   allergens: [] },
  'sosis':             { P: 12.0, F: 25.0, C: 2.0,  Fi: 0,   allergens: [] },
  'prosciutto':        { P: 26.0, F: 12.0, C: 0,    Fi: 0,   allergens: [] },
  'bacon':             { P: 13.0, F: 42.0, C: 1.4,  Fi: 0,   allergens: [] },
  'salam (dana)':      { P: 16.0, F: 20.0, C: 1.0,  Fi: 0,   allergens: [] },

  // ---- Fish & seafood (extended) ----
  'palamut':           { P: 22.5, F: 9.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'lüfer':             { P: 20.0, F: 6.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'kefal':             { P: 19.0, F: 6.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'çinekop':           { P: 20.0, F: 5.5,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'mezgit':            { P: 18.0, F: 0.9,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'barbun':            { P: 19.0, F: 4.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'uskumru':           { P: 18.6, F: 13.9, C: 0,    Fi: 0,   allergens: ['fish'] },
  'sardalya':          { P: 19.8, F: 11.5, C: 0,    Fi: 0,   allergens: ['fish'] },
  'kalkan':            { P: 16.0, F: 1.5,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'morina':            { P: 17.8, F: 0.7,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'fume somon':        { P: 22.0, F: 4.0,  C: 0,    Fi: 0,   allergens: ['fish'] },
  'ahtapot':           { P: 14.9, F: 1.0,  C: 2.2,  Fi: 0,   allergens: ['mollusk'] },
  'istiridye':         { P: 9.0,  F: 2.5,  C: 4.0,  Fi: 0,   allergens: ['mollusk'] },
  'tarak':             { P: 12.0, F: 0.8,  C: 3.2,  Fi: 0,   allergens: ['mollusk'] },
  'havyar':            { P: 25.0, F: 18.0, C: 4.0,  Fi: 0,   allergens: ['fish'] },

  // ---- Vegetables (extended) ----
  'kereviz':           { P: 0.7,  F: 0.2,  C: 3.0,  Fi: 1.6, allergens: ['celery'] },
  'kereviz sapı':      { P: 0.7,  F: 0.2,  C: 3.0,  Fi: 1.6, allergens: ['celery'] },
  'brokoli':           { P: 2.8,  F: 0.4,  C: 7.0,  Fi: 2.6, allergens: [] },
  'karnabahar':        { P: 1.9,  F: 0.3,  C: 5.0,  Fi: 2.0, allergens: [] },
  'lahana':            { P: 1.3,  F: 0.1,  C: 5.8,  Fi: 2.5, allergens: [] },
  'kırmızı lahana':    { P: 1.4,  F: 0.2,  C: 7.4,  Fi: 2.1, allergens: [] },
  'pırasa':            { P: 1.5,  F: 0.3,  C: 14.0, Fi: 1.8, allergens: [] },
  'taze fasulye':      { P: 1.8,  F: 0.2,  C: 7.0,  Fi: 3.4, allergens: [] },
  'bezelye':           { P: 5.4,  F: 0.4,  C: 14.5, Fi: 5.1, allergens: [] },
  'bamya':             { P: 1.9,  F: 0.2,  C: 7.5,  Fi: 3.2, allergens: [] },
  'enginar':           { P: 3.3,  F: 0.2,  C: 11.0, Fi: 5.4, allergens: [] },
  'pancar':            { P: 1.6,  F: 0.2,  C: 9.6,  Fi: 2.8, allergens: [] },
  'rezene':            { P: 1.2,  F: 0.2,  C: 7.3,  Fi: 3.1, allergens: [] },
  'turp':              { P: 0.7,  F: 0.1,  C: 3.4,  Fi: 1.6, allergens: [] },
  'şalgam':            { P: 0.9,  F: 0.1,  C: 6.4,  Fi: 1.8, allergens: [] },
  'taze soğan':        { P: 1.8,  F: 0.5,  C: 7.3,  Fi: 2.6, allergens: [] },
  'arpacık soğan':     { P: 2.5,  F: 0.1,  C: 16.8, Fi: 3.2, allergens: [] },
  'dereotu':           { P: 3.5,  F: 1.1,  C: 7.0,  Fi: 2.1, allergens: [] },
  'nane':              { P: 3.7,  F: 0.9,  C: 8.4,  Fi: 6.8, allergens: [] },
  'kişniş':            { P: 2.1,  F: 0.5,  C: 3.7,  Fi: 2.8, allergens: [] },
  'taze kekik':        { P: 5.5,  F: 1.7,  C: 24.5, Fi: 14.0, allergens: [] },
  'taze sarımsak':     { P: 3.5,  F: 0.6,  C: 8.0,  Fi: 1.2, allergens: [] },

  // ---- Fruits (extended) ----
  'armut':             { P: 0.4,  F: 0.1,  C: 15.2, Fi: 3.1, allergens: [] },
  'kiraz':             { P: 1.1,  F: 0.2,  C: 16.0, Fi: 2.1, allergens: [] },
  'vişne':             { P: 1.0,  F: 0.3,  C: 12.2, Fi: 1.6, allergens: [] },
  'kayısı':            { P: 1.4,  F: 0.4,  C: 11.1, Fi: 2.0, allergens: [] },
  'şeftali':           { P: 0.9,  F: 0.3,  C: 9.5,  Fi: 1.5, allergens: [] },
  'üzüm':              { P: 0.7,  F: 0.2,  C: 18.1, Fi: 0.9, allergens: [] },
  'incir':             { P: 0.8,  F: 0.3,  C: 19.2, Fi: 2.9, allergens: [] },
  'nar':               { P: 1.7,  F: 1.2,  C: 18.7, Fi: 4.0, allergens: [] },
  'ananas':            { P: 0.5,  F: 0.1,  C: 13.1, Fi: 1.4, allergens: [] },
  'mango':             { P: 0.8,  F: 0.4,  C: 15.0, Fi: 1.6, allergens: [] },
  'avokado':           { P: 2.0,  F: 14.7, C: 8.5,  Fi: 6.7, allergens: [] },
  'kavun':             { P: 0.8,  F: 0.2,  C: 8.2,  Fi: 0.9, allergens: [] },
  'karpuz':            { P: 0.6,  F: 0.2,  C: 7.6,  Fi: 0.4, allergens: [] },
  'kuru üzüm':         { P: 3.1,  F: 0.5,  C: 79.0, Fi: 3.7, allergens: [] },
  'kuru kayısı':       { P: 3.4,  F: 0.5,  C: 63.0, Fi: 7.3, allergens: [] },
  'hurma':             { P: 1.8,  F: 0.2,  C: 75.0, Fi: 6.7, allergens: [] },

  // ---- Grains (extended) ----
  'kuskus':            { P: 12.8, F: 0.6,  C: 72.0, Fi: 5.0, allergens: ['gluten'] },
  'irmik':             { P: 12.7, F: 1.1,  C: 73.0, Fi: 3.9, allergens: ['gluten'] },
  'tarhana':           { P: 14.0, F: 2.0,  C: 60.0, Fi: 4.5, allergens: ['gluten','milk'] },
  'mantı':             { P: 14.0, F: 5.0,  C: 50.0, Fi: 2.0, allergens: ['gluten','egg'] },
  'kepekli un':        { P: 13.2, F: 2.5,  C: 71.0, Fi: 10.7, allergens: ['gluten'] },
  'çavdar unu':        { P: 10.3, F: 1.6,  C: 76.0, Fi: 15.1, allergens: ['gluten'] },
  'mısır unu':         { P: 6.9,  F: 3.9,  C: 76.9, Fi: 7.3, allergens: [] },
  'pirinç (esmer)':    { P: 7.9,  F: 2.9,  C: 77.2, Fi: 3.5, allergens: [] },
  'kinoa':             { P: 14.1, F: 6.1,  C: 64.2, Fi: 7.0, allergens: [] },
  'simit':             { P: 9.5,  F: 5.0,  C: 55.0, Fi: 3.0, allergens: ['gluten','sesame'] },
  'pide ekmek':        { P: 9.0,  F: 1.5,  C: 50.0, Fi: 2.5, allergens: ['gluten'] },
  'lavaş':             { P: 9.2,  F: 1.5,  C: 53.0, Fi: 2.0, allergens: ['gluten'] },

  // ---- Legumes (extended) ----
  'barbunya':          { P: 21.0, F: 1.5,  C: 60.0, Fi: 16.0, allergens: [] },
  'börülce':           { P: 24.0, F: 1.9,  C: 60.0, Fi: 11.0, allergens: [] },
  'kuru bezelye':      { P: 23.8, F: 1.2,  C: 60.0, Fi: 22.0, allergens: [] },
  'soya fasulyesi':    { P: 36.5, F: 19.9, C: 30.0, Fi: 9.3, allergens: ['soya'] },
  'tofu':              { P: 8.1,  F: 4.8,  C: 1.9,  Fi: 0.3, allergens: ['soya'] },

  // ---- Nuts / Seeds (extended) ----
  'yer fıstığı':       { P: 25.8, F: 49.2, C: 16.1, Fi: 8.5, allergens: ['peanut'] },
  'kaju':              { P: 18.2, F: 43.8, C: 30.2, Fi: 3.3, allergens: ['nuts'] },
  'çam fıstığı':       { P: 13.7, F: 68.4, C: 13.1, Fi: 3.7, allergens: ['nuts'] },
  'chia tohumu':       { P: 16.5, F: 30.7, C: 42.1, Fi: 34.4, allergens: [] },
  'keten tohumu':      { P: 18.3, F: 42.2, C: 28.9, Fi: 27.3, allergens: [] },
  'ay çekirdeği':      { P: 20.8, F: 51.5, C: 20.0, Fi: 8.6, allergens: [] },
  'kabak çekirdeği':   { P: 19.0, F: 49.0, C: 15.0, Fi: 6.0, allergens: [] },

  // ---- Oils & fats (extended) ----
  'hindistan cevizi yağı':{ P: 0,   F: 100.0, C: 0,   Fi: 0,   allergens: [] },
  'ceviz yağı':        { P: 0,    F: 100.0, C: 0,   Fi: 0,   allergens: ['nuts'] },
  'fındık yağı':       { P: 0,    F: 100.0, C: 0,   Fi: 0,   allergens: ['nuts'] },
  'susam yağı':        { P: 0,    F: 100.0, C: 0,   Fi: 0,   allergens: ['sesame'] },
  'margarin':          { P: 0.2,  F: 80.0,  C: 0.7, Fi: 0,   allergens: [] },

  // ---- Sugar / Sweeteners ----
  'pekmez':            { P: 1.0,  F: 0,    C: 70.0, Fi: 0,   allergens: [] },
  'akçaağaç şurubu':   { P: 0,    F: 0.1,  C: 67.0, Fi: 0,   allergens: [] },
  'esmer şeker':       { P: 0,    F: 0,    C: 98.0, Fi: 0,   allergens: [] },
  'pudra şekeri':      { P: 0,    F: 0,    C: 100.0, Fi: 0,  allergens: [] },

  // ---- Spices (per 100g — usage typically very small) ----
  'karabiber':         { P: 10.4, F: 3.3,  C: 64.0, Fi: 26.5, allergens: [] },
  'pul biber':         { P: 12.0, F: 17.0, C: 56.0, Fi: 27.0, allergens: [] },
  'kekik (kuru)':      { P: 9.1,  F: 7.4,  C: 64.0, Fi: 37.0, allergens: [] },
  'sumak':             { P: 4.0,  F: 6.0,  C: 80.0, Fi: 12.0, allergens: [] },
  'kimyon':            { P: 17.8, F: 22.3, C: 44.2, Fi: 10.5, allergens: [] },
  'tarçın':            { P: 4.0,  F: 1.2,  C: 81.0, Fi: 53.0, allergens: [] },
  'zerdeçal':          { P: 7.8,  F: 9.9,  C: 65.0, Fi: 21.0, allergens: [] },
  'safran':            { P: 11.4, F: 5.9,  C: 65.4, Fi: 3.9, allergens: [] },
  'vanilya':           { P: 0.1,  F: 0.1,  C: 12.7, Fi: 0,   allergens: [] },
  'pul biber (acı)':   { P: 12.0, F: 17.3, C: 57.0, Fi: 27.0, allergens: [] },

  // ---- Condiments / sauces ----
  'mayonez':           { P: 1.0,  F: 75.0, C: 2.0,  Fi: 0,   allergens: ['egg','mustard'] },
  'ketçap':            { P: 1.0,  F: 0.2,  C: 26.0, Fi: 0.5, allergens: [] },
  'hardal':            { P: 4.4,  F: 4.0,  C: 5.3,  Fi: 3.3, allergens: ['mustard'] },
  'balzamik sirke':    { P: 0.5,  F: 0,    C: 17.0, Fi: 0,   allergens: ['sulphite'] },
  'elma sirkesi':      { P: 0,    F: 0,    C: 0.9,  Fi: 0,   allergens: ['sulphite'] },
  'beyaz şarap sirkesi':{ P: 0.04, F: 0,   C: 0.04, Fi: 0,   allergens: ['sulphite'] },
  'kırmızı şarap sirkesi':{P: 0.04,F: 0,   C: 0.27, Fi: 0,   allergens: ['sulphite'] },
  'tahin':             { P: 17.0, F: 53.8, C: 21.2, Fi: 9.3, allergens: ['sesame'] },
  'pesto':             { P: 4.5,  F: 41.0, C: 6.0,  Fi: 1.7, allergens: ['nuts','milk'] },
  'sriracha':          { P: 1.9,  F: 0.9,  C: 19.0, Fi: 2.2, allergens: [] },

  // ---- Stocks (concentrated, used in small volumes) ----
  'et suyu':           { P: 0.9,  F: 0.3,  C: 0.1,  Fi: 0,   allergens: [] },
  'tavuk suyu':        { P: 0.8,  F: 0.4,  C: 0.1,  Fi: 0,   allergens: [] },
  'balık suyu':        { P: 1.0,  F: 0.1,  C: 0.4,  Fi: 0,   allergens: ['fish'] },
  'sebze suyu':        { P: 0.4,  F: 0,    C: 1.5,  Fi: 0,   allergens: [] },

  // ---- Beverages (non-alcoholic) ----
  'kahve':             { P: 0.1,  F: 0,    C: 0,    Fi: 0,   allergens: [] },
  'espresso':          { P: 0.1,  F: 0.2,  C: 1.7,  Fi: 0,   allergens: [] },
  'siyah çay':         { P: 0,    F: 0,    C: 0.3,  Fi: 0,   allergens: [] },
  'yeşil çay':         { P: 0.2,  F: 0,    C: 0,    Fi: 0,   allergens: [] },
  'soda':              { P: 0,    F: 0,    C: 0,    Fi: 0,   allergens: [] },
  'limonata':          { P: 0.2,  F: 0,    C: 10.5, Fi: 0,   allergens: [] },
  'taze portakal suyu':{ P: 0.9,  F: 0.2,  C: 11.5, Fi: 0.2, allergens: [] },
  'kola':              { P: 0,    F: 0,    C: 10.6, Fi: 0,   allergens: [] },
  'salgam suyu':       { P: 1.0,  F: 0.2,  C: 5.0,  Fi: 1.0, allergens: [] },

  // ---- Alcohol (extended) ----
  'gin':               { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 31.0, allergens: [] },
  'viski':             { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 33.4, allergens: ['gluten'] },
  'tekila':            { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 31.0, allergens: [] },
  'rom':               { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 33.0, allergens: [] },
  'brandy':            { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 33.4, allergens: ['sulphite'] },
  'kanyak':            { P: 0,    F: 0,    C: 0,    Fi: 0,   ethanol: 33.4, allergens: ['sulphite'] },
  'prosecco':          { P: 0.4,  F: 0,    C: 2.7,  Fi: 0,   ethanol: 9.5,  allergens: ['sulphite'] },
  'şampanya':          { P: 0.4,  F: 0,    C: 1.4,  Fi: 0,   ethanol: 9.7,  allergens: ['sulphite'] },
  'vermut':            { P: 0,    F: 0,    C: 16.0, Fi: 0,   ethanol: 13.0, allergens: ['sulphite'] },
  'campari':           { P: 0,    F: 0,    C: 24.0, Fi: 0,   ethanol: 20.5, allergens: ['sulphite'] },
  'limoncello':        { P: 0,    F: 0,    C: 30.0, Fi: 0,   ethanol: 28.0, allergens: [] },
  'kombu':             { P: 0.5,  F: 0,    C: 1.2,  Fi: 0,   allergens: [] },

  // ---- Bakery / desserts (per 100g) ----
  'baklava':           { P: 4.5,  F: 24.0, C: 50.0, Fi: 2.0, allergens: ['gluten','nuts'] },
  'sütlaç':            { P: 4.0,  F: 4.5,  C: 24.0, Fi: 0.4, allergens: ['milk'] },
  'kazandibi':         { P: 4.2,  F: 5.0,  C: 23.0, Fi: 0,   allergens: ['milk'] },
  'künefe':            { P: 7.0,  F: 18.0, C: 35.0, Fi: 1.0, allergens: ['milk','gluten'] },
  'dondurma':          { P: 3.5,  F: 11.0, C: 23.0, Fi: 0.5, allergens: ['milk'] },
  'çikolata (bitter)': { P: 7.8,  F: 42.6, C: 45.9, Fi: 10.9, allergens: ['milk'] },
  'çikolata (sütlü)':  { P: 7.6,  F: 30.0, C: 60.0, Fi: 3.4, allergens: ['milk'] },
  'beyaz çikolata':    { P: 6.0,  F: 33.0, C: 59.0, Fi: 0,   allergens: ['milk'] },
};

// English dish-name hints for Auto-Name (sparse; unknown keys fall back to title-cased Turkish key)
export const NUTRIENT_EN = {
  'yumurta': 'Egg', 'tavuk yumurtası': 'Egg', 'süt': 'Milk', 'yarım yağlı süt': 'Semi-skimmed milk',
  'yağsız süt': 'Skim milk', 'tereyağı': 'Butter', 'krema': 'Cream', 'yoğurt': 'Yogurt',
  'süzme yoğurt': 'Strained yogurt', 'beyaz peynir': 'White cheese', 'kaşar peyniri': 'Kashkaval',
  'parmesan': 'Parmesan', 'mozzarella': 'Mozzarella', 'tavuk göğsü': 'Chicken breast', 'tavuk but': 'Chicken thigh',
  'dana eti': 'Beef', 'kıyma': 'Minced meat', 'kuzu eti': 'Lamb', 'hindi göğsü': 'Turkey breast',
  'pastırma': 'Pastrami', 'sucuk': 'Sucuk', 'jambon': 'Ham', 'somon': 'Salmon', 'levrek': 'Sea bass',
  'çipura': 'Sea bream', 'hamsi': 'Anchovy', 'ton balığı': 'Tuna', 'karides': 'Shrimp', 'kalamar': 'Squid',
  'midye': 'Mussel', 'pirinç': 'Rice', 'bulgur': 'Bulgur', 'makarna': 'Pasta', 'ekmek': 'Bread',
  'tam buğday ekmeği': 'Whole wheat bread', 'un': 'Flour', 'yulaf': 'Oats', 'mısır': 'Corn',
  'mercimek': 'Lentils', 'nohut': 'Chickpeas', 'kuru fasulye': 'White beans', 'domates': 'Tomato',
  'salatalık': 'Cucumber', 'soğan': 'Onion', 'sarımsak': 'Garlic', 'patates': 'Potato', 'havuç': 'Carrot',
  'kabak': 'Zucchini', 'patlıcan': 'Aubergine', 'biber': 'Pepper', 'ıspanak': 'Spinach', 'marul': 'Lettuce',
  'roka': 'Rocket', 'maydanoz': 'Parsley', 'mantar': 'Mushroom', 'fesleğen': 'Basil', 'elma': 'Apple',
  'limon': 'Lemon', 'portakal': 'Orange', 'muz': 'Banana', 'çilek': 'Strawberry', 'zeytinyağı': 'Olive oil',
  'ayçiçek yağı': 'Sunflower oil', 'tereyağı (eritilmiş)': 'Clarified butter', 'ceviz': 'Walnut',
  'badem': 'Almond', 'fındık': 'Hazelnut', 'antep fıstığı': 'Pistachio', 'susam': 'Sesame', 'şeker': 'Sugar',
  'bal': 'Honey', 'tuz': 'Salt', 'sirke': 'Vinegar', 'soya sosu': 'Soy sauce', 'su': 'Water',
  'şarap (kırmızı)': 'Red wine', 'şarap (beyaz)': 'White wine', 'bira': 'Beer', 'vodka': 'Vodka', 'rakı': 'Raki',
  'kefir': 'Kefir', 'ayran': 'Ayran', 'lor peyniri': 'Cottage cheese', 'çökelek': 'Curd cheese',
  'ricotta': 'Ricotta', 'feta': 'Feta', 'labne': 'Labneh', 'dana antrikot': 'Beef ribeye',
  'dana bonfile': 'Beef tenderloin', 'dana but': 'Beef shank', 'kuzu pirzola': 'Lamb chop',
  'kuzu but': 'Lamb leg', 'tavuk kanat': 'Chicken wing', 'tavuk bonfile': 'Chicken fillet',
  'döner': 'Doner', 'brokoli': 'Broccoli', 'karnabahar': 'Cauliflower', 'lahana': 'Cabbage',
  'kırmızı lahana': 'Red cabbage', 'kuskus': 'Couscous', 'irmik': 'Semolina', 'avokado': 'Avocado',
  'bıldırcın': 'Quail',
};

// Allergen catalog (14 EU categories + Türkiye additions)
export const ALLERGEN_LABELS = {
  gluten:     { en: 'Gluten',         tr: 'Glüten' },
  crustacean: { en: 'Crustaceans',    tr: 'Kabuklu deniz ürünleri' },
  egg:        { en: 'Egg',            tr: 'Yumurta' },
  fish:       { en: 'Fish',           tr: 'Balık' },
  peanut:     { en: 'Peanut',         tr: 'Yer fıstığı' },
  soya:       { en: 'Soya',           tr: 'Soya' },
  milk:       { en: 'Milk',           tr: 'Süt' },
  nuts:       { en: 'Tree nuts',      tr: 'Sert kabuklu yemişler' },
  celery:     { en: 'Celery',         tr: 'Kereviz' },
  mustard:    { en: 'Mustard',        tr: 'Hardal' },
  sesame:     { en: 'Sesame',         tr: 'Susam' },
  sulphite:   { en: 'Sulphites',      tr: 'Sülfit' },
  lupin:      { en: 'Lupin',          tr: 'Acı bakla' },
  mollusk:    { en: 'Molluscs',       tr: 'Yumuşakça' },
};

// Returns normalised lookup (Turkish-aware, accent-stripped, lowercase)
export function lookupNutrient(name) {
  if (!name) return null;
  const key = turkNorm(name);
  // Try exact match first
  for (const k in NUTRIENT_DB) {
    if (turkNorm(k) === key) return { key: k, ...NUTRIENT_DB[k] };
  }
  // Try contains
  for (const k in NUTRIENT_DB) {
    if (turkNorm(k).includes(key) || key.includes(turkNorm(k))) return { key: k, ...NUTRIENT_DB[k] };
  }
  return null;
}

// Suggest ingredients matching a query (for autocomplete)
export function suggestNutrients(query, limit = 8) {
  if (!query) return [];
  const q = turkNorm(query);
  const matches = [];
  for (const k in NUTRIENT_DB) {
    const nk = turkNorm(k);
    if (nk.startsWith(q)) matches.unshift(k);          // prefix match first
    else if (nk.includes(q)) matches.push(k);
  }
  return matches.slice(0, limit);
}

export function turkNorm(s) {
  return String(s||'')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ç/g,'c').replace(/ğ/g,'g')
    .replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
    .replace(/[^a-z0-9 ]/g,'').trim();
}

/** Browse order for ingredient DB chips (reference rows only; custom uses "custom"). */
export const ING_CATEGORY_ORDER = [
  'dairy', 'meat', 'seafood', 'grains', 'legumes', 'vegetables', 'fruits', 'oils', 'nuts', 'condiments', 'beverages', 'bakery', 'other',
];

/**
 * Reference category for UI filters (not persisted on NUTRIENT_DB rows).
 * Uses turkNorm-style ascii-ish tokens on the original Turkish key.
 */
export function nutrientCategoryId(key, row) {
  const n = turkNorm(key);
  const e = Number(row?.ethanol) || 0;
  if (e > 0) return 'beverages';

  if (n === 'su' || n.includes('ayran')) return 'beverages';
  if (n.includes('sarap') || n.includes('sampanya') || n.includes('prosecco') || n.includes('bira') || n.includes('votka')
    || n.includes('raki') || n.includes('cin') || n.includes('viski') || n.includes('rom') || n.includes('tekila')
    || n.includes('aperol') || n.includes('campari') || n.includes('vermut') || n.includes('kanyak') || n.includes('brandy')
    || n.includes('limoncello')) return 'beverages';

  if (n.includes('baklava') || n.includes('kunefe') || n.includes('sutlac') || n.includes('kazandibi') || n.includes('dondurma')
    || n.includes('cikolata')) return 'bakery';

  if (n.includes('mercimek') || n.includes('nohut') || n.includes('kuru fasulye')) return 'legumes';

  if (n.includes('pirinc') || n.includes('bulgur') || n.includes('makarna') || n.includes('ekmek') || n === 'un'
    || n.includes('yulaf') || n.includes('misir') || n.includes('kuskus') || n.includes('irmik') || n.includes('tarhana')
    || n.includes('manti')) return 'grains';

  if (n.includes('yumurta') || n.includes('peynir') || n.includes('yogurt') || n.includes('tereyag') || n.includes('krema')
    || n.includes('ricotta') || n.includes('mozzarella') || n.includes('parmesan') || n.includes('cokelek') || n.includes('lor peyn')
    || n.includes('feta') || n.includes('labne') || n.includes('mascarpone') || n.includes('gorgonzola') || n.includes('brie') || n.includes('camembert')
    || n.includes('cheddar') || n.includes('kaymak') || n.includes('tulum') || n.includes('ezine') || n.includes('suzme')
    || n.includes('kefir') || (n.includes('sut') && !n.includes('sutlac'))) return 'dairy';

  if (n.includes('tavuk') || n.includes('dana') || n.includes('kuzu') || n.includes('hindi') || n.includes('jambon')
    || n.includes('sucuk') || n.includes('pastirma') || n.includes('kiyma') || n.includes('doner') || n.includes('salam')
    || n.includes('sosis') || n.includes('bacon') || n.includes('prosciutto') || n.includes('bildircin') || n.includes('ordek')
    || n.includes('kavurma') || n.includes('antrikot') || n.includes('bonfile') || n.includes('pirzola')) return 'meat';

  if (n.includes('somon') || n.includes('levrek') || n.includes('cipura') || n.includes('hamsi') || n.includes('ton bal')
    || n.includes('karides') || n.includes('kalamar') || n.includes('midye') || n.includes('palamut') || n.includes('lufer')
    || n.includes('kefal') || n.includes('cinekop') || n.includes('mezgit') || n.includes('barbun') || n.includes('uskumru')
    || n.includes('sardalya') || n.includes('kalkan') || n.includes('morina') || n.includes('fume') || n.includes('ahtapot')
    || n.includes('istiridye') || n.includes('havyar') || n.includes('balik')) return 'seafood';

  if (n.includes('elma') || n.includes('limon') || n.includes('portakal') || n.includes('muz') || n.includes('cilek')
    || n.includes('armut') || n.includes('kiraz') || n.includes('visne') || n.includes('kayisi') || n.includes('seftali')
    || n.includes('uzum') || n.includes('incir') || n === 'nar' || n.includes('ananas') || n.includes('mango')
    || n.includes('avokado') || n.includes('kavun') || n.includes('karpuz') || n.includes('hurma')
    || n.includes('kuru uzum') || n.includes('kuru kayisi')) return 'fruits';

  if (n.includes('domates') || n.includes('salatalik') || n.includes('sogan') || n.includes('sarimsak') || n.includes('patates')
    || n.includes('havuc') || n.includes('kabak') || n.includes('patlican') || n.includes('biber') || n.includes('ispanak')
    || n.includes('marul') || n.includes('roka') || n.includes('maydanoz') || n.includes('mantar') || n.includes('feslegen')
    || n.includes('kereviz') || n.includes('brokoli') || n.includes('karnabahar') || n.includes('lahana') || n.includes('pirasa')
    || n.includes('taze fasulye') || n.includes('bezelye') || n.includes('bamya') || n.includes('enginar') || n.includes('pancar')
    || n.includes('rezene') || n.includes('turp') || n.includes('salgam') || n.includes('arpacik') || n.includes('dereotu')
    || n.includes('nane') || n.includes('kisnis') || n.includes('kekik') || n.includes('taze sogan')) return 'vegetables';

  if (n.includes('yag') || n.includes('zeytin')) return 'oils';

  if (n.includes('ceviz') || n.includes('badem') || n.includes('findik') || n.includes('fistigi') || n.includes('susam')) return 'nuts';

  if (n.includes('seker') || n.includes('bal') || n === 'tuz' || n.includes('sirke') || n.includes('soya')) return 'condiments';

  return 'other';
}
