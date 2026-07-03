/**
 * World of Pigeon's - Breeds Database
 * 4 Core "Gilded Heritage" Turkish pigeon breeds.
 */
window.BreedsDB = {
  breeds: {
    // 1. Hünkâri (Klasik Manisa) - SSR
    hunkari: {
      id: 'hunkari',
      nameKey: 'breed.hunkari',
      name: 'Hünkâri (Klasik Manisa)',
      origin: 'Osmanlı Sarayı (Manisa)',
      family: 'ornamental',
      tier: 'SSR',
      baseGrade: 'SSR',
      rarity: 'mythic',
      stats: {
        tumble:     { base: 10, cap: 25 },
        spinSpeed:  { base: 10, cap: 25 },
        style:      { base: 60, cap: 100 },
        balance:    { base: 30, cap: 60 },
        endurance:  { base: 15, cap: 40 },
        flockSync:  { base: 20, cap: 45 }
      },
      physical: {
        bodyLength: { min: 25, max: 29, unit: 'cm' },
        weight:     { min: 240, max: 310, unit: 'g' },
        wingspan:   { min: 50, max: 58, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'short-thick', // Kısa ve kalın, dengeli
        featheredFeet: true,     // Gür paçalı
        crest: true,             // İğne tepesi
        chestFrill: true         // Göğüs gülü
      },
      colors: ['pearl_white', 'royal_red', 'silver', 'black_lace'],
      patterns: ['blondinette', 'satinette', 'lace', 'self'],
      temperament: {
        courage: 30,
        loyaltyBase: 80,
        aggressiveness: 10,
        learningSpeed: 0.04
      },
      roles: ['ornamental', 'prestige_bird', 'collection_crown'],
      breedingRates: { eggLay: 0.55, hatch: 0.50, qualityChance: 0.45 },
      description: 'Sarayın Hediyesi. Osmanlı sarayının özel üretimi. Göğüs gülü, iğne tepesi ve zarif kafa yapısıyla süs ve prestij odağı.'
    },

    // 2. Bursa Oynarı - S
    bursa_oynari: {
      id: 'bursa_oynari',
      nameKey: 'breed.bursa_oynari',
      name: 'Bursa Oynarı',
      origin: 'Bursa',
      family: 'tumbler',
      tier: 'S',
      baseGrade: 'S',
      rarity: 'epic',
      stats: {
        tumble:     { base: 45, cap: 85 },
        spinSpeed:  { base: 40, cap: 75 },
        style:      { base: 35, cap: 70 },
        balance:    { base: 40, cap: 80 },
        endurance:  { base: 50, cap: 90 },
        flockSync:  { base: 15, cap: 35 } // Sürüye katılmaz, yalnız uçar
      },
      physical: {
        bodyLength: { min: 28, max: 33, unit: 'cm' },
        weight:     { min: 280, max: 360, unit: 'g' },
        wingspan:   { min: 60, max: 70, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false, // Paçasız
        crest: false,
        chestFrill: false
      },
      colors: ['black_and_white', 'pure_black', 'pure_white'],
      patterns: ['solid_with_white_flights', 'self'],
      temperament: {
        courage: 85,
        loyaltyBase: 60,
        aggressiveness: 60,
        learningSpeed: 0.07
      },
      roles: ['solo_flyer', 'tumbler', 'endurance'],
      breedingRates: { eggLay: 0.75, hatch: 0.70, qualityChance: 0.25 },
      description: 'Yalnız Usta. 600 yıllık geçmiş. Siyah-beyaz asalet. Geniş göğüs, paçasız ayaklar. Sürüye katılmaz, tek başına sert ve yüksek uçuş sergiler.'
    },

    // 3. Şebap (Kostüm) - SSR
    sebap: {
      id: 'sebap',
      nameKey: 'breed.sebap',
      name: 'Şebap',
      origin: 'Türkiye (Güneydoğu)',
      family: 'ornamental',
      tier: 'SSR',
      baseGrade: 'SSR',
      rarity: 'mythic',
      stats: {
        tumble:     { base: 20, cap: 45 },
        spinSpeed:  { base: 15, cap: 35 },
        style:      { base: 65, cap: 100 },
        balance:    { base: 45, cap: 85 },
        endurance:  { base: 25, cap: 55 },
        flockSync:  { base: 25, cap: 55 }
      },
      physical: {
        bodyLength: { min: 32, max: 38, unit: 'cm' },
        weight:     { min: 350, max: 450, unit: 'g' },
        wingspan:   { min: 65, max: 75, unit: 'cm' },
        tailFeathers: 14,
        beakType: 'medium',
        featheredFeet: true, // İhtişamlı paçalar
        crest: true,
        chestFrill: false
      },
      colors: ['miski', 'kurenk', 'cakmakli', 'kures_black'],
      patterns: ['laced', 'solid_color', 'kostum'],
      temperament: {
        courage: 45,
        loyaltyBase: 75,
        aggressiveness: 20,
        learningSpeed: 0.05
      },
      roles: ['show_bird', 'ornamental', 'prestige_bird'],
      breedingRates: { eggLay: 0.60, hatch: 0.50, qualityChance: 0.35 },
      description: 'Güzellik Kraliçesi. Kusursuz simetri. İhtişamlı paçalar ve orantılı irilik. Kalite kontrolü en zor olan ırk.'
    },

    // 4. Diyarbakır - S
    diyarbakir: {
      id: 'diyarbakir',
      nameKey: 'breed.diyarbakir',
      name: 'Diyarbakır',
      origin: 'Diyarbakır',
      family: 'highflyer',
      tier: 'S',
      baseGrade: 'S',
      rarity: 'epic',
      stats: {
        tumble:     { base: 35, cap: 65 },
        spinSpeed:  { base: 30, cap: 60 },
        style:      { base: 55, cap: 90 },
        balance:    { base: 50, cap: 85 },
        endurance:  { base: 45, cap: 80 },
        flockSync:  { base: 40, cap: 75 }
      },
      physical: {
        bodyLength: { min: 30, max: 35, unit: 'cm' },
        weight:     { min: 300, max: 380, unit: 'g' },
        wingspan:   { min: 62, max: 72, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'short-white', // Bembeyaz gaga
        featheredFeet: true, // Kat kat paça
        crest: true, // Kenkül (Şapka)
        chestFrill: false
      },
      colors: ['cigeri_red', 'narinci', 'bozak', 'icagli', 'zengo', 'yusufi'],
      patterns: ['solid_with_benk', 'gradient'],
      temperament: {
        courage: 65,
        loyaltyBase: 65,
        aggressiveness: 30,
        learningSpeed: 0.06
      },
      roles: ['highflyer', 'show_bird', 'genetic_puzzle'],
      breedingRates: { eggLay: 0.70, hatch: 0.65, qualityChance: 0.30 },
      description: 'Gökyüzü Tuvali. Form ve renk cümbüşü. Başta kenkül, yanaklarda benk. Form ve uçuşun dengesi.'
    }
  },

  getAllBreeds: function() { return Object.values(this.breeds); },
  getBreed: function(id) { return this.breeds[id] || null; },
  getBreedsByFamily: function(family) { return Object.values(this.breeds).filter(b => b.family === family); },
  getBreedsByTier: function(tier) { return Object.values(this.breeds).filter(b => b.tier === tier); },
  getAllBreedIds: function() { return Object.keys(this.breeds); },
  getTierOrder: function() { return ['B', 'B+', 'A', 'A+', 'S', 'SS', 'SSR']; },
  getTierColor: function(tier) {
    var colors = {
      'B':   '#6b7280',   
      'B+':  '#4b5563',   
      'A':   '#059669',   
      'A+':  '#2563eb',   
      'S':   '#7c3aed',   
      'SS':  '#ea580c',   
      'SSR': 'linear-gradient(135deg, #dc2626, #d97706, #dc2626)'    
    };
    return colors[tier] || '#000000';
  }
};
