/* ============================================================
   js/systems/threats-system.js — Threat Encounter System
   ============================================================ */
window.ThreatsSystem = (function () {
    'use strict';

    // Roll for threat during flight
    function rollFlightThreat(pigeonIds, elapsedMinutes) {
        if (!window.ThreatsDB) return null;
        const airThreats = window.ThreatsDB.getAirThreats();

        for (const threat of airThreats) {
            // Higher chance as flight duration increases
            const timeFactor = Math.min(elapsedMinutes / 10, 2);
            if (Math.random() < threat.frequency * timeFactor * 0.1) {
                return handleAirThreat(threat, pigeonIds);
            }
        }
        return null;
    }

    function handleAirThreat(threat, pigeonIds) {
        const targetIdx = Math.floor(Math.random() * pigeonIds.length);
        const targetId = pigeonIds[targetIdx];
        const pigeon = window.GameState ? window.GameState.pigeons.find(p => p.id === targetId) : null;

        if (!pigeon) return null;

        // Evasion based on pigeon stats
        const evasion = ((pigeon.stats?.balance?.current || 50) + (pigeon.stats?.endurance?.current || 50)) / 200;
        const courage = (pigeon.temperament?.courage || 50) / 100;
        const evadeChance = evasion * 0.6 + courage * 0.4;

        const evaded = Math.random() < evadeChance;

        if (!evaded) {
            // Pigeon captured or injured
            const captured = Math.random() < threat.attackPower * 0.3;
            if (captured) {
                if (window.EventBus) window.EventBus.emit(window.EventBus.Events.PIGEON_CAPTURED, { pigeon, threat });
            } else {
                pigeon.condition = Math.max(0.3, (pigeon.condition || 1) - threat.attackPower * 0.3);
            }
        }

        if (window.EventBus) {
            window.EventBus.emit(evaded ? window.EventBus.Events.THREAT_ESCAPED : window.EventBus.Events.THREAT_APPEARED,
                { threat, pigeon, evaded });
        }

        return { threat: threat.id, targetId, evaded };
    }

    // Roll for ground threat (coop)
    function rollGroundThreat(coopState) {
        if (!window.ThreatsDB) return null;
        const groundThreats = window.ThreatsDB.getGroundThreats();
        const timePhase = window.TimeManager ? window.TimeManager.phase : 'day';

        for (const threat of groundThreats) {
            if (threat.activeTime === 'night' && !['night', 'evening'].includes(timePhase)) continue;
            if (Math.random() < 0.02) {
                return { threat: threat.id, type: 'ground', blocked: Math.random() < (coopState.hygiene || 0.5) };
            }
        }
        return null;
    }

    return { rollFlightThreat, rollGroundThreat };
})();
