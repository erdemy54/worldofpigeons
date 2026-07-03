/**
 * World of Pigeon's - Diseases Database
 * 6 common pigeon diseases with symptoms, contagion, treatment, and performance impact
 */
window.DiseasesDB = {
  diseases: {
    // ─────────────────────────────────────────────
    // 1. Canker (Trichomoniasis) — 0.4 base chance
    // ─────────────────────────────────────────────
    canker: {
      id: 'canker',
      nameKey: 'disease.canker',
      baseChance: 0.4,
      symptoms: [
        'yellow_lesions_mouth',
        'difficulty_swallowing',
        'weight_loss',
        'ruffled_feathers',
        'foul_smelling_breath'
      ],
      contagiousness: 0.35,
      severity: { min: 20, max: 65 },
      treatment: {
        itemId: 'canker_medicine',
        durationHours: 48,
        dosesRequired: 3,
        successRate: 0.85
      },
      duration: {
        untreated: { min: 120, max: 240, unit: 'hours' },
        treated: { min: 24, max: 72, unit: 'hours' }
      },
      mortality: {
        untreated: 0.30,
        treated: 0.03
      },
      performancePenalty: {
        tumble: -15,
        spinSpeed: -10,
        style: -10,
        balance: -12,
        endurance: -20,
        flockSync: -8
      }
    },

    // ─────────────────────────────────────────────
    // 2. Respiratory Infection — 0.5 base chance
    // ─────────────────────────────────────────────
    respiratory: {
      id: 'respiratory',
      nameKey: 'disease.respiratory',
      baseChance: 0.5,
      symptoms: [
        'nasal_discharge',
        'sneezing',
        'labored_breathing',
        'open_mouth_breathing',
        'reduced_flight_time',
        'watery_eyes'
      ],
      contagiousness: 0.55,
      severity: { min: 25, max: 75 },
      treatment: {
        itemId: 'respiratory_medicine',
        durationHours: 72,
        dosesRequired: 5,
        successRate: 0.80
      },
      duration: {
        untreated: { min: 168, max: 336, unit: 'hours' },
        treated: { min: 48, max: 96, unit: 'hours' }
      },
      mortality: {
        untreated: 0.40,
        treated: 0.05
      },
      performancePenalty: {
        tumble: -20,
        spinSpeed: -15,
        style: -12,
        balance: -10,
        endurance: -35,
        flockSync: -15
      }
    },

    // ─────────────────────────────────────────────
    // 3. Coccidiosis — 0.35 base chance
    // ─────────────────────────────────────────────
    coccidiosis: {
      id: 'coccidiosis',
      nameKey: 'disease.coccidiosis',
      baseChance: 0.35,
      symptoms: [
        'bloody_droppings',
        'green_watery_droppings',
        'lethargy',
        'weight_loss',
        'dehydration',
        'huddling'
      ],
      contagiousness: 0.45,
      severity: { min: 20, max: 70 },
      treatment: {
        itemId: 'intestinal_medicine',
        durationHours: 60,
        dosesRequired: 4,
        successRate: 0.82
      },
      duration: {
        untreated: { min: 96, max: 240, unit: 'hours' },
        treated: { min: 36, max: 84, unit: 'hours' }
      },
      mortality: {
        untreated: 0.25,
        treated: 0.04
      },
      performancePenalty: {
        tumble: -12,
        spinSpeed: -8,
        style: -8,
        balance: -15,
        endurance: -28,
        flockSync: -10
      }
    },

    // ─────────────────────────────────────────────
    // 4. PMV (Paramyxovirus) — 0.3 base chance
    // ─────────────────────────────────────────────
    pmv: {
      id: 'pmv',
      nameKey: 'disease.pmv',
      baseChance: 0.3,
      symptoms: [
        'twisted_neck',
        'circling',
        'tremors',
        'paralysis',
        'green_droppings',
        'inability_to_fly',
        'star_gazing'
      ],
      contagiousness: 0.60,
      severity: { min: 40, max: 90 },
      treatment: {
        itemId: 'broad_spectrum',
        durationHours: 120,
        dosesRequired: 7,
        successRate: 0.55
      },
      duration: {
        untreated: { min: 240, max: 720, unit: 'hours' },
        treated: { min: 120, max: 360, unit: 'hours' }
      },
      mortality: {
        untreated: 0.60,
        treated: 0.15
      },
      performancePenalty: {
        tumble: -40,
        spinSpeed: -35,
        style: -30,
        balance: -45,
        endurance: -30,
        flockSync: -35
      }
    },

    // ─────────────────────────────────────────────
    // 5. Pigeon Pox — 0.25 base chance
    // ─────────────────────────────────────────────
    pox: {
      id: 'pox',
      nameKey: 'disease.pox',
      baseChance: 0.25,
      symptoms: [
        'wart_like_lesions',
        'scabs_on_feet',
        'lesions_around_eyes',
        'lesions_around_beak',
        'difficulty_eating',
        'swollen_eyelids'
      ],
      contagiousness: 0.40,
      severity: { min: 15, max: 60 },
      treatment: {
        itemId: 'broad_spectrum',
        durationHours: 96,
        dosesRequired: 5,
        successRate: 0.65
      },
      duration: {
        untreated: { min: 336, max: 504, unit: 'hours' },
        treated: { min: 168, max: 336, unit: 'hours' }
      },
      mortality: {
        untreated: 0.15,
        treated: 0.02
      },
      performancePenalty: {
        tumble: -8,
        spinSpeed: -5,
        style: -25,
        balance: -5,
        endurance: -15,
        flockSync: -5
      }
    },

    // ─────────────────────────────────────────────
    // 6. Parasite Infestation — 0.2 base chance
    // ─────────────────────────────────────────────
    parasite: {
      id: 'parasite',
      nameKey: 'disease.parasite',
      baseChance: 0.2,
      symptoms: [
        'feather_picking',
        'restlessness',
        'visible_mites_lice',
        'scaly_legs',
        'weight_loss',
        'poor_feather_quality'
      ],
      contagiousness: 0.50,
      severity: { min: 10, max: 45 },
      treatment: {
        itemId: 'antiparasitic',
        durationHours: 36,
        dosesRequired: 2,
        successRate: 0.90
      },
      duration: {
        untreated: { min: 72, max: 480, unit: 'hours' },
        treated: { min: 12, max: 48, unit: 'hours' }
      },
      mortality: {
        untreated: 0.08,
        treated: 0.01
      },
      performancePenalty: {
        tumble: -5,
        spinSpeed: -5,
        style: -18,
        balance: -3,
        endurance: -12,
        flockSync: -5
      }
    }
  },

  // ═══════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════

  /**
   * Get a disease by its id
   * @param {string} id - Disease identifier
   * @returns {object|null}
   */
  getDisease: function(id) {
    return this.diseases[id] || null;
  },

  /**
   * Get all disease ids
   * @returns {string[]}
   */
  getAllDiseaseIds: function() {
    return Object.keys(this.diseases);
  },

  /**
   * Get diseases sorted by base chance (highest first)
   * @returns {object[]}
   */
  getByLikelihood: function() {
    return Object.values(this.diseases).sort(function(a, b) {
      return b.baseChance - a.baseChance;
    });
  },

  /**
   * Get diseases sorted by severity max (highest first)
   * @returns {object[]}
   */
  getBySeverity: function() {
    return Object.values(this.diseases).sort(function(a, b) {
      return b.severity.max - a.severity.max;
    });
  },

  /**
   * Roll for a random disease based on base chances
   * @param {number} [modifier=0] - Added to each disease's base chance (e.g., hygiene penalty)
   * @returns {object|null} A disease object or null if no disease triggers
   */
  rollDisease: function(modifier) {
    modifier = modifier || 0;
    var ids = this.getAllDiseaseIds();
    for (var i = 0; i < ids.length; i++) {
      var disease = this.diseases[ids[i]];
      var chance = Math.min(disease.baseChance + modifier, 0.95);
      if (Math.random() < chance) {
        return disease;
      }
    }
    return null;
  },

  /**
   * Get the required treatment item for a disease
   * @param {string} diseaseId - Disease identifier
   * @returns {string|null} Item id for treatment
   */
  getTreatmentItem: function(diseaseId) {
    var disease = this.getDisease(diseaseId);
    return disease ? disease.treatment.itemId : null;
  }
};
