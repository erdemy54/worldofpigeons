/**
 * World of Pigeon's - Breeds Database
 * 10 Turkish pigeon breeds with full stats, physical attributes, and helper methods
 */
window.BreedsDB = {
  breeds: {
    // ─────────────────────────────────────────────
    // 1. Türk Takacısı — B tier, common tumbler
    // ─────────────────────────────────────────────
    turk_taklacisi: {
      id: 'turk_taklacisi',
      nameKey: 'breed.turk_taklacisi',
      origin: 'Türkiye (Genel)',
      family: 'tumbler',
      tier: 'B',
      rarity: 'common',
      stats: {
        tumble:     { base: 30, cap: 65 },
        spinSpeed:  { base: 20, cap: 45 },
        style:      { base: 25, cap: 55 },
        balance:    { base: 35, cap: 70 },
        endurance:  { base: 28, cap: 60 },
        flockSync:  { base: 38, cap: 75 }
      },
      physical: {
        bodyLength: { min: 28, max: 31, unit: 'cm' },
        weight:     { min: 280, max: 350, unit: 'g' },
        wingspan:   { min: 58, max: 64, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'red', 'yellow', 'blue_bar', 'dun'],
      patterns: ['self', 'grizzle', 'bar', 'checker'],
      temperament: {
        courage: 55,
        loyaltyBase: 65,
        aggressiveness: 30,
        learningSpeed: 0.07
      },
      tricks: ['tumble', 'multi_tumble', 'tail_sit'],
      flightDuration: { min: 2.0, max: 4.5, unit: 'hours' },
      signatureMove: 'single_tumble',
      roles: ['starter', 'flock_member', 'tumbler', 'trainer_bird', 'breeder'],
      breedingRates: {
        eggLay: 0.85,
        hatch: 0.78,
        qualityChance: 0.10
      },
      soundProfile: {
        coo: 'standard_coo',
        alarm: 'short_burst',
        courtship: 'gentle_rumble'
      }
    },

    // ─────────────────────────────────────────────
    // 2. Sivas Takacısı — B+ tier, common tumbler
    // ─────────────────────────────────────────────
    sivas_taklacisi: {
      id: 'sivas_taklacisi',
      nameKey: 'breed.sivas_taklacisi',
      origin: 'Sivas',
      family: 'tumbler',
      tier: 'B+',
      rarity: 'common',
      stats: {
        tumble:     { base: 33, cap: 70 },
        spinSpeed:  { base: 22, cap: 50 },
        style:      { base: 26, cap: 58 },
        balance:    { base: 36, cap: 72 },
        endurance:  { base: 32, cap: 68 },
        flockSync:  { base: 35, cap: 72 }
      },
      physical: {
        bodyLength: { min: 29, max: 33, unit: 'cm' },
        weight:     { min: 300, max: 380, unit: 'g' },
        wingspan:   { min: 60, max: 68, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'red', 'blue_bar', 'silver'],
      patterns: ['self', 'bar', 'checker', 'splash'],
      temperament: {
        courage: 58,
        loyaltyBase: 60,
        aggressiveness: 35,
        learningSpeed: 0.065
      },
      tricks: ['tumble', 'multi_tumble', 'roll', 'tail_sit'],
      flightDuration: { min: 2.5, max: 5.0, unit: 'hours' },
      signatureMove: 'chain_tumble',
      roles: ['flock_member', 'tumbler', 'endurance_flyer', 'breeder', 'competition_entry'],
      breedingRates: {
        eggLay: 0.82,
        hatch: 0.76,
        qualityChance: 0.12
      },
      soundProfile: {
        coo: 'deep_coo',
        alarm: 'rapid_cluck',
        courtship: 'throaty_rumble'
      }
    },

    // ─────────────────────────────────────────────
    // 3. Kayseri Takacısı — A tier, rare tumbler
    // ─────────────────────────────────────────────
    kayseri_taklacisi: {
      id: 'kayseri_taklacisi',
      nameKey: 'breed.kayseri_taklacisi',
      origin: 'Kayseri',
      family: 'tumbler',
      tier: 'A',
      rarity: 'rare',
      stats: {
        tumble:     { base: 38, cap: 75 },
        spinSpeed:  { base: 28, cap: 60 },
        style:      { base: 32, cap: 68 },
        balance:    { base: 40, cap: 78 },
        endurance:  { base: 30, cap: 65 },
        flockSync:  { base: 34, cap: 70 }
      },
      physical: {
        bodyLength: { min: 28, max: 32, unit: 'cm' },
        weight:     { min: 290, max: 360, unit: 'g' },
        wingspan:   { min: 59, max: 66, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'red', 'yellow', 'ash_red', 'indigo'],
      patterns: ['self', 'grizzle', 'bar', 'checker', 'tiger'],
      temperament: {
        courage: 62,
        loyaltyBase: 62,
        aggressiveness: 32,
        learningSpeed: 0.075
      },
      tricks: ['tumble', 'multi_tumble', 'roll', 'dive', 'tail_sit'],
      flightDuration: { min: 2.0, max: 4.0, unit: 'hours' },
      signatureMove: 'rapid_tumble_burst',
      roles: ['tumbler', 'competition_entry', 'flock_leader', 'breeder', 'show_bird'],
      breedingRates: {
        eggLay: 0.80,
        hatch: 0.74,
        qualityChance: 0.18
      },
      soundProfile: {
        coo: 'sharp_coo',
        alarm: 'piercing_call',
        courtship: 'rolling_trill'
      }
    },

    // ─────────────────────────────────────────────
    // 4. Kelebek — A tier, rare spinner
    // ─────────────────────────────────────────────
    kelebek: {
      id: 'kelebek',
      nameKey: 'breed.kelebek',
      origin: 'Doğu Anadolu',
      family: 'roller',
      tier: 'A',
      rarity: 'rare',
      stats: {
        tumble:     { base: 30, cap: 65 },
        spinSpeed:  { base: 36, cap: 72 },
        style:      { base: 40, cap: 78 },
        balance:    { base: 32, cap: 68 },
        endurance:  { base: 25, cap: 55 },
        flockSync:  { base: 30, cap: 65 }
      },
      physical: {
        bodyLength: { min: 26, max: 30, unit: 'cm' },
        weight:     { min: 260, max: 330, unit: 'g' },
        wingspan:   { min: 54, max: 62, unit: 'cm' },
        tailFeathers: 14,
        beakType: 'short',
        featheredFeet: false,
        crest: false,
        chestFrill: true
      },
      colors: ['white', 'black', 'red', 'yellow', 'almond', 'opal'],
      patterns: ['self', 'rosewing', 'saddle', 'butterfly', 'tiger'],
      temperament: {
        courage: 50,
        loyaltyBase: 55,
        aggressiveness: 25,
        learningSpeed: 0.08
      },
      tricks: ['tumble', 'roll', 'sync_spin', 'tail_sit', 'rocket_climb'],
      flightDuration: { min: 1.5, max: 3.5, unit: 'hours' },
      signatureMove: 'butterfly_spin',
      roles: ['spinner', 'show_bird', 'competition_entry', 'flock_accent', 'breeder'],
      breedingRates: {
        eggLay: 0.78,
        hatch: 0.72,
        qualityChance: 0.20
      },
      soundProfile: {
        coo: 'soft_whistle',
        alarm: 'flutter_cry',
        courtship: 'melodic_warble'
      }
    },

    // ─────────────────────────────────────────────
    // 5. Şanlıurfa Takacısı — A+ tier, rare tumbler
    // ─────────────────────────────────────────────
    sanliurfa_taklacisi: {
      id: 'sanliurfa_taklacisi',
      nameKey: 'breed.sanliurfa_taklacisi',
      origin: 'Şanlıurfa',
      family: 'tumbler',
      tier: 'A+',
      rarity: 'rare',
      stats: {
        tumble:     { base: 40, cap: 78 },
        spinSpeed:  { base: 32, cap: 68 },
        style:      { base: 35, cap: 72 },
        balance:    { base: 42, cap: 80 },
        endurance:  { base: 34, cap: 70 },
        flockSync:  { base: 36, cap: 72 }
      },
      physical: {
        bodyLength: { min: 28, max: 32, unit: 'cm' },
        weight:     { min: 290, max: 370, unit: 'g' },
        wingspan:   { min: 59, max: 67, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'red', 'cream', 'blue_bar', 'bronze'],
      patterns: ['self', 'grizzle', 'bar', 'checker', 'lacewing'],
      temperament: {
        courage: 68,
        loyaltyBase: 70,
        aggressiveness: 38,
        learningSpeed: 0.08
      },
      tricks: ['tumble', 'multi_tumble', 'roll', 'dive', 'tail_sit', 'rocket_climb'],
      flightDuration: { min: 2.5, max: 5.5, unit: 'hours' },
      signatureMove: 'desert_storm_tumble',
      roles: ['tumbler', 'flock_leader', 'competition_entry', 'endurance_flyer', 'elite_breeder'],
      breedingRates: {
        eggLay: 0.78,
        hatch: 0.72,
        qualityChance: 0.22
      },
      soundProfile: {
        coo: 'resonant_coo',
        alarm: 'sharp_whistle',
        courtship: 'desert_chant'
      }
    },

    // ─────────────────────────────────────────────
    // 6. Mardin — S tier, epic tumbler
    // ─────────────────────────────────────────────
    mardin: {
      id: 'mardin',
      nameKey: 'breed.mardin',
      origin: 'Mardin',
      family: 'tumbler',
      tier: 'S',
      rarity: 'epic',
      stats: {
        tumble:     { base: 42, cap: 78 },
        spinSpeed:  { base: 28, cap: 58 },
        style:      { base: 30, cap: 65 },
        balance:    { base: 38, cap: 75 },
        endurance:  { base: 48, cap: 88 },
        flockSync:  { base: 36, cap: 72 }
      },
      physical: {
        bodyLength: { min: 30, max: 35, unit: 'cm' },
        weight:     { min: 320, max: 400, unit: 'g' },
        wingspan:   { min: 62, max: 72, unit: 'cm' },
        tailFeathers: 14,
        beakType: 'medium-long',
        featheredFeet: true,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'red', 'blue_bar', 'ash_red', 'bronze', 'lavender'],
      patterns: ['self', 'grizzle', 'bar', 'checker', 't_pattern', 'spread'],
      temperament: {
        courage: 72,
        loyaltyBase: 55,
        aggressiveness: 45,
        learningSpeed: 0.06
      },
      tricks: ['tumble', 'multi_tumble', 'roll', 'dive', 'tail_sit', 'rocket_climb'],
      flightDuration: { min: 4.0, max: 8.0, unit: 'hours' },
      signatureMove: 'stone_fortress_tumble',
      roles: ['tumbler', 'endurance_flyer', 'competition_ace', 'flock_leader', 'elite_breeder'],
      breedingRates: {
        eggLay: 0.75,
        hatch: 0.70,
        qualityChance: 0.28
      },
      soundProfile: {
        coo: 'deep_resonant',
        alarm: 'booming_call',
        courtship: 'ancient_melody'
      }
    },

    // ─────────────────────────────────────────────
    // 7. Filo — S tier, epic highflyer
    // ─────────────────────────────────────────────
    filo: {
      id: 'filo',
      nameKey: 'breed.filo',
      origin: 'İstanbul',
      family: 'highflyer',
      tier: 'S',
      rarity: 'epic',
      stats: {
        tumble:     { base: 25, cap: 55 },
        spinSpeed:  { base: 22, cap: 48 },
        style:      { base: 28, cap: 60 },
        balance:    { base: 36, cap: 72 },
        endurance:  { base: 48, cap: 88 },
        flockSync:  { base: 44, cap: 82 }
      },
      physical: {
        bodyLength: { min: 31, max: 36, unit: 'cm' },
        weight:     { min: 330, max: 420, unit: 'g' },
        wingspan:   { min: 66, max: 76, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'medium',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'black', 'blue_bar', 'silver', 'dun', 'mealy'],
      patterns: ['self', 'bar', 'checker', 'grizzle'],
      temperament: {
        courage: 65,
        loyaltyBase: 58,
        aggressiveness: 28,
        learningSpeed: 0.06
      },
      tricks: ['tumble', 'tail_sit', 'rocket_climb', 'sync_spin'],
      flightDuration: { min: 5.0, max: 12.0, unit: 'hours' },
      signatureMove: 'cloud_piercer',
      roles: ['highflyer', 'endurance_flyer', 'flock_leader', 'competition_ace', 'sky_sentinel'],
      breedingRates: {
        eggLay: 0.76,
        hatch: 0.71,
        qualityChance: 0.25
      },
      soundProfile: {
        coo: 'airy_coo',
        alarm: 'high_pitch_cry',
        courtship: 'sky_song'
      }
    },

    // ─────────────────────────────────────────────
    // 8. Posta — S tier, epic postal
    // ─────────────────────────────────────────────
    posta: {
      id: 'posta',
      nameKey: 'breed.posta',
      origin: 'Türkiye (Çeşitli)',
      family: 'postal',
      tier: 'S',
      rarity: 'epic',
      stats: {
        tumble:     { base: 20, cap: 45 },
        spinSpeed:  { base: 18, cap: 40 },
        style:      { base: 22, cap: 50 },
        balance:    { base: 40, cap: 78 },
        endurance:  { base: 45, cap: 85 },
        flockSync:  { base: 38, cap: 75 }
      },
      physical: {
        bodyLength: { min: 30, max: 35, unit: 'cm' },
        weight:     { min: 340, max: 430, unit: 'g' },
        wingspan:   { min: 64, max: 74, unit: 'cm' },
        tailFeathers: 12,
        beakType: 'long',
        featheredFeet: false,
        crest: false,
        chestFrill: false
      },
      colors: ['white', 'blue_bar', 'blue_check', 'red_check', 'dark_check', 'grizzle'],
      patterns: ['bar', 'checker', 'self', 'grizzle'],
      temperament: {
        courage: 75,
        loyaltyBase: 75,
        aggressiveness: 20,
        learningSpeed: 0.065
      },
      tricks: ['tail_sit', 'rocket_climb', 'diamond_landing'],
      flightDuration: { min: 4.0, max: 10.0, unit: 'hours' },
      signatureMove: 'homing_arrow',
      roles: ['postal', 'navigator', 'endurance_flyer', 'scout', 'flock_anchor'],
      breedingRates: {
        eggLay: 0.80,
        hatch: 0.75,
        qualityChance: 0.22
      },
      soundProfile: {
        coo: 'commanding_coo',
        alarm: 'directional_call',
        courtship: 'steady_rumble'
      }
    },

    // ─────────────────────────────────────────────
    // 9. Ankut — SS tier, legendary singer
    // ─────────────────────────────────────────────
    ankut: {
      id: 'ankut',
      nameKey: 'breed.ankut',
      origin: 'Ankara',
      family: 'singer',
      tier: 'SS',
      rarity: 'legendary',
      stats: {
        tumble:     { base: 25, cap: 55 },
        spinSpeed:  { base: 18, cap: 40 },
        style:      { base: 45, cap: 82 },
        balance:    { base: 30, cap: 65 },
        endurance:  { base: 20, cap: 45 },
        flockSync:  { base: 25, cap: 55 }
      },
      physical: {
        bodyLength: { min: 29, max: 33, unit: 'cm' },
        weight:     { min: 310, max: 380, unit: 'g' },
        wingspan:   { min: 60, max: 68, unit: 'cm' },
        tailFeathers: 16,
        beakType: 'short-thick',
        featheredFeet: true,
        crest: true,
        chestFrill: true
      },
      colors: ['white', 'black', 'red', 'yellow', 'dun', 'ice_blue', 'pearl'],
      patterns: ['self', 'lace', 'mottled', 'rosewing', 'shield'],
      temperament: {
        courage: 40,
        loyaltyBase: 85,
        aggressiveness: 15,
        learningSpeed: 0.05
      },
      tricks: ['tail_sit', 'sync_spin'],
      flightDuration: { min: 0.5, max: 2.0, unit: 'hours' },
      signatureMove: 'sultans_serenade',
      roles: ['singer', 'show_bird', 'morale_booster', 'ornamental', 'prestige_breeder'],
      breedingRates: {
        eggLay: 0.70,
        hatch: 0.65,
        qualityChance: 0.35
      },
      soundProfile: {
        coo: 'melodic_song',
        alarm: 'trumpeting_cry',
        courtship: 'operatic_serenade'
      }
    },

    // ─────────────────────────────────────────────
    // 10. Mısıri — SSR tier, mythic ornamental
    // ─────────────────────────────────────────────
    misiri: {
      id: 'misiri',
      nameKey: 'breed.misiri',
      origin: 'Güneydoğu Anadolu (Mısır kökenli)',
      family: 'ornamental',
      tier: 'SSR',
      rarity: 'mythic',
      stats: {
        tumble:     { base: 15, cap: 35 },
        spinSpeed:  { base: 12, cap: 30 },
        style:      { base: 55, cap: 95 },
        balance:    { base: 22, cap: 50 },
        endurance:  { base: 15, cap: 35 },
        flockSync:  { base: 18, cap: 40 }
      },
      physical: {
        bodyLength: { min: 25, max: 28, unit: 'cm' },
        weight:     { min: 250, max: 320, unit: 'g' },
        wingspan:   { min: 50, max: 58, unit: 'cm' },
        tailFeathers: 18,
        beakType: 'short-fine',
        featheredFeet: true,
        crest: true,
        chestFrill: true
      },
      colors: ['white', 'pearl', 'gold', 'copper', 'moonlight_silver', 'pharaoh_black', 'ruby_red'],
      patterns: ['self', 'lace', 'filigree', 'shield', 'ancient_scroll', 'celestial'],
      temperament: {
        courage: 30,
        loyaltyBase: 70,
        aggressiveness: 10,
        learningSpeed: 0.04
      },
      tricks: ['tail_sit', 'diamond_landing'],
      flightDuration: { min: 0.3, max: 1.5, unit: 'hours' },
      signatureMove: 'pharaohs_descent',
      roles: ['ornamental', 'prestige_bird', 'show_champion', 'mythic_breeder', 'collection_crown'],
      breedingRates: {
        eggLay: 0.60,
        hatch: 0.55,
        qualityChance: 0.45
      },
      soundProfile: {
        coo: 'ethereal_whisper',
        alarm: 'crystalline_chime',
        courtship: 'pharaohs_hymn'
      }
    }
  },

  // ═══════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════

  /**
   * Get a breed by its id
   * @param {string} id - Breed identifier
   * @returns {object|null} Breed data or null if not found
   */
  getBreed: function(id) {
    return this.breeds[id] || null;
  },

  /**
   * Get all breeds belonging to a specific family
   * @param {string} family - Family name (tumbler|roller|highflyer|postal|ornamental|singer)
   * @returns {object[]} Array of breed objects
   */
  getBreedsByFamily: function(family) {
    return Object.values(this.breeds).filter(function(b) {
      return b.family === family;
    });
  },

  /**
   * Get all breeds of a specific tier
   * @param {string} tier - Tier string (B, B+, A, A+, S, SS, SSR)
   * @returns {object[]} Array of breed objects
   */
  getBreedsByTier: function(tier) {
    return Object.values(this.breeds).filter(function(b) {
      return b.tier === tier;
    });
  },

  /**
   * Get an array of all breed ids
   * @returns {string[]} Array of breed id strings
   */
  getAllBreedIds: function() {
    return Object.keys(this.breeds);
  },

  /**
   * Get the tier hierarchy from lowest to highest
   * @returns {string[]} Ordered tier array
   */
  getTierOrder: function() {
    return ['B', 'B+', 'A', 'A+', 'S', 'SS', 'SSR'];
  },

  /**
   * Get the display color for a tier
   * @param {string} tier - Tier string
   * @returns {string} CSS color string
   */
  getTierColor: function(tier) {
    var colors = {
      'B':   '#8a8a8a',   // Grey
      'B+':  '#5a9e5a',   // Green
      'A':   '#4a90d9',   // Blue
      'A+':  '#7b5ea7',   // Purple
      'S':   '#d4a017',   // Gold
      'SS':  '#e85d3a',   // Orange-Red
      'SSR': '#ff2d55'    // Hot Pink / Mythic
    };
    return colors[tier] || '#ffffff';
  }
};
