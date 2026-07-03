/**
 * World of Pigeon's — Flight System
 * Flight sessions, trick scoring, style, sync, rewards.
 * Depends on: GeneticsSystem, TricksDB, EventBus
 */
(function () {
  'use strict';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ─────────────── default tricks (fallback if TricksDB absent) ─────────────── */

  const DEFAULT_TRICKS = {
    barrel_roll:  { name: 'Barrel Roll',  difficulty: 2, baseScore: 15, stat: 'agility',      style: 1.2 },
    loop:         { name: 'Loop',         difficulty: 3, baseScore: 25, stat: 'agility',      style: 1.4 },
    dive:         { name: 'Dive',         difficulty: 2, baseScore: 20, stat: 'speed',        style: 1.1 },
    spiral:       { name: 'Spiral',       difficulty: 4, baseScore: 35, stat: 'agility',      style: 1.6 },
    hover:        { name: 'Hover',        difficulty: 1, baseScore: 10, stat: 'endurance',    style: 1.0 },
    formation:    { name: 'Formation',    difficulty: 3, baseScore: 30, stat: 'intelligence', style: 1.3 },
    powerClimb:   { name: 'Power Climb',  difficulty: 3, baseScore: 25, stat: 'strength',     style: 1.2 },
    showOff:      { name: 'Show Off',     difficulty: 2, baseScore: 20, stat: 'charisma',     style: 1.5 }
  };

  function getTrick(trickId) {
    if (window.TricksDB && window.TricksDB[trickId]) return window.TricksDB[trickId];
    return DEFAULT_TRICKS[trickId] || null;
  }

  function getAllTrickIds() {
    const ids = Object.keys(DEFAULT_TRICKS);
    if (window.TricksDB) {
      for (const k of Object.keys(window.TricksDB)) {
        if (ids.indexOf(k) === -1) ids.push(k);
      }
    }
    return ids;
  }

  /* ─────────────── trick success probability ─────────────── */

  /**
   * P(trick success) = (stat / 100) * condition * (1 - difficulty / 5)
   *
   * stat      = pigeon's current value in the trick's primary stat
   * condition = pigeon.condition / 100 (0-1)
   * difficulty = trick difficulty (1-5)
   */
  function trickSuccessChance(pigeon, trick) {
    const statVal   = (pigeon.stats[trick.stat] && pigeon.stats[trick.stat].current) || 30;
    const condition = clamp((pigeon.condition || 100) / 100, 0, 1);
    const diffPenalty = 1 - (trick.difficulty / 5);
    return clamp((statVal / 100) * condition * diffPenalty, 0.02, 0.98);
  }

  /* ─────────────── flight session ─────────────── */

  const activeSessions = {};

  /**
   * startFlight(pigeonIds, pigeons)
   * pigeons: array of pigeon objects
   */
  function startFlight(pigeonIds, pigeons) {
    if (!pigeonIds || pigeonIds.length === 0) {
      return { success: false, reason: 'No pigeons selected.' };
    }

    // validate all pigeons
    for (const p of pigeons) {
      if (p.lifecycle !== 'adult') {
        return { success: false, reason: p.name + ' is not an adult.' };
      }
      if ((p.condition || 0) < 15) {
        return { success: false, reason: p.name + ' is too exhausted to fly.' };
      }
      if ((p.health || 0) < 20) {
        return { success: false, reason: p.name + ' is too sick to fly.' };
      }
    }

    const sessionId = 'flt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
    const session = {
      id: sessionId,
      pigeonIds: pigeonIds.slice(),
      pigeons: pigeons,
      startedAt: Date.now(),
      status: 'active',
      elapsedMinutes: 0,
      events: [],
      scores: {},          // pigeonId → score
      totalScore: 0,
      trickCount: 0,
      successfulTricks: 0,
      failedTricks: 0,
      riskPenalty: 0,
      durationBonus: 0,
      syncBonus: 0
    };

    for (const id of pigeonIds) {
      session.scores[id] = 0;
    }

    activeSessions[sessionId] = session;

    if (window.EventBus) {
      window.EventBus.emit('flight:started', { sessionId: sessionId, pigeonIds: pigeonIds });
    }

    return { success: true, sessionId: sessionId };
  }

  /* ─────────────── simulation ─────────────── */

  /**
   * simulateFlight(sessionId, minutes)
   * Simulates the given number of minutes, generating events.
   * Returns array of events.
   */
  function simulateFlight(sessionId, minutes) {
    const session = activeSessions[sessionId];
    if (!session || session.status !== 'active') {
      return { success: false, reason: 'Session not active.' };
    }

    minutes = minutes || 5;
    const events = [];
    const trickIds = getAllTrickIds();

    for (let m = 0; m < minutes; m++) {
      session.elapsedMinutes += 1;

      for (const pigeon of session.pigeons) {
        // each pigeon attempts a trick roughly every 2 minutes
        if (Math.random() < 0.5) continue;

        const trickId = trickIds[Math.floor(Math.random() * trickIds.length)];
        const trick = getTrick(trickId);
        if (!trick) continue;

        session.trickCount += 1;
        const chance = trickSuccessChance(pigeon, trick);
        const success = Math.random() < chance;

        let moveScore = 0;
        if (success) {
          session.successfulTricks += 1;
          moveScore = trick.baseScore * (trick.style || 1.0);
          // bonus for high stat
          const statRatio = (pigeon.stats[trick.stat] && pigeon.stats[trick.stat].current / 100) || 0.5;
          moveScore *= (0.8 + statRatio * 0.4); // 0.8 - 1.2 multiplier

          session.scores[pigeon.id] = (session.scores[pigeon.id] || 0) + moveScore;

          events.push({
            minute: session.elapsedMinutes,
            pigeonId: pigeon.id,
            pigeonName: pigeon.name,
            type: 'trick_success',
            trickId: trickId,
            trickName: trick.name,
            score: Math.round(moveScore * 10) / 10
          });
        } else {
          session.failedTricks += 1;
          // risk penalty
          const penalty = trick.difficulty * 3;
          session.riskPenalty += penalty;

          events.push({
            minute: session.elapsedMinutes,
            pigeonId: pigeon.id,
            pigeonName: pigeon.name,
            type: 'trick_fail',
            trickId: trickId,
            trickName: trick.name,
            penalty: penalty
          });

          // small condition loss on fail
          pigeon.condition = clamp((pigeon.condition || 100) - 2, 0, 100);
        }

        // fatigue
        pigeon.condition = clamp((pigeon.condition || 100) - 1, 0, 100);
        pigeon.hunger    = clamp((pigeon.hunger || 0) + 0.5, 0, 100);
      }

      // random special events
      if (Math.random() < 0.08) {
        const specials = ['wind_gust', 'thermal_updraft', 'bird_of_prey', 'rainbow', 'crowd_cheer'];
        const special = specials[Math.floor(Math.random() * specials.length)];
        let effect = 0;
        if (special === 'thermal_updraft') effect = 10;
        else if (special === 'bird_of_prey') effect = -15;
        else if (special === 'crowd_cheer') effect = 5;

        events.push({
          minute: session.elapsedMinutes,
          type: 'special_event',
          event: special,
          effect: effect
        });

        if (effect !== 0) {
          // apply to all pigeons' next score or penalty
          if (effect > 0) {
            for (const id of session.pigeonIds) {
              session.scores[id] = (session.scores[id] || 0) + effect;
            }
          } else {
            session.riskPenalty += Math.abs(effect);
          }
        }
      }
    }

    // calculate duration bonus (longer flights = bonus)
    session.durationBonus = Math.floor(session.elapsedMinutes / 3) * 5;

    // sync bonus (for multi-pigeon flights)
    if (session.pigeonIds.length > 1 && session.successfulTricks > 0) {
      const successRate = session.successfulTricks / Math.max(session.trickCount, 1);
      session.syncBonus = Math.round(successRate * session.pigeonIds.length * 10);
    }

    session.events = session.events.concat(events);

    // total score
    let sumScores = 0;
    for (const id of session.pigeonIds) {
      sumScores += session.scores[id] || 0;
    }
    // Score = Σ(move_score*style) + duration_bonus + sync_bonus - risk_penalty
    session.totalScore = Math.round(sumScores + session.durationBonus + session.syncBonus - session.riskPenalty);
    session.totalScore = Math.max(0, session.totalScore);

    if (window.EventBus) {
      window.EventBus.emit('flight:simulated', { sessionId: sessionId, newEvents: events, totalScore: session.totalScore });
    }

    return { success: true, events: events, totalScore: session.totalScore };
  }

  /* ─────────────── end flight ─────────────── */

  /**
   * endFlight(sessionId) → { rewards, statGains, finalScore }
   */
  function endFlight(sessionId) {
    const session = activeSessions[sessionId];
    if (!session) return { success: false, reason: 'Invalid session.' };

    session.status = 'completed';

    // calculate rewards
    const baseReward    = Math.max(50, session.totalScore * 2);
    const tokenReward   = session.totalScore >= 200 ? Math.floor(session.totalScore / 100) : 0;
    const diamondReward = session.totalScore >= 500 ? 1 : 0;

    const rewards = {
      feedMoney: Math.round(baseReward),
      tokens:    tokenReward,
      diamonds:  diamondReward
    };

    // apply stat gains from flight experience
    const statGains = {};
    const STATS = (window.GeneticsSystem && window.GeneticsSystem.STAT_NAMES) ||
                  ['speed','endurance','agility','intelligence','strength','charisma'];

    for (const pigeon of session.pigeons) {
      const pGains = {};
      for (const stat of STATS) {
        // flight gives small experience-based gains
        const ratio = session.successfulTricks / Math.max(session.trickCount, 1);
        const gain = ratio * 0.3 * (1 - (pigeon.stats[stat].current / pigeon.stats[stat].cap));
        if (gain > 0) {
          pigeon.stats[stat].current = clamp(pigeon.stats[stat].current + gain, 0, pigeon.stats[stat].cap);
          pGains[stat] = Math.round(gain * 100) / 100;
        }
      }
      // loyalty boost
      pigeon.loyalty = clamp((pigeon.loyalty || 50) + 3, 0, 100);
      statGains[pigeon.id] = pGains;

      // recalc QI
      if (window.GeneticsSystem) {
        pigeon.qi    = window.GeneticsSystem.calculateQi(pigeon);
        pigeon.grade = window.GeneticsSystem.getQualityGrade(pigeon.qi);
      }
    }

    // add rewards to economy
    if (window.EconomySystem) {
      if (rewards.feedMoney > 0) window.EconomySystem.addCurrency('feedMoney', rewards.feedMoney);
      if (rewards.tokens > 0)    window.EconomySystem.addCurrency('tokens', rewards.tokens);
      if (rewards.diamonds > 0)  window.EconomySystem.addCurrency('diamonds', rewards.diamonds);
    }

    const result = {
      success: true,
      sessionId: sessionId,
      finalScore: session.totalScore,
      durationMinutes: session.elapsedMinutes,
      trickCount: session.trickCount,
      successfulTricks: session.successfulTricks,
      failedTricks: session.failedTricks,
      durationBonus: session.durationBonus,
      syncBonus: session.syncBonus,
      riskPenalty: session.riskPenalty,
      scores: session.scores,
      rewards: rewards,
      statGains: statGains
    };

    if (window.EventBus) {
      window.EventBus.emit('flight:ended', result);
    }

    // clean up
    delete activeSessions[sessionId];

    return result;
  }

  function getSession(sessionId) {
    return activeSessions[sessionId] || null;
  }

  /* ─────────────── public API ─────────────── */

  window.FlightSystem = {
    startFlight:        startFlight,
    simulateFlight:     simulateFlight,
    endFlight:          endFlight,
    getSession:         getSession,
    trickSuccessChance: trickSuccessChance,
    getTrick:           getTrick,
    getAllTrickIds:      getAllTrickIds,
    DEFAULT_TRICKS:     DEFAULT_TRICKS
  };

})();
