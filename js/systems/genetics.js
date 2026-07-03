/**
 * World of Pigeon's — Genetics System
 * Mendelian inheritance, polygenic stats, mutations, quality index.
 * Pattern: window.GeneticsSystem = { ... }
 */
(function () {
  'use strict';

  /* ───────────────────────── helpers ───────────────────────── */

  let _idCounter = Date.now();

  function generateId() {
    _idCounter += 1;
    return 'pgn_' + _idCounter.toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  /** Box-Muller transform → standard normal */
  function gaussianRandom(mean, stddev) {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random(); // avoid log(0)
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z * stddev;
  }

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ──────────────── Mendelian dominance tables ──────────────── */

  // Dominance hierarchy per trait (first = most dominant)
  const DOMINANCE = {
    color:        ['blue', 'red', 'black', 'white'],
    pattern:      ['solid', 'pied', 'barred'],
    crest:        ['crest', 'plain'],
    featheredFeet:['feathered', 'clean'],
    chestFrill:   ['frill', 'smooth']
  };

  /**
   * Return allele pair for a trait given phenotype and dominance order.
   * Phenotype that is the recessive-most gets 'rr', otherwise random
   * heterozygote or homozygous dominant.
   */
  function phenotypeToAlleles(trait, phenotype) {
    const order = DOMINANCE[trait];
    const idx = order.indexOf(phenotype);
    if (idx === -1) return [order[0], order[0]]; // fallback
    if (idx === order.length - 1) {
      // fully recessive
      return [phenotype, phenotype];
    }
    // random: 50 % homozygous dominant, 50 % heterozygous
    if (Math.random() < 0.5) {
      return [phenotype, phenotype]; // DD
    }
    // heterozygous with next recessive
    const recessivePartner = order[idx + 1] || order[idx];
    return [phenotype, recessivePartner]; // Dr
  }

  /**
   * Mendel cross for one trait.
   * DD×DD=100%D, DD×Dr=100%D, Dr×Dr=75%D/25%r,
   * Dr×rr=50/50, rr×rr=100%r
   */
  function mendelCross(allelesA, allelesB, trait) {
    const order = DOMINANCE[trait];
    // build punnett
    const outcomes = [];
    for (const a of allelesA) {
      for (const b of allelesB) {
        outcomes.push([a, b]);
      }
    }
    const chosen = pick(outcomes);
    // determine phenotype: the most dominant allele wins
    const idxA = order.indexOf(chosen[0]);
    const idxB = order.indexOf(chosen[1]);
    const phenotype = (idxA <= idxB) ? chosen[0] : chosen[1];
    // sort alleles so dominant comes first
    const sorted = (idxA <= idxB) ? [chosen[0], chosen[1]] : [chosen[1], chosen[0]];
    return { alleles: sorted, phenotype: phenotype };
  }

  /* ──────────────── stat definitions ──────────────── */

  const STAT_NAMES = ['speed', 'endurance', 'agility', 'intelligence', 'strength', 'charisma'];

  const LIFECYCLE_STAGES = {
    egg:    { label: 'Egg',    durationDays: { min: 17, max: 18 } },
    vizzik: { label: 'Vizzik', durationDays: 40 },
    mukluf: { label: 'Mukluf', durationDays: 45 },
    adult:  { label: 'Adult',  durationDays: Infinity }
  };

  const TEMPERAMENTS = ['calm', 'energetic', 'curious', 'shy', 'bold', 'gentle', 'stubborn'];

  /* ──────────────── mutation engine ──────────────── */

  const MUTATION_BASE_CHANCE = 0.015;   // 1.5 %
  const MUTATION_MAX_CHANCE  = 0.06;    // 6 %

  function mutationChance(generation) {
    // slightly increase with generation, cap at max
    return Math.min(MUTATION_BASE_CHANCE + generation * 0.002, MUTATION_MAX_CHANCE);
  }

  function applyMutation(pigeon, generation) {
    const chance = mutationChance(generation);
    if (Math.random() >= chance) return; // no mutation

    const roll = Math.random();
    if (roll < 0.4) {
      // cap boost +5..+15 on a random stat
      const stat = pick(STAT_NAMES);
      const boost = 5 + Math.floor(Math.random() * 11); // 5-15
      pigeon.stats[stat].cap = clamp(pigeon.stats[stat].cap + boost, 1, 120);
      pigeon.history.push({ type: 'mutation', detail: 'cap_boost', stat: stat, amount: boost });
    } else if (roll < 0.7) {
      // rare color mutation
      const rareColors = ['silver', 'gold', 'albino', 'iridescent'];
      const newColor = pick(rareColors);
      pigeon.genetics.color.phenotype = newColor;
      pigeon.history.push({ type: 'mutation', detail: 'rare_color', color: newColor });
    } else {
      // trait flip — random binary trait toggles
      const binaryTraits = ['crest', 'featheredFeet', 'chestFrill'];
      const trait = pick(binaryTraits);
      const order = DOMINANCE[trait];
      const current = pigeon.genetics[trait].phenotype;
      const flipped = current === order[0] ? order[1] : order[0];
      pigeon.genetics[trait].phenotype = flipped;
      pigeon.genetics[trait].alleles = [flipped, flipped];
      pigeon.history.push({ type: 'mutation', detail: 'trait_flip', trait: trait, from: current, to: flipped });
    }

    if (window.EventBus) {
      window.EventBus.emit('pigeon:mutation', { pigeonId: pigeon.id, history: pigeon.history[pigeon.history.length - 1] });
    }
  }

  /* ──────────────── quality index ──────────────── */

  /**
   * Qi = 0.45*P + 0.25*F + 0.20*G + 0.10*H
   * P = performance (avg stat current / avg cap)
   * F = form (physical score 0-100)
   * G = genetics purity (avg cap percentile)
   * H = health (condition 0-100)
   */
  function calculateQi(pigeon) {
    // P — performance ratio
    let sumCur = 0, sumCap = 0;
    for (const s of STAT_NAMES) {
      sumCur += pigeon.stats[s].current;
      sumCap += pigeon.stats[s].cap;
    }
    const P = sumCap > 0 ? (sumCur / sumCap) * 100 : 0;

    // F — form / physical (simple heuristic)
    const F = pigeon.physical ? pigeon.physical.formScore || 50 : 50;

    // G — genetics (cap average as percentile, 100 cap = 100)
    const avgCap = sumCap / STAT_NAMES.length;
    const G = clamp(avgCap, 0, 100);

    // H — health / condition
    const H = pigeon.condition || 100;

    const qi = clamp(Math.round(0.45 * P + 0.25 * F + 0.20 * G + 0.10 * H), 0, 100);
    return qi;
  }

  function getQualityGrade(qi) {
    if (qi >= 97) return 'SSR';
    if (qi >= 93) return 'SS';
    if (qi >= 85) return 'S';
    if (qi >= 70) return 'A';
    if (qi >= 50) return 'B+';
    if (qi >= 25) return 'B';
    return 'B';
  }

  /* ──────────────── pigeon factory ──────────────── */

  /**
   * createPigeon(breedId, opts)
   * opts: { name, gender, generation, parentIds, statsOverride, geneticsOverride }
   */
  function createPigeon(breedId, opts) {
    opts = opts || {};
    const breed = (window.BreedsDB && window.BreedsDB[breedId]) || {};
    const gender = opts.gender || pick(['male', 'female']);
    const generation = opts.generation || 0;

    // --- genetics (Mendelian traits) ---
    const genetics = {};
    const TRAIT_KEYS = ['color', 'pattern', 'crest', 'featheredFeet', 'chestFrill'];
    for (const trait of TRAIT_KEYS) {
      if (opts.geneticsOverride && opts.geneticsOverride[trait]) {
        genetics[trait] = opts.geneticsOverride[trait];
      } else {
        const pool = DOMINANCE[trait];
        const phenotype = breed[trait] || pick(pool);
        const alleles = phenotypeToAlleles(trait, phenotype);
        genetics[trait] = { alleles: alleles, phenotype: phenotype };
      }
    }

    // --- stats (polygenic) ---
    const stats = {};
    for (const s of STAT_NAMES) {
      const breedBase = (breed.statRanges && breed.statRanges[s]) || { min: 30, max: 70 };
      const cap = (opts.statsOverride && opts.statsOverride[s] && opts.statsOverride[s].cap)
        ? opts.statsOverride[s].cap
        : clamp(Math.round(breedBase.min + Math.random() * (breedBase.max - breedBase.min)), 1, 120);
      const current = (opts.statsOverride && opts.statsOverride[s] && opts.statsOverride[s].current)
        ? opts.statsOverride[s].current
        : clamp(Math.round(cap * (0.15 + Math.random() * 0.25)), 1, cap);
      stats[s] = { current: current, cap: cap };
    }

    // --- physical ---
    const physical = {
      weight: breed.avgWeight || (250 + Math.random() * 200),
      wingspan: breed.avgWingspan || (60 + Math.random() * 30),
      formScore: 40 + Math.floor(Math.random() * 40)
    };

    const pigeon = {
      id: generateId(),
      name: opts.name || ('Pigeon_' + Math.floor(Math.random() * 9999)),
      breedId: breedId,
      generation: generation,
      age: 0,               // days
      lifecycle: 'egg',
      gender: gender,
      genetics: genetics,
      stats: stats,
      physical: physical,
      temperament: pick(TEMPERAMENTS),
      condition: 100,
      loyalty: 50,
      hunger: 0,
      health: 100,
      qi: 0,
      grade: 'B',
      history: [],
      parentIds: opts.parentIds || [],
      isFavorite: false,
      isForSale: false
    };

    pigeon.qi = calculateQi(pigeon);
    pigeon.grade = getQualityGrade(pigeon.qi);

    // maybe mutate
    applyMutation(pigeon, generation);

    // recalc after possible mutation
    pigeon.qi = calculateQi(pigeon);
    pigeon.grade = getQualityGrade(pigeon.qi);

    if (window.EventBus) {
      window.EventBus.emit('pigeon:created', { pigeon: pigeon });
    }

    return pigeon;
  }

  /* ──────────────── breeding (genetics side) ──────────────── */

  /**
   * breedPigeons(mother, father) → child pigeon object
   * Mendelian cross for each trait, polygenic average + gaussian noise for stats.
   */
  function breedPigeons(mother, father) {
    if (!mother || !father) throw new Error('Both mother and father required');
    if (mother.gender === father.gender) throw new Error('Need one male and one female');

    // ensure mother is female
    const mom = mother.gender === 'female' ? mother : father;
    const dad = mother.gender === 'female' ? father : mother;

    const childGeneration = Math.max(mom.generation, dad.generation) + 1;

    // --- Mendelian traits ---
    const geneticsOverride = {};
    const TRAIT_KEYS = ['color', 'pattern', 'crest', 'featheredFeet', 'chestFrill'];
    for (const trait of TRAIT_KEYS) {
      const momAlleles = mom.genetics[trait].alleles;
      const dadAlleles = dad.genetics[trait].alleles;
      geneticsOverride[trait] = mendelCross(momAlleles, dadAlleles, trait);
    }

    // --- Polygenic stats: Cap_offspring = 0.5*(Cap_m+Cap_f) + gaussianRandom(0,6) + mutation ---
    const statsOverride = {};
    for (const s of STAT_NAMES) {
      const avgCap = 0.5 * (mom.stats[s].cap + dad.stats[s].cap);
      const noise = gaussianRandom(0, 6);
      const mutBonus = (Math.random() < mutationChance(childGeneration)) ? (Math.random() * 10) : 0;
      const cap = clamp(Math.round(avgCap + noise + mutBonus), 1, 120);
      const current = clamp(Math.round(cap * (0.10 + Math.random() * 0.15)), 1, cap);
      statsOverride[s] = { current: current, cap: cap };
    }

    // determine breed — use mother's breed by default
    const breedId = mom.breedId;

    const child = createPigeon(breedId, {
      generation: childGeneration,
      parentIds: [mom.id, dad.id],
      geneticsOverride: geneticsOverride,
      statsOverride: statsOverride
    });

    child.history.push({
      type: 'birth',
      motherId: mom.id,
      fatherId: dad.id,
      timestamp: Date.now()
    });

    if (window.EventBus) {
      window.EventBus.emit('pigeon:bred', { child: child, motherId: mom.id, fatherId: dad.id });
    }

    return child;
  }

  /* ──────────────── public API ──────────────── */

  window.GeneticsSystem = {
    createPigeon:     createPigeon,
    breedPigeons:     breedPigeons,
    calculateQi:      calculateQi,
    getQualityGrade:   getQualityGrade,
    generateId:       generateId,

    // exposed for other systems
    STAT_NAMES:       STAT_NAMES,
    LIFECYCLE_STAGES: LIFECYCLE_STAGES,
    DOMINANCE:        DOMINANCE,
    gaussianRandom:   gaussianRandom,
    clamp:            clamp
  };

})();
