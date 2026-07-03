/**
 * World of Pigeon's — Training System
 * ΔV = k*(Cap-V)*E*S   diminishing-returns stat gain.
 * Depends on: GeneticsSystem, EventBus
 */
(function () {
  'use strict';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ─────────────── training type definitions ─────────────── */

  /**
   * Each training type has:
   *   intensity   — multiplier for activity factor E
   *   statFocus   — which stats get trained (weights 0-1)
   *   injuryRisk  — probability of injury per session (0-1)
   *   hungerCost  — hunger added per session
   *   conditionCost — condition lost per session
   */
  const TRAINING_TYPES = {
    basicFlight: {
      label: 'Basic Flight',
      intensity: 0.7,
      statFocus: { speed: 0.6, endurance: 0.8, agility: 0.4, intelligence: 0.2, strength: 0.3, charisma: 0.1 },
      injuryRisk: 0.02,
      hungerCost: 8,
      conditionCost: 5
    },
    acrobatics: {
      label: 'Acrobatics',
      intensity: 1.0,
      statFocus: { speed: 0.4, endurance: 0.5, agility: 1.0, intelligence: 0.5, strength: 0.3, charisma: 0.6 },
      injuryRisk: 0.06,
      hungerCost: 12,
      conditionCost: 10
    },
    intense: {
      label: 'Intense Training',
      intensity: 1.3,
      statFocus: { speed: 0.8, endurance: 1.0, agility: 0.7, intelligence: 0.3, strength: 1.0, charisma: 0.2 },
      injuryRisk: 0.12,
      hungerCost: 18,
      conditionCost: 18
    },
    rest: {
      label: 'Rest',
      intensity: 0.0,
      statFocus: { speed: 0, endurance: 0, agility: 0, intelligence: 0.05, strength: 0, charisma: 0.1 },
      injuryRisk: 0.0,
      hungerCost: 2,
      conditionCost: -15   // negative = recovery
    }
  };

  /* ─────────────── core formula ─────────────── */

  /**
   * ΔV = k * (Cap - V) * E * S
   *
   * k = learningSpeed (per-pigeon attribute, default 0.05)
   * Cap = stat cap
   * V = current stat value
   * E = activity factor (intensity * statFocus weight), range 0.5 - 1.5
   * S = condition factor (mapped from pigeon condition), range 0.6 - 1.1
   */
  function calculateStatGain(pigeon, stat, trainingType) {
    const type = TRAINING_TYPES[trainingType];
    if (!type) return 0;

    const statData = pigeon.stats[stat];
    if (!statData) return 0;

    const V   = statData.current;
    const Cap = statData.cap;

    if (V >= Cap) return 0;  // already maxed

    // k — pigeon's learning speed (default 0.05, can be influenced by intelligence)
    const intellFactor = pigeon.stats.intelligence
      ? 1.0 + (pigeon.stats.intelligence.current / 500)  // slight boost from intelligence
      : 1.0;
    const k = (pigeon.learningSpeed || 0.05) * intellFactor;

    // E — activity factor
    const focusWeight = (type.statFocus[stat] || 0);
    const E = clamp(type.intensity * focusWeight, 0.0, 1.5);
    // if intensity is 0 (rest) and focus is tiny, allow small gain
    if (E === 0 && focusWeight === 0) return 0;
    const effectiveE = Math.max(E, 0.5 * focusWeight); // minimum activity

    // S — condition factor  (condition 0-100 maps to 0.6-1.1)
    const condition = clamp(pigeon.condition || 100, 0, 100);
    const S = 0.6 + (condition / 100) * 0.5;   // 0→0.6, 100→1.1

    const delta = k * (Cap - V) * effectiveE * S;

    return Math.max(0, delta);
  }

  /* ─────────────── training session ─────────────── */

  /**
   * trainPigeon(pigeon, type)
   * Applies one training session to the pigeon, returns results.
   */
  function trainPigeon(pigeon, trainingType) {
    if (!pigeon) throw new Error('Pigeon required for training');
    if (pigeon.lifecycle !== 'adult' && pigeon.lifecycle !== 'mukluf') {
      return { success: false, reason: 'Pigeon must be mukluf or adult to train.' };
    }

    const type = TRAINING_TYPES[trainingType];
    if (!type) return { success: false, reason: 'Unknown training type: ' + trainingType };

    // check if pigeon is too tired / hungry
    if (pigeon.condition < 10 && trainingType !== 'rest') {
      return { success: false, reason: 'Pigeon is too exhausted. Let it rest first.' };
    }
    if (pigeon.hunger >= 90 && trainingType !== 'rest') {
      return { success: false, reason: 'Pigeon is too hungry. Feed it first.' };
    }
    if (pigeon.health < 30) {
      return { success: false, reason: 'Pigeon is too sick to train.' };
    }

    const STATS = (window.GeneticsSystem && window.GeneticsSystem.STAT_NAMES) ||
                  ['speed','endurance','agility','intelligence','strength','charisma'];

    const gains = {};
    let totalGain = 0;

    for (const stat of STATS) {
      const delta = calculateStatGain(pigeon, stat, trainingType);
      if (delta > 0) {
        const rounded = Math.round(delta * 100) / 100;
        pigeon.stats[stat].current = clamp(
          pigeon.stats[stat].current + rounded,
          0,
          pigeon.stats[stat].cap
        );
        gains[stat] = rounded;
        totalGain += rounded;
      }
    }

    // apply costs
    pigeon.hunger    = clamp((pigeon.hunger || 0) + type.hungerCost, 0, 100);
    pigeon.condition = clamp((pigeon.condition || 100) + (type.conditionCost < 0 ? -type.conditionCost : -type.conditionCost), 0, 100);
    // rest recovers condition
    if (trainingType === 'rest') {
      pigeon.condition = clamp((pigeon.condition || 0) + 15, 0, 100);
      pigeon.hunger    = clamp((pigeon.hunger || 0) - 5, 0, 100);
    }

    // injury check
    let injured = false;
    let injuryDetail = null;
    if (type.injuryRisk > 0 && Math.random() < type.injuryRisk) {
      injured = true;
      const INJURIES = [
        { name: 'wing_strain',   conditionPenalty: 20, healDays: 3 },
        { name: 'leg_sprain',    conditionPenalty: 15, healDays: 2 },
        { name: 'feather_damage', conditionPenalty: 10, healDays: 1 },
        { name: 'exhaustion',    conditionPenalty: 25, healDays: 4 }
      ];
      injuryDetail = INJURIES[Math.floor(Math.random() * INJURIES.length)];
      pigeon.condition = clamp(pigeon.condition - injuryDetail.conditionPenalty, 0, 100);
      pigeon.health    = clamp((pigeon.health || 100) - 10, 0, 100);

      pigeon.history = pigeon.history || [];
      pigeon.history.push({
        type: 'injury',
        injury: injuryDetail.name,
        training: trainingType,
        timestamp: Date.now()
      });

      if (window.EventBus) {
        window.EventBus.emit('training:injury', { pigeonId: pigeon.id, injury: injuryDetail, trainingType: trainingType });
      }
    }

    // recalculate QI
    if (window.GeneticsSystem) {
      pigeon.qi = window.GeneticsSystem.calculateQi(pigeon);
      pigeon.grade = window.GeneticsSystem.getQualityGrade(pigeon.qi);
    }

    // loyalty boost from training
    pigeon.loyalty = clamp((pigeon.loyalty || 50) + 1, 0, 100);

    const result = {
      success: true,
      trainingType: trainingType,
      gains: gains,
      totalGain: Math.round(totalGain * 100) / 100,
      injured: injured,
      injuryDetail: injuryDetail,
      conditionAfter: pigeon.condition,
      hungerAfter: pigeon.hunger,
      qi: pigeon.qi,
      grade: pigeon.grade
    };

    if (window.EventBus) {
      window.EventBus.emit('training:completed', { pigeonId: pigeon.id, result: result });
    }

    return result;
  }

  /* ─────────────── bulk / scheduled training ─────────────── */

  /**
   * trainMultiple(pigeons, type) — train an array of pigeons
   */
  function trainMultiple(pigeons, trainingType) {
    const results = [];
    for (const p of pigeons) {
      results.push({ pigeonId: p.id, result: trainPigeon(p, trainingType) });
    }
    return results;
  }

  /**
   * getRecommendedTraining(pigeon) — suggest best training type
   */
  function getRecommendedTraining(pigeon) {
    if (!pigeon) return 'rest';
    if (pigeon.condition < 30 || pigeon.hunger > 70) return 'rest';
    if (pigeon.condition < 60) return 'basicFlight';

    // find weakest stat relative to cap
    const STATS = (window.GeneticsSystem && window.GeneticsSystem.STAT_NAMES) ||
                  ['speed','endurance','agility','intelligence','strength','charisma'];
    let worstRatio = 1;
    let worstStat = 'speed';
    for (const s of STATS) {
      const ratio = pigeon.stats[s].cap > 0 ? pigeon.stats[s].current / pigeon.stats[s].cap : 1;
      if (ratio < worstRatio) { worstRatio = ratio; worstStat = s; }
    }

    // pick training that focuses on weakest stat
    if (['agility', 'charisma'].indexOf(worstStat) !== -1) return 'acrobatics';
    if (['strength', 'endurance'].indexOf(worstStat) !== -1) return pigeon.condition > 70 ? 'intense' : 'basicFlight';
    return 'basicFlight';
  }

  /* ─────────────── public API ─────────────── */

  window.TrainingSystem = {
    trainPigeon:            trainPigeon,
    calculateStatGain:      calculateStatGain,
    trainMultiple:          trainMultiple,
    getRecommendedTraining: getRecommendedTraining,
    TRAINING_TYPES:         TRAINING_TYPES
  };

})();
