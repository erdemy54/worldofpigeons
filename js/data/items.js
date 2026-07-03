/**
 * World of Pigeon's - Items Database
 * Feed, medicine, supplements, and coop upgrades
 */
window.ItemsDB = {
  items: {
    // ═══════════════════════════════════════════════
    // FEED
    // ═══════════════════════════════════════════════
    standard_mix: {
      id: 'standard_mix',
      nameKey: 'item.standard_mix',
      category: 'feed',
      cost: { amount: 120, currency: 'coins' },
      effect: {
        type: 'hunger',
        value: 40,
        duration: null,
        bonus: null
      },
      icon: 'feed_standard',
      descriptionKey: 'item.standard_mix.desc'
    },

    performance_feed: {
      id: 'performance_feed',
      nameKey: 'item.performance_feed',
      category: 'feed',
      cost: { amount: 320, currency: 'coins' },
      effect: {
        type: 'hunger',
        value: 60,
        duration: 3600,
        bonus: { stat: 'endurance', amount: 5 }
      },
      icon: 'feed_performance',
      descriptionKey: 'item.performance_feed.desc'
    },

    incubation_feed: {
      id: 'incubation_feed',
      nameKey: 'item.incubation_feed',
      category: 'feed',
      cost: { amount: 280, currency: 'coins' },
      effect: {
        type: 'hunger',
        value: 50,
        duration: null,
        bonus: { stat: 'breeding_boost', amount: 0.05 }
      },
      icon: 'feed_incubation',
      descriptionKey: 'item.incubation_feed.desc'
    },

    // ═══════════════════════════════════════════════
    // MEDICINE
    // ═══════════════════════════════════════════════
    canker_medicine: {
      id: 'canker_medicine',
      nameKey: 'item.canker_medicine',
      category: 'medicine',
      cost: { amount: 350, currency: 'coins' },
      effect: {
        type: 'cure',
        targetDisease: 'canker',
        cureChance: 0.85,
        duration: 7200,
        bonus: null
      },
      icon: 'medicine_canker',
      descriptionKey: 'item.canker_medicine.desc'
    },

    respiratory_medicine: {
      id: 'respiratory_medicine',
      nameKey: 'item.respiratory_medicine',
      category: 'medicine',
      cost: { amount: 400, currency: 'coins' },
      effect: {
        type: 'cure',
        targetDisease: 'respiratory',
        cureChance: 0.80,
        duration: 10800,
        bonus: null
      },
      icon: 'medicine_respiratory',
      descriptionKey: 'item.respiratory_medicine.desc'
    },

    intestinal_medicine: {
      id: 'intestinal_medicine',
      nameKey: 'item.intestinal_medicine',
      category: 'medicine',
      cost: { amount: 300, currency: 'coins' },
      effect: {
        type: 'cure',
        targetDisease: 'coccidiosis',
        cureChance: 0.82,
        duration: 7200,
        bonus: null
      },
      icon: 'medicine_intestinal',
      descriptionKey: 'item.intestinal_medicine.desc'
    },

    antiparasitic: {
      id: 'antiparasitic',
      nameKey: 'item.antiparasitic',
      category: 'medicine',
      cost: { amount: 260, currency: 'coins' },
      effect: {
        type: 'cure',
        targetDisease: 'parasite',
        cureChance: 0.90,
        duration: 5400,
        bonus: { stat: 'health_regen', amount: 2 }
      },
      icon: 'medicine_antiparasitic',
      descriptionKey: 'item.antiparasitic.desc'
    },

    broad_spectrum: {
      id: 'broad_spectrum',
      nameKey: 'item.broad_spectrum',
      category: 'medicine',
      cost: { amount: 25, currency: 'tokens' },
      effect: {
        type: 'cure',
        targetDisease: 'all',
        cureChance: 0.70,
        duration: 14400,
        bonus: { stat: 'immunity', amount: 10 }
      },
      icon: 'medicine_broad',
      descriptionKey: 'item.broad_spectrum.desc'
    },

    // ═══════════════════════════════════════════════
    // SUPPLEMENTS
    // ═══════════════════════════════════════════════
    vitamin_supplement: {
      id: 'vitamin_supplement',
      nameKey: 'item.vitamin_supplement',
      category: 'supplement',
      cost: { amount: 200, currency: 'coins' },
      effect: {
        type: 'buff',
        stat: 'all_stats',
        value: 3,
        duration: 7200,
        bonus: { stat: 'health_regen', amount: 1 }
      },
      icon: 'supplement_vitamin',
      descriptionKey: 'item.vitamin_supplement.desc'
    },

    loyalty_supplement: {
      id: 'loyalty_supplement',
      nameKey: 'item.loyalty_supplement',
      category: 'supplement',
      cost: { amount: 450, currency: 'coins' },
      effect: {
        type: 'buff',
        stat: 'loyalty',
        value: 8,
        duration: 14400,
        bonus: null
      },
      icon: 'supplement_loyalty',
      descriptionKey: 'item.loyalty_supplement.desc'
    },

    mutation_feed: {
      id: 'mutation_feed',
      nameKey: 'item.mutation_feed',
      category: 'supplement',
      cost: { amount: 40, currency: 'tokens' },
      effect: {
        type: 'mutation',
        mutationChance: 0.15,
        duration: null,
        bonus: { stat: 'quality_chance', amount: 0.10 }
      },
      icon: 'supplement_mutation',
      descriptionKey: 'item.mutation_feed.desc'
    },

    // ═══════════════════════════════════════════════
    // UPGRADES (Coop / Facility)
    // ═══════════════════════════════════════════════
    nest_upgrade: {
      id: 'nest_upgrade',
      nameKey: 'item.nest_upgrade',
      category: 'upgrade',
      cost: { amount: 60, currency: 'tokens' },
      effect: {
        type: 'facility',
        target: 'nest',
        capacity: 2,
        bonus: { stat: 'breeding_boost', amount: 0.08 }
      },
      icon: 'upgrade_nest',
      descriptionKey: 'item.nest_upgrade.desc'
    },

    auto_waterer: {
      id: 'auto_waterer',
      nameKey: 'item.auto_waterer',
      category: 'upgrade',
      cost: { amount: 90, currency: 'tokens' },
      effect: {
        type: 'facility',
        target: 'water',
        autoFeed: true,
        bonus: { stat: 'thirst_decay', amount: -0.3 }
      },
      icon: 'upgrade_waterer',
      descriptionKey: 'item.auto_waterer.desc'
    },

    quarantine_pen: {
      id: 'quarantine_pen',
      nameKey: 'item.quarantine_pen',
      category: 'upgrade',
      cost: { amount: 120, currency: 'tokens' },
      effect: {
        type: 'facility',
        target: 'quarantine',
        capacity: 3,
        bonus: { stat: 'contagion_block', amount: 1.0 }
      },
      icon: 'upgrade_quarantine',
      descriptionKey: 'item.quarantine_pen.desc'
    },

    incubation_room: {
      id: 'incubation_room',
      nameKey: 'item.incubation_room',
      category: 'upgrade',
      cost: { amount: 150, currency: 'tokens' },
      effect: {
        type: 'facility',
        target: 'incubation',
        capacity: 4,
        bonus: { stat: 'hatch_rate', amount: 0.10 }
      },
      icon: 'upgrade_incubation',
      descriptionKey: 'item.incubation_room.desc'
    },

    observation_tower: {
      id: 'observation_tower',
      nameKey: 'item.observation_tower',
      category: 'upgrade',
      cost: { amount: 200, currency: 'tokens' },
      effect: {
        type: 'facility',
        target: 'observation',
        range: 500,
        bonus: { stat: 'threat_detection', amount: 0.25 }
      },
      icon: 'upgrade_tower',
      descriptionKey: 'item.observation_tower.desc'
    }
  },

  // ═══════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════

  /**
   * Get an item by its id
   * @param {string} id - Item identifier
   * @returns {object|null}
   */
  getItem: function(id) {
    return this.items[id] || null;
  },

  /**
   * Get all items in a specific category
   * @param {string} category - Category name (feed|medicine|supplement|upgrade)
   * @returns {object[]}
   */
  getItemsByCategory: function(category) {
    return Object.values(this.items).filter(function(item) {
      return item.category === category;
    });
  },

  /**
   * Get all items purchasable with a specific currency
   * @param {string} currency - 'coins' or 'tokens'
   * @returns {object[]}
   */
  getItemsByCurrency: function(currency) {
    return Object.values(this.items).filter(function(item) {
      return item.cost.currency === currency;
    });
  },

  /**
   * Get all available categories
   * @returns {string[]}
   */
  getCategories: function() {
    var cats = {};
    Object.values(this.items).forEach(function(item) {
      cats[item.category] = true;
    });
    return Object.keys(cats);
  },

  /**
   * Get all item ids
   * @returns {string[]}
   */
  getAllItemIds: function() {
    return Object.keys(this.items);
  }
};
