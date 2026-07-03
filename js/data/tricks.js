/**
 * World of Pigeon's - Tricks Database
 * 8 learnable pigeon tricks with training requirements, score multipliers, and animation data
 */
window.TricksDB = {
  tricks: {
    // ─────────────────────────────────────────────
    // 1. Tumble — Basic tumble, foundation trick
    // ─────────────────────────────────────────────
    tumble: {
      id: 'tumble',
      nameKey: 'trick.tumble',
      baseScore: 10,
      scoreMultiplier: 1.0,
      families: ['tumbler', 'roller'],
      requiredStat: 'tumble',
      minStatValue: 20,
      difficulty: 'beginner',
      trainingTime: { min: 2, max: 5, unit: 'sessions' },
      prerequisites: [],
      animation: {
        name: 'anim_tumble',
        duration: 800,
        frames: 12,
        loop: false
      },
      descriptionKey: 'trick.tumble.desc',
      icon: 'trick_tumble'
    },

    // ─────────────────────────────────────────────
    // 2. Multi Tumble — Chain of rapid tumbles
    // ─────────────────────────────────────────────
    multi_tumble: {
      id: 'multi_tumble',
      nameKey: 'trick.multi_tumble',
      baseScore: 25,
      scoreMultiplier: 1.4,
      families: ['tumbler'],
      requiredStat: 'tumble',
      minStatValue: 40,
      difficulty: 'intermediate',
      trainingTime: { min: 5, max: 12, unit: 'sessions' },
      prerequisites: ['tumble'],
      animation: {
        name: 'anim_multi_tumble',
        duration: 1400,
        frames: 24,
        loop: false
      },
      descriptionKey: 'trick.multi_tumble.desc',
      icon: 'trick_multi_tumble'
    },

    // ─────────────────────────────────────────────
    // 3. Roll — Continuous barrel roll in flight
    // ─────────────────────────────────────────────
    roll: {
      id: 'roll',
      nameKey: 'trick.roll',
      baseScore: 40,
      scoreMultiplier: 1.8,
      families: ['roller', 'tumbler'],
      requiredStat: 'spinSpeed',
      minStatValue: 45,
      difficulty: 'advanced',
      trainingTime: { min: 8, max: 18, unit: 'sessions' },
      prerequisites: ['tumble'],
      animation: {
        name: 'anim_roll',
        duration: 2000,
        frames: 30,
        loop: true
      },
      descriptionKey: 'trick.roll.desc',
      icon: 'trick_roll'
    },

    // ─────────────────────────────────────────────
    // 4. Dive — Controlled high-speed dive
    // ─────────────────────────────────────────────
    dive: {
      id: 'dive',
      nameKey: 'trick.dive',
      baseScore: 30,
      scoreMultiplier: 1.6,
      families: ['tumbler', 'highflyer'],
      requiredStat: 'balance',
      minStatValue: 50,
      difficulty: 'intermediate',
      trainingTime: { min: 6, max: 14, unit: 'sessions' },
      prerequisites: ['tumble'],
      animation: {
        name: 'anim_dive',
        duration: 1600,
        frames: 20,
        loop: false
      },
      descriptionKey: 'trick.dive.desc',
      icon: 'trick_dive'
    },

    // ─────────────────────────────────────────────
    // 5. Tail Sit — Stationary upward hover display
    // ─────────────────────────────────────────────
    tail_sit: {
      id: 'tail_sit',
      nameKey: 'trick.tail_sit',
      baseScore: 20,
      scoreMultiplier: 1.3,
      families: ['tumbler', 'roller', 'highflyer', 'singer', 'ornamental', 'postal'],
      requiredStat: 'balance',
      minStatValue: 30,
      difficulty: 'beginner',
      trainingTime: { min: 3, max: 8, unit: 'sessions' },
      prerequisites: [],
      animation: {
        name: 'anim_tail_sit',
        duration: 2200,
        frames: 18,
        loop: true
      },
      descriptionKey: 'trick.tail_sit.desc',
      icon: 'trick_tail_sit'
    },

    // ─────────────────────────────────────────────
    // 6. Rocket Climb — Explosive vertical ascent
    // ─────────────────────────────────────────────
    rocket_climb: {
      id: 'rocket_climb',
      nameKey: 'trick.rocket_climb',
      baseScore: 22,
      scoreMultiplier: 1.3,
      families: ['tumbler', 'highflyer', 'roller'],
      requiredStat: 'endurance',
      minStatValue: 45,
      difficulty: 'intermediate',
      trainingTime: { min: 5, max: 12, unit: 'sessions' },
      prerequisites: [],
      animation: {
        name: 'anim_rocket_climb',
        duration: 1800,
        frames: 22,
        loop: false
      },
      descriptionKey: 'trick.rocket_climb.desc',
      icon: 'trick_rocket_climb'
    },

    // ─────────────────────────────────────────────
    // 7. Sync Spin — Coordinated flock spinning
    // ─────────────────────────────────────────────
    sync_spin: {
      id: 'sync_spin',
      nameKey: 'trick.sync_spin',
      baseScore: 15,
      scoreMultiplier: 1.5,
      families: ['roller', 'highflyer', 'singer'],
      requiredStat: 'flockSync',
      minStatValue: 50,
      difficulty: 'intermediate',
      trainingTime: { min: 7, max: 15, unit: 'sessions' },
      prerequisites: [],
      animation: {
        name: 'anim_sync_spin',
        duration: 2400,
        frames: 28,
        loop: true
      },
      descriptionKey: 'trick.sync_spin.desc',
      icon: 'trick_sync_spin',
      special: {
        requiresFlock: true,
        minFlockSize: 3,
        syncBonusPerBird: 0.08
      }
    },

    // ─────────────────────────────────────────────
    // 8. Diamond Landing — Perfect precision landing
    // ─────────────────────────────────────────────
    diamond_landing: {
      id: 'diamond_landing',
      nameKey: 'trick.diamond_landing',
      baseScore: 60,
      scoreMultiplier: 2.2,
      families: ['postal', 'ornamental'],
      requiredStat: 'style',
      minStatValue: 65,
      difficulty: 'master',
      trainingTime: { min: 15, max: 30, unit: 'sessions' },
      prerequisites: ['tail_sit', 'dive'],
      animation: {
        name: 'anim_diamond_landing',
        duration: 3000,
        frames: 36,
        loop: false
      },
      descriptionKey: 'trick.diamond_landing.desc',
      icon: 'trick_diamond_landing',
      special: {
        perfectLandingBonus: 1.5,
        judgeImpression: 20
      }
    }
  },

  // ═══════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════

  /**
   * Get a trick by its id
   * @param {string} id - Trick identifier
   * @returns {object|null}
   */
  getTrick: function(id) {
    return this.tricks[id] || null;
  },

  /**
   * Get all tricks available to a specific family
   * @param {string} family - Family name (tumbler|roller|highflyer|postal|ornamental|singer)
   * @returns {object[]}
   */
  getTricksByFamily: function(family) {
    return Object.values(this.tricks).filter(function(t) {
      return t.families.indexOf(family) !== -1;
    });
  },

  /**
   * Get all trick ids
   * @returns {string[]}
   */
  getAllTrickIds: function() {
    return Object.keys(this.tricks);
  },

  /**
   * Get tricks sorted by difficulty
   * @returns {object[]}
   */
  getTricksByDifficulty: function() {
    var order = { 'beginner': 0, 'intermediate': 1, 'advanced': 2, 'master': 3 };
    return Object.values(this.tricks).sort(function(a, b) {
      return (order[a.difficulty] || 0) - (order[b.difficulty] || 0);
    });
  },

  /**
   * Check if a pigeon can learn a trick based on its stats and known tricks
   * @param {object} pigeon - Pigeon object with stats and learnedTricks array
   * @param {string} trickId - Trick id to check
   * @returns {{ canLearn: boolean, reason: string }}
   */
  canLearnTrick: function(pigeon, trickId) {
    var trick = this.getTrick(trickId);
    if (!trick) {
      return { canLearn: false, reason: 'trick_not_found' };
    }

    // Check family compatibility
    if (trick.families.indexOf(pigeon.breed.family) === -1) {
      return { canLearn: false, reason: 'incompatible_family' };
    }

    // Check prerequisites
    for (var i = 0; i < trick.prerequisites.length; i++) {
      if (!pigeon.learnedTricks || pigeon.learnedTricks.indexOf(trick.prerequisites[i]) === -1) {
        return { canLearn: false, reason: 'missing_prerequisite_' + trick.prerequisites[i] };
      }
    }

    // Check required stat
    var statValue = pigeon.stats ? pigeon.stats[trick.requiredStat] : 0;
    if (typeof statValue === 'object') {
      statValue = statValue.base || 0;
    }
    if (statValue < trick.minStatValue) {
      return { canLearn: false, reason: 'insufficient_' + trick.requiredStat };
    }

    return { canLearn: true, reason: 'eligible' };
  },

  /**
   * Calculate the score for performing a trick
   * @param {object} trick - Trick object
   * @param {number} statValue - Current value of the required stat
   * @param {number} [flockBonus=0] - Additional flock sync bonus
   * @returns {number} Calculated score
   */
  calculateScore: function(trick, statValue, flockBonus) {
    flockBonus = flockBonus || 0;
    var statMod = 1 + (statValue / 100);
    var score = trick.baseScore * trick.scoreMultiplier * statMod;
    if (flockBonus > 0 && trick.special && trick.special.syncBonusPerBird) {
      score *= (1 + flockBonus * trick.special.syncBonusPerBird);
    }
    return Math.round(score * 100) / 100;
  }
};
