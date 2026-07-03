/**
 * World of Pigeon's — Health System
 * Disease contagion, diagnosis, treatment, quarantine, daily health updates.
 * Depends on: GeneticsSystem, DiseasesDB, EventBus
 */
(function () {
  'use strict';

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ─────────────── default diseases (fallback if DiseasesDB absent) ─────────────── */

  const DEFAULT_DISEASES = {
    avian_pox: {
      name: 'Avian Pox',
      contagiousness: 0.35,
      severity: 0.4,
      symptoms: ['skin_lesions', 'lethargy', 'reduced_appetite'],
      dailyHealthDrain: 3,
      dailyConditionDrain: 5,
      naturalRecoveryDays: 14,
      drugs: ['antiviral_a'],
      mortalityRate: 0.05
    },
    pigeon_fever: {
      name: 'Pigeon Fever',
      contagiousness: 0.55,
      severity: 0.6,
      symptoms: ['high_temperature', 'lethargy', 'loss_of_weight'],
      dailyHealthDrain: 5,
      dailyConditionDrain: 8,
      naturalRecoveryDays: 10,
      drugs: ['antibiotic_b', 'fever_reducer'],
      mortalityRate: 0.10
    },
    wing_rot: {
      name: 'Wing Rot',
      contagiousness: 0.15,
      severity: 0.7,
      symptoms: ['wing_discoloration', 'flight_difficulty', 'pain'],
      dailyHealthDrain: 6,
      dailyConditionDrain: 10,
      naturalRecoveryDays: 21,
      drugs: ['antifungal_c'],
      mortalityRate: 0.12
    },
    crop_infection: {
      name: 'Crop Infection',
      contagiousness: 0.45,
      severity: 0.5,
      symptoms: ['vomiting', 'crop_swelling', 'reduced_appetite'],
      dailyHealthDrain: 4,
      dailyConditionDrain: 7,
      naturalRecoveryDays: 12,
      drugs: ['antibiotic_b', 'probiotic_d'],
      mortalityRate: 0.08
    },
    respiratory_disease: {
      name: 'Respiratory Disease',
      contagiousness: 0.65,
      severity: 0.8,
      symptoms: ['wheezing', 'nasal_discharge', 'lethargy', 'loss_of_weight'],
      dailyHealthDrain: 7,
      dailyConditionDrain: 12,
      naturalRecoveryDays: 18,
      drugs: ['antibiotic_b', 'respiratory_med_e'],
      mortalityRate: 0.18
    }
  };

  function getDisease(diseaseId) {
    if (window.DiseasesDB && window.DiseasesDB[diseaseId]) return window.DiseasesDB[diseaseId];
    return DEFAULT_DISEASES[diseaseId] || null;
  }

  function getAllDiseaseIds() {
    const ids = Object.keys(DEFAULT_DISEASES);
    if (window.DiseasesDB) {
      for (const k of Object.keys(window.DiseasesDB)) {
        if (ids.indexOf(k) === -1) ids.push(k);
      }
    }
    return ids;
  }

  /* ─────────────── pigeon health state ─────────────── */

  // per-pigeon health tracking (pigeonId → healthRecord)
  const healthRecords = {};

  function ensureRecord(pigeon) {
    if (!healthRecords[pigeon.id]) {
      healthRecords[pigeon.id] = {
        pigeonId:       pigeon.id,
        diseases:       [],       // [{ diseaseId, dayInfected, daysSick, treated, drugUsed }]
        quarantined:    false,
        diagnosedDiseases: [],
        immunities:     [],       // diseaseIds the pigeon is immune to
        resistanceBase: (pigeon.stats && pigeon.stats.endurance)
                          ? clamp(pigeon.stats.endurance.current / 100, 0.1, 0.9)
                          : 0.3
      };
    }
    return healthRecords[pigeon.id];
  }

  /* ─────────────── contagion ─────────────── */

  /**
   * P(infection) = contagiousness * crowding * (1 - hygiene) * (1 - avgResistance)
   *
   * crowding   = numPigeons / maxCapacity  (0-1)
   * hygiene    = loft cleanliness (0-1, 1 = perfect)
   * avgResistance = average of all healthy pigeons' resistance
   */
  function spreadDisease(pigeons, loftConditions) {
    if (!pigeons || pigeons.length < 2) return [];

    const conditions = loftConditions || {};
    const crowding   = clamp((conditions.crowding || 0.5), 0, 1);
    const hygiene    = clamp((conditions.hygiene  || 0.5), 0, 1);

    // find infected pigeons
    const infected = [];
    const healthy  = [];
    for (const p of pigeons) {
      const rec = ensureRecord(p);
      if (rec.diseases.length > 0 && !rec.quarantined) {
        infected.push(p);
      } else if (rec.diseases.length === 0) {
        healthy.push(p);
      }
    }

    if (infected.length === 0 || healthy.length === 0) return [];

    // average resistance of healthy pigeons
    let totalRes = 0;
    for (const h of healthy) {
      const rec = ensureRecord(h);
      totalRes += rec.resistanceBase;
    }
    const avgResistance = totalRes / healthy.length;

    const newInfections = [];

    for (const sickPigeon of infected) {
      const sickRec = ensureRecord(sickPigeon);

      for (const diseaseEntry of sickRec.diseases) {
        const disease = getDisease(diseaseEntry.diseaseId);
        if (!disease) continue;

        for (const target of healthy) {
          const targetRec = ensureRecord(target);

          // skip if immune
          if (targetRec.immunities.indexOf(diseaseEntry.diseaseId) !== -1) continue;
          // skip if already has this disease
          if (targetRec.diseases.some(function (d) { return d.diseaseId === diseaseEntry.diseaseId; })) continue;

          // P = contagiousness * crowding * (1 - hygiene) * (1 - avgResistance)
          const P = disease.contagiousness * crowding * (1 - hygiene) * (1 - avgResistance);

          if (Math.random() < P) {
            targetRec.diseases.push({
              diseaseId:   diseaseEntry.diseaseId,
              dayInfected: Date.now(),
              daysSick:    0,
              treated:     false,
              drugUsed:    null
            });

            newInfections.push({
              pigeonId:  target.id,
              pigeonName: target.name,
              diseaseId: diseaseEntry.diseaseId,
              diseaseName: disease.name,
              sourceId:  sickPigeon.id
            });

            if (window.EventBus) {
              window.EventBus.emit('health:infected', {
                pigeonId: target.id,
                diseaseId: diseaseEntry.diseaseId,
                sourceId: sickPigeon.id
              });
            }
          }
        }
      }
    }

    return newInfections;
  }

  /* ─────────────── diagnosis ─────────────── */

  /**
   * diagnose(pigeon)
   * Returns list of detected diseases with confidence.
   */
  function diagnose(pigeon) {
    const rec = ensureRecord(pigeon);
    const results = [];

    for (const entry of rec.diseases) {
      const disease = getDisease(entry.diseaseId);
      if (!disease) continue;

      // confidence increases with days sick
      const confidence = clamp(0.4 + entry.daysSick * 0.1, 0.4, 0.99);
      const detected = Math.random() < confidence;

      if (detected) {
        if (rec.diagnosedDiseases.indexOf(entry.diseaseId) === -1) {
          rec.diagnosedDiseases.push(entry.diseaseId);
        }
        results.push({
          diseaseId: entry.diseaseId,
          diseaseName: disease.name,
          severity: disease.severity,
          symptoms: disease.symptoms,
          confidence: Math.round(confidence * 100),
          daysSick: entry.daysSick,
          recommendedDrugs: disease.drugs
        });
      }
    }

    // false negatives — symptom-based suspicions
    if (rec.diseases.length > 0 && results.length === 0) {
      results.push({
        diseaseId: null,
        diseaseName: 'Unknown',
        severity: 0.3,
        symptoms: ['lethargy'],
        confidence: 30,
        daysSick: 0,
        recommendedDrugs: []
      });
    }

    if (window.EventBus) {
      window.EventBus.emit('health:diagnosed', { pigeonId: pigeon.id, results: results });
    }

    return results;
  }

  /* ─────────────── treatment ─────────────── */

  /**
   * treat(pigeon, drugId)
   * P(recovery) = drugSuitability * (1 - severity) * careQuality
   *
   * drugSuitability = 1.0 if drug in disease.drugs, else 0.3
   * careQuality = pigeon condition / 100
   */
  function treat(pigeon, drugId) {
    const rec = ensureRecord(pigeon);
    if (rec.diseases.length === 0) {
      return { success: false, reason: pigeon.name + ' has no diseases to treat.' };
    }

    const results = [];

    for (let i = rec.diseases.length - 1; i >= 0; i--) {
      const entry = rec.diseases[i];
      const disease = getDisease(entry.diseaseId);
      if (!disease) continue;

      const drugSuitability = (disease.drugs && disease.drugs.indexOf(drugId) !== -1) ? 1.0 : 0.3;
      const severity = disease.severity || 0.5;
      const careQuality = clamp((pigeon.condition || 50) / 100, 0.2, 1.0);

      // P(recovery) = drugSuitability * (1 - severity) * careQuality
      const recoveryChance = drugSuitability * (1 - severity) * careQuality;

      entry.treated = true;
      entry.drugUsed = drugId;

      if (Math.random() < recoveryChance) {
        // cured
        rec.diseases.splice(i, 1);
        // grant immunity
        if (rec.immunities.indexOf(entry.diseaseId) === -1) {
          rec.immunities.push(entry.diseaseId);
        }

        results.push({
          diseaseId: entry.diseaseId,
          cured: true,
          recoveryChance: Math.round(recoveryChance * 100)
        });

        // health boost on cure
        pigeon.health = clamp((pigeon.health || 50) + 15, 0, 100);

        if (window.EventBus) {
          window.EventBus.emit('health:cured', { pigeonId: pigeon.id, diseaseId: entry.diseaseId });
        }
      } else {
        results.push({
          diseaseId: entry.diseaseId,
          cured: false,
          recoveryChance: Math.round(recoveryChance * 100)
        });
      }
    }

    return { success: true, treatments: results };
  }

  /* ─────────────── quarantine ─────────────── */

  function quarantine(pigeon, enable) {
    const rec = ensureRecord(pigeon);
    rec.quarantined = (enable !== false); // default true

    if (window.EventBus) {
      window.EventBus.emit('health:quarantine', { pigeonId: pigeon.id, quarantined: rec.quarantined });
    }

    return { pigeonId: pigeon.id, quarantined: rec.quarantined };
  }

  /* ─────────────── daily health update ─────────────── */

  /**
   * updateHealth(pigeon)
   * Called once per game-day. Applies disease effects, natural recovery, hunger/condition drain.
   */
  function updateHealth(pigeon) {
    const rec = ensureRecord(pigeon);
    const events = [];

    // update resistance based on current endurance
    rec.resistanceBase = (pigeon.stats && pigeon.stats.endurance)
      ? clamp(pigeon.stats.endurance.current / 100, 0.1, 0.9)
      : 0.3;

    // process each disease
    for (let i = rec.diseases.length - 1; i >= 0; i--) {
      const entry = rec.diseases[i];
      const disease = getDisease(entry.diseaseId);
      if (!disease) continue;

      entry.daysSick += 1;

      // daily health & condition drain
      pigeon.health    = clamp((pigeon.health || 100) - disease.dailyHealthDrain, 0, 100);
      pigeon.condition = clamp((pigeon.condition || 100) - disease.dailyConditionDrain, 0, 100);

      // mortality check
      if (pigeon.health <= 0) {
        events.push({ type: 'death', pigeonId: pigeon.id, cause: entry.diseaseId });
        if (window.EventBus) {
          window.EventBus.emit('health:death', { pigeonId: pigeon.id, diseaseId: entry.diseaseId });
        }
        return { alive: false, events: events };
      }

      // natural recovery check
      if (entry.daysSick >= disease.naturalRecoveryDays) {
        const naturalChance = (1 - disease.severity) * rec.resistanceBase;
        if (Math.random() < naturalChance) {
          rec.diseases.splice(i, 1);
          if (rec.immunities.indexOf(entry.diseaseId) === -1) {
            rec.immunities.push(entry.diseaseId);
          }
          events.push({ type: 'natural_recovery', pigeonId: pigeon.id, diseaseId: entry.diseaseId });
          if (window.EventBus) {
            window.EventBus.emit('health:recovered', { pigeonId: pigeon.id, diseaseId: entry.diseaseId, natural: true });
          }
        }
      }
    }

    // if healthy, slow natural regeneration
    if (rec.diseases.length === 0) {
      pigeon.health    = clamp((pigeon.health || 100) + 2, 0, 100);
      pigeon.condition = clamp((pigeon.condition || 100) + 3, 0, 100);
    }

    // hunger affects health
    if ((pigeon.hunger || 0) > 80) {
      pigeon.health    = clamp((pigeon.health || 100) - 2, 0, 100);
      pigeon.condition = clamp((pigeon.condition || 100) - 3, 0, 100);
    }

    return { alive: true, events: events };
  }

  /**
   * dailyHealthCheck(pigeons, loftConditions)
   * Master daily routine: update each pigeon, spread diseases.
   */
  function dailyHealthCheck(pigeons, loftConditions) {
    if (!pigeons || pigeons.length === 0) return { infections: [], updates: [] };

    const updates = [];
    for (const p of pigeons) {
      const result = updateHealth(p);
      updates.push({ pigeonId: p.id, result: result });
    }

    // then attempt to spread diseases
    const infections = spreadDisease(pigeons, loftConditions);

    // random chance of new disease appearing (environmental)
    if (Math.random() < 0.02) {
      const diseaseIds = getAllDiseaseIds();
      const randomDisease = diseaseIds[Math.floor(Math.random() * diseaseIds.length)];
      const randomPigeon = pigeons[Math.floor(Math.random() * pigeons.length)];
      const rec = ensureRecord(randomPigeon);

      if (rec.immunities.indexOf(randomDisease) === -1 &&
          !rec.diseases.some(function (d) { return d.diseaseId === randomDisease; })) {
        rec.diseases.push({
          diseaseId: randomDisease,
          dayInfected: Date.now(),
          daysSick: 0,
          treated: false,
          drugUsed: null
        });

        infections.push({
          pigeonId: randomPigeon.id,
          pigeonName: randomPigeon.name,
          diseaseId: randomDisease,
          diseaseName: (getDisease(randomDisease) || {}).name || randomDisease,
          sourceId: 'environment'
        });

        if (window.EventBus) {
          window.EventBus.emit('health:environmentalInfection', {
            pigeonId: randomPigeon.id,
            diseaseId: randomDisease
          });
        }
      }
    }

    if (window.EventBus) {
      window.EventBus.emit('health:dailyCheckComplete', {
        pigeonCount: pigeons.length,
        newInfections: infections.length,
        deaths: updates.filter(function (u) { return u.result && !u.result.alive; }).length
      });
    }

    return { infections: infections, updates: updates };
  }

  /* ─────────────── queries ─────────────── */

  function getHealthRecord(pigeonId) {
    return healthRecords[pigeonId] || null;
  }

  function isQuarantined(pigeonId) {
    const rec = healthRecords[pigeonId];
    return rec ? rec.quarantined : false;
  }

  function isSick(pigeonId) {
    const rec = healthRecords[pigeonId];
    return rec ? rec.diseases.length > 0 : false;
  }

  /* ─────────────── public API ─────────────── */

  window.HealthSystem = {
    dailyHealthCheck:  dailyHealthCheck,
    spreadDisease:     spreadDisease,
    diagnose:          diagnose,
    treat:             treat,
    quarantine:        quarantine,
    updateHealth:      updateHealth,
    getHealthRecord:   getHealthRecord,
    isQuarantined:     isQuarantined,
    isSick:            isSick,
    getDisease:        getDisease,
    getAllDiseaseIds:   getAllDiseaseIds,
    DEFAULT_DISEASES:  DEFAULT_DISEASES
  };

})();
