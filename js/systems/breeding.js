/**
 * World of Pigeon's — Breeding System
 * Compatibility, egg laying, hatching, chick growth lifecycle.
 * Depends on: GeneticsSystem, EventBus
 */
(function () {
  'use strict';

  var clamp  = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  /* ─────────────── grade-based success rates ─────────────── */

  const GRADE_RATES = {
    'B':   { egg: 0.85, hatch: 0.80 },
    'B+':  { egg: 0.85, hatch: 0.80 },
    'A':   { egg: 0.85, hatch: 0.80 },
    'S':   { egg: 0.70, hatch: 0.60 },
    'SS':  { egg: 0.55, hatch: 0.40 },
    'SSR': { egg: 0.55, hatch: 0.40 }
  };

  /* ─────────────── lifecycle durations (days) ─────────────── */

  const LIFECYCLE = {
    egg:    { min: 17, max: 18 },
    vizzik: { days: 40 },
    mukluf: { days: 45 }
    // after mukluf → adult
  };

  /* ─────────────── active sessions storage ─────────────── */

  const breedingSessions = {};  // sessionId → session object

  /* ─────────────── compatibility ─────────────── */

  /**
   * checkCompatibility(mother, father) → { score: 0-100, description: String }
   *
   * Factors:
   *  - Same breed  → +30
   *  - Breed group  → +15
   *  - Stat complementarity → up to +25
   *  - Genetic diversity (different alleles) → up to +20
   *  - Age penalty (too young / too old) → up to -20
   *  - Health bonus → up to +10
   *  - Inbreeding penalty → -25
   */
  function checkCompatibility(mother, father) {
    if (!mother || !father) return { score: 0, description: 'Missing pigeon data.' };
    if (mother.gender === father.gender) return { score: 0, description: 'Same gender — cannot breed.' };
    if (mother.lifecycle !== 'adult' || father.lifecycle !== 'adult') {
      return { score: 0, description: 'Both pigeons must be adults to breed.' };
    }

    let score = 0;
    const reasons = [];

    // Breed match
    if (mother.breedId === father.breedId) {
      score += 30;
      reasons.push('Same breed (+30)');
    } else {
      // check breed group via BreedsDB
      const mBreed = (window.BreedsDB && window.BreedsDB[mother.breedId]) || {};
      const fBreed = (window.BreedsDB && window.BreedsDB[father.breedId]) || {};
      if (mBreed.group && mBreed.group === fBreed.group) {
        score += 15;
        reasons.push('Same breed group (+15)');
      }
    }

    // Stat complementarity: sum of |capM - capF| normalised
    const STATS = window.GeneticsSystem ? window.GeneticsSystem.STAT_NAMES : ['speed','endurance','agility','intelligence','strength','charisma'];
    let compSum = 0;
    for (const s of STATS) {
      const diff = Math.abs((mother.stats[s].cap || 50) - (father.stats[s].cap || 50));
      compSum += diff;
    }
    const compScore = clamp(Math.round((compSum / (STATS.length * 60)) * 25), 0, 25);
    score += compScore;
    reasons.push('Stat complementarity (+' + compScore + ')');

    // Genetic diversity
    const TRAITS = ['color', 'pattern', 'crest', 'featheredFeet', 'chestFrill'];
    let diverseCount = 0;
    for (const t of TRAITS) {
      if (mother.genetics[t].phenotype !== father.genetics[t].phenotype) diverseCount++;
    }
    const divScore = Math.round((diverseCount / TRAITS.length) * 20);
    score += divScore;
    reasons.push('Genetic diversity (+' + divScore + ')');

    // Age penalty
    if (mother.age < 90 || father.age < 90) {
      score -= 15;
      reasons.push('Too young (-15)');
    } else if (mother.age > 1500 || father.age > 1500) {
      score -= 20;
      reasons.push('Advanced age (-20)');
    }

    // Health bonus
    const avgHealth = ((mother.health || 100) + (father.health || 100)) / 2;
    const healthBonus = Math.round((avgHealth / 100) * 10);
    score += healthBonus;
    reasons.push('Health (+' + healthBonus + ')');

    // Inbreeding check (share a parent)
    if (mother.parentIds && father.parentIds) {
      const shared = mother.parentIds.filter(function (id) { return father.parentIds.indexOf(id) !== -1; });
      if (shared.length > 0) {
        score -= 25;
        reasons.push('Inbreeding penalty (-25)');
      }
    }

    score = clamp(score, 0, 100);

    let desc = '';
    if (score >= 80) desc = 'Excellent pairing!';
    else if (score >= 60) desc = 'Good compatibility.';
    else if (score >= 40) desc = 'Moderate compatibility.';
    else if (score >= 20) desc = 'Poor compatibility.';
    else desc = 'Very low compatibility.';

    return { score: score, description: desc + ' ' + reasons.join(', ') };
  }

  /* ─────────────── breeding efficiency ─────────────── */

  /**
   * Efficiency = base * compat * feedFactor * (1 - overbreedin)
   * overbreedin = min(breedCount / 10, 0.5)  → up to 50 % penalty
   */
  function calcEfficiency(compat, feedQuality, breedCount) {
    const base = 1.0;
    const compatFactor = clamp(compat / 100, 0.2, 1.0);
    const feedFactor   = clamp(feedQuality || 1.0, 0.5, 1.5);
    const overbreeding = Math.min((breedCount || 0) / 10, 0.5);
    return base * compatFactor * feedFactor * (1 - overbreeding);
  }

  /* ─────────────── session management ─────────────── */

  function startBreeding(motherId, fatherId, pigeonLookup) {
    if (!pigeonLookup) pigeonLookup = function () { return null; };
    const mother = pigeonLookup(motherId);
    const father = pigeonLookup(fatherId);
    if (!mother || !father) throw new Error('Cannot find pigeons for breeding.');

    const compat = checkCompatibility(mother, father);
    if (compat.score === 0) {
      return { success: false, reason: compat.description };
    }

    const sessionId = 'breed_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const session = {
      id: sessionId,
      motherId: motherId,
      fatherId: fatherId,
      compatibility: compat,
      status: 'breeding',       // breeding → egg → hatching → chick → done
      startedAt: Date.now(),
      eggLaidDay: null,
      hatchDay: null,
      childId: null,
      efficiency: calcEfficiency(compat.score, 1.0, (mother._breedCount || 0)),
      feedQuality: 1.0,
      dayCounter: 0
    };

    breedingSessions[sessionId] = session;

    if (window.EventBus) {
      window.EventBus.emit('breeding:started', { session: session });
    }

    return { success: true, sessionId: sessionId, compatibility: compat };
  }

  /**
   * layEgg(sessionId) — attempt egg laying.
   * Uses grade-based egg rate * efficiency.
   */
  function layEgg(sessionId, mother) {
    const session = breedingSessions[sessionId];
    if (!session) throw new Error('Invalid session: ' + sessionId);
    if (session.status !== 'breeding') return { success: false, reason: 'Not in breeding stage.' };

    const grade = (mother && mother.grade) || 'B';
    const rates = GRADE_RATES[grade] || GRADE_RATES['B'];
    const chance = rates.egg * session.efficiency;

    if (Math.random() < chance) {
      session.status = 'egg';
      session.eggLaidDay = session.dayCounter;
      if (window.EventBus) window.EventBus.emit('breeding:eggLaid', { sessionId: sessionId });
      return { success: true, message: 'Egg laid successfully!' };
    }

    return { success: false, message: 'Egg laying failed this cycle.' };
  }

  /**
   * hatchEgg(sessionId, mother, father) — attempt hatching after incubation period.
   * Returns child pigeon on success.
   */
  function hatchEgg(sessionId, mother, father) {
    const session = breedingSessions[sessionId];
    if (!session) throw new Error('Invalid session: ' + sessionId);
    if (session.status !== 'egg') return { success: false, reason: 'No egg to hatch.' };

    // check incubation time
    const incubationDays = LIFECYCLE.egg.min + Math.floor(Math.random() * (LIFECYCLE.egg.max - LIFECYCLE.egg.min + 1));
    const daysInEgg = session.dayCounter - session.eggLaidDay;
    if (daysInEgg < incubationDays) {
      return { success: false, reason: 'Egg needs more time (' + daysInEgg + '/' + incubationDays + ' days).' };
    }

    const grade = (mother && mother.grade) || 'B';
    const rates = GRADE_RATES[grade] || GRADE_RATES['B'];
    const chance = rates.hatch * session.efficiency;

    if (Math.random() < chance) {
      // produce child via genetics
      const GS = window.GeneticsSystem;
      if (!GS) throw new Error('GeneticsSystem not loaded');
      const child = GS.breedPigeons(mother, father);
      child.lifecycle = 'vizzik';
      child.age = 0;

      session.status = 'chick';
      session.hatchDay = session.dayCounter;
      session.childId = child.id;

      if (window.EventBus) window.EventBus.emit('breeding:hatched', { sessionId: sessionId, child: child });
      return { success: true, child: child };
    }

    session.status = 'failed';
    if (window.EventBus) window.EventBus.emit('breeding:hatchFailed', { sessionId: sessionId });
    return { success: false, reason: 'Hatching failed.' };
  }

  /**
   * updateChick(sessionId, child)
   * Advances lifecycle: vizzik(40d) → mukluf(45d) → adult
   */
  function updateChick(sessionId, child) {
    const session = breedingSessions[sessionId];
    if (!session) return;
    if (!child) return;

    session.dayCounter += 1;
    child.age += 1;

    if (child.lifecycle === 'vizzik' && child.age >= LIFECYCLE.vizzik.days) {
      child.lifecycle = 'mukluf';
      if (window.EventBus) window.EventBus.emit('breeding:stageChange', { sessionId: sessionId, stage: 'mukluf', childId: child.id });
    } else if (child.lifecycle === 'mukluf' && child.age >= (LIFECYCLE.vizzik.days + LIFECYCLE.mukluf.days)) {
      child.lifecycle = 'adult';
      session.status = 'done';
      if (window.EventBus) window.EventBus.emit('breeding:adultReached', { sessionId: sessionId, childId: child.id });
    }

    // small daily stat growth while chick
    if (child.lifecycle === 'vizzik' || child.lifecycle === 'mukluf') {
      const STATS = window.GeneticsSystem ? window.GeneticsSystem.STAT_NAMES : ['speed','endurance','agility','intelligence','strength','charisma'];
      for (const s of STATS) {
        const growthRate = child.lifecycle === 'vizzik' ? 0.3 : 0.5;
        child.stats[s].current = clamp(
          child.stats[s].current + growthRate,
          0,
          child.stats[s].cap
        );
      }
    }

    return child;
  }

  /**
   * advanceDay(sessionId, mother, father)
   * Call once per game-day to progress the breeding session.
   */
  function advanceDay(sessionId, mother, father, child) {
    const session = breedingSessions[sessionId];
    if (!session) return null;

    session.dayCounter += 1;

    if (session.status === 'breeding') {
      return layEgg(sessionId, mother);
    } else if (session.status === 'egg') {
      return hatchEgg(sessionId, mother, father);
    } else if (session.status === 'chick' && child) {
      return updateChick(sessionId, child);
    }
    return null;
  }

  function getSession(sessionId) {
    return breedingSessions[sessionId] || null;
  }

  function getAllSessions() {
    return Object.assign({}, breedingSessions);
  }

  /* ─────────────── public API ─────────────── */

  window.BreedingSystem = {
    checkCompatibility: checkCompatibility,
    startBreeding:      startBreeding,
    layEgg:             layEgg,
    hatchEgg:           hatchEgg,
    updateChick:        updateChick,
    advanceDay:         advanceDay,
    getSession:         getSession,
    getAllSessions:      getAllSessions,
    calcEfficiency:     calcEfficiency,
    GRADE_RATES:        GRADE_RATES,
    LIFECYCLE:          LIFECYCLE
  };

})();
