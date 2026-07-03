/* ============================================================
   js/systems/synergy.js — Flock Synergy System
   Pure breed bonuses, mixed flock penalties, signature moves
   ============================================================ */
window.SynergySystem = (function () {
    'use strict';

    // Calculate synergy bonus for a flock
    // Pure flock (same breed): +15% all stats
    // Same family: +8% relevant stats
    // Mixed: no bonus
    function calculateSynergy(pigeonIds) {
        if (!window.GameState || pigeonIds.length < 2) return { type: 'none', bonus: 0 };

        const pigeons = pigeonIds.map(id => window.GameState.pigeons.find(p => p.id === id)).filter(Boolean);
        if (pigeons.length < 2) return { type: 'none', bonus: 0 };

        const breeds = new Set(pigeons.map(p => p.breedId));
        const families = new Set();
        pigeons.forEach(p => {
            const breed = window.BreedsDB ? window.BreedsDB.getBreed(p.breedId) : null;
            if (breed) families.add(breed.family);
        });

        if (breeds.size === 1) {
            // Pure breed flock
            const breedId = pigeons[0].breedId;
            const breed = window.BreedsDB ? window.BreedsDB.getBreed(breedId) : null;
            const signatureMove = breed ? breed.signatureMove : null;

            if (window.EventBus) {
                window.EventBus.emit(window.EventBus.Events.SYNERGY_ACTIVATED, { type: 'pure', breedId });
            }

            return {
                type: 'pure',
                breedId,
                bonus: 0.15,
                signatureMove,
                description: `Saf Sürü: +15% tüm statlar`,
                canSignature: pigeons.length >= 5
            };
        }

        if (families.size === 1) {
            return {
                type: 'family',
                family: [...families][0],
                bonus: 0.08,
                signatureMove: null,
                description: `Aile Sinerjisi: +8% ilgili statlar`,
                canSignature: false
            };
        }

        return { type: 'mixed', bonus: 0, signatureMove: null, description: 'Karışık sürü', canSignature: false };
    }

    // Apply synergy to flight stats
    function applySynergyBonus(pigeon, synergy) {
        if (!synergy || synergy.bonus === 0) return pigeon.stats;

        const boostedStats = {};
        const statNames = ['tumble', 'spinSpeed', 'style', 'balance', 'endurance', 'flockSync'];

        statNames.forEach(stat => {
            const current = pigeon.stats[stat] ? pigeon.stats[stat].current : 0;
            boostedStats[stat] = { current: current * (1 + synergy.bonus), cap: pigeon.stats[stat]?.cap || 100 };
        });

        return boostedStats;
    }

    // Trigger signature move (requires 5+ same breed)
    function triggerSignatureMove(pigeonIds) {
        const synergy = calculateSynergy(pigeonIds);
        if (!synergy.canSignature || !synergy.signatureMove) return null;

        const breed = window.BreedsDB ? window.BreedsDB.getBreed(synergy.breedId) : null;

        if (window.EventBus) {
            window.EventBus.emit(window.EventBus.Events.SIGNATURE_MOVE, {
                breedId: synergy.breedId,
                move: synergy.signatureMove,
                name: breed ? breed.signatureNameKey : synergy.signatureMove
            });
        }

        // Score bonus for signature move
        return {
            move: synergy.signatureMove,
            scoreBonus: 100,
            duration: 3 // seconds of animation
        };
    }

    return { calculateSynergy, applySynergyBonus, triggerSignatureMove };
})();
