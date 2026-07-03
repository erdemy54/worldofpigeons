/**
 * World of Pigeon's - Threats Database
 * Air and ground predator threats with attack patterns, frequencies, and countermeasures
 */
window.ThreatsDB = {
  threats: {
    // ═══════════════════════════════════════════════
    // AIR THREATS
    // ═══════════════════════════════════════════════
    hawk: {
      id: 'hawk',
      nameKey: 'threat.hawk',
      type: 'air',
      attackPower: 0.5,
      frequency: 0.15,
      behavior: {
        huntingStyle: 'dive_ambush',
        preferredTime: 'daytime',
        targetPreference: 'isolated_flyers',
        chaseDistance: 200,
        giveUpChance: 0.3
      },
      damage: {
        kill: 0.40,
        injury: 0.35,
        stress: 25,
        flockPanic: 0.60
      },
      countermeasures: {
        flockSync: { threshold: 60, avoidanceBonus: 0.25 },
        observationTower: { detectionBonus: 0.30 },
        courage: { threshold: 50, resistBonus: 0.15 }
      },
      loot: null,
      icon: 'threat_hawk',
      descriptionKey: 'threat.hawk.desc'
    },

    falcon: {
      id: 'falcon',
      nameKey: 'threat.falcon',
      type: 'air',
      attackPower: 0.8,
      frequency: 0.08,
      behavior: {
        huntingStyle: 'high_speed_stoop',
        preferredTime: 'daytime',
        targetPreference: 'fastest_flyer',
        chaseDistance: 400,
        giveUpChance: 0.15
      },
      damage: {
        kill: 0.65,
        injury: 0.25,
        stress: 40,
        flockPanic: 0.85
      },
      countermeasures: {
        flockSync: { threshold: 75, avoidanceBonus: 0.20 },
        observationTower: { detectionBonus: 0.20 },
        courage: { threshold: 70, resistBonus: 0.10 }
      },
      loot: { feather: 'falcon_feather', dropChance: 0.05 },
      icon: 'threat_falcon',
      descriptionKey: 'threat.falcon.desc'
    },

    crow: {
      id: 'crow',
      nameKey: 'threat.crow',
      type: 'air',
      attackPower: 0.2,
      frequency: 0.25,
      behavior: {
        huntingStyle: 'mob_harassment',
        preferredTime: 'daytime',
        targetPreference: 'nesting_pigeons',
        chaseDistance: 80,
        giveUpChance: 0.50
      },
      damage: {
        kill: 0.05,
        injury: 0.15,
        stress: 15,
        flockPanic: 0.30
      },
      countermeasures: {
        flockSync: { threshold: 40, avoidanceBonus: 0.35 },
        observationTower: { detectionBonus: 0.40 },
        courage: { threshold: 30, resistBonus: 0.25 }
      },
      loot: null,
      icon: 'threat_crow',
      descriptionKey: 'threat.crow.desc',
      special: {
        eggTheft: true,
        eggTheftChance: 0.20,
        feedTheft: true,
        feedTheftAmount: 0.10
      }
    },

    // ═══════════════════════════════════════════════
    // GROUND THREATS
    // ═══════════════════════════════════════════════
    weasel: {
      id: 'weasel',
      nameKey: 'threat.weasel',
      type: 'ground',
      attackPower: 0.6,
      frequency: 0.12,
      behavior: {
        huntingStyle: 'night_raid',
        preferredTime: 'night',
        targetPreference: 'sleeping_pigeons',
        sneakChance: 0.70,
        multiKill: true,
        maxKillsPerRaid: 3
      },
      damage: {
        kill: 0.55,
        injury: 0.30,
        stress: 35,
        flockPanic: 0.90
      },
      countermeasures: {
        coopSecurity: { threshold: 2, blockChance: 0.60 },
        observationTower: { detectionBonus: 0.15 },
        quarantinePen: { protectionBonus: 0.20 }
      },
      loot: null,
      icon: 'threat_weasel',
      descriptionKey: 'threat.weasel.desc'
    },

    cat: {
      id: 'cat',
      nameKey: 'threat.cat',
      type: 'ground',
      attackPower: 0.45,
      frequency: 0.20,
      behavior: {
        huntingStyle: 'roaming_ambush',
        preferredTime: 'any',
        targetPreference: 'ground_feeding_pigeons',
        pounceRange: 3,
        patience: 0.80,
        climbable: true
      },
      damage: {
        kill: 0.35,
        injury: 0.40,
        stress: 20,
        flockPanic: 0.50
      },
      countermeasures: {
        coopSecurity: { threshold: 1, blockChance: 0.45 },
        observationTower: { detectionBonus: 0.35 },
        courage: { threshold: 45, resistBonus: 0.10 }
      },
      loot: null,
      icon: 'threat_cat',
      descriptionKey: 'threat.cat.desc'
    },

    mouse: {
      id: 'mouse',
      nameKey: 'threat.mouse',
      type: 'ground',
      attackPower: 0.05,
      frequency: 0.30,
      behavior: {
        huntingStyle: 'feed_theft',
        preferredTime: 'night',
        targetPreference: 'feed_and_eggs',
        sneakChance: 0.85,
        diseaseCarrier: true,
        diseaseSpreadChance: 0.10
      },
      damage: {
        kill: 0.0,
        injury: 0.02,
        stress: 5,
        flockPanic: 0.10
      },
      countermeasures: {
        coopSecurity: { threshold: 1, blockChance: 0.70 },
        observationTower: { detectionBonus: 0.10 },
        cleanliness: { threshold: 60, blockBonus: 0.30 }
      },
      loot: null,
      icon: 'threat_mouse',
      descriptionKey: 'threat.mouse.desc',
      special: {
        feedConsumption: 0.15,
        eggDamage: true,
        eggDamageChance: 0.08,
        nestContamination: true,
        contaminationChance: 0.12
      }
    }
  },

  // ═══════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════

  /**
   * Get a threat by its id
   * @param {string} id - Threat identifier
   * @returns {object|null}
   */
  getThreat: function(id) {
    return this.threats[id] || null;
  },

  /**
   * Get all threats of a specific type
   * @param {string} type - 'air' or 'ground'
   * @returns {object[]}
   */
  getThreatsByType: function(type) {
    return Object.values(this.threats).filter(function(t) {
      return t.type === type;
    });
  },

  /**
   * Get all air threats
   * @returns {object[]}
   */
  getAirThreats: function() {
    return this.getThreatsByType('air');
  },

  /**
   * Get all ground threats
   * @returns {object[]}
   */
  getGroundThreats: function() {
    return this.getThreatsByType('ground');
  },

  /**
   * Get all threat ids
   * @returns {string[]}
   */
  getAllThreatIds: function() {
    return Object.keys(this.threats);
  },

  /**
   * Get threats active during a specific time
   * @param {string} timeOfDay - 'daytime', 'night', or 'any'
   * @returns {object[]}
   */
  getThreatsForTime: function(timeOfDay) {
    return Object.values(this.threats).filter(function(t) {
      return t.behavior.preferredTime === timeOfDay || t.behavior.preferredTime === 'any';
    });
  },

  /**
   * Roll for a random threat encounter based on frequencies
   * @param {string} timeOfDay - 'daytime' or 'night'
   * @param {number} [modifier=0] - Added to frequency (e.g., location danger modifier)
   * @returns {object|null} A threat object or null if no encounter
   */
  rollThreat: function(timeOfDay, modifier) {
    modifier = modifier || 0;
    var activeThreats = this.getThreatsForTime(timeOfDay);
    for (var i = 0; i < activeThreats.length; i++) {
      var threat = activeThreats[i];
      var chance = Math.min(threat.frequency + modifier, 0.90);
      if (Math.random() < chance) {
        return threat;
      }
    }
    return null;
  }
};
