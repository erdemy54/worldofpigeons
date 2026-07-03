/* ============================================================
   js/systems/attraction.js — Stray Pigeon Attraction + Pity
   ============================================================ */
window.AttractionSystem = (function () {
    'use strict';

    let pityCounter = 0;
    const PITY_THRESHOLD = 20; // Guaranteed rare after 20 attempts

    // Stray pigeon appears based on flock quality and tower upgrade
    function checkForStray(gameState) {
        const pigeons = gameState.pigeons || [];
        if (pigeons.length === 0) return null;

        const avgQi = pigeons.reduce((s, p) => s + (p.qi || 0), 0) / pigeons.length;
        const hasTower = gameState.coop.upgrades && gameState.coop.upgrades.observation_tower;

        // Base chance: 5% per game day, +2% with tower, +0.1% per avg Qi point
        let chance = 0.05 + (hasTower ? 0.02 : 0) + (avgQi * 0.001);
        chance = Math.min(chance, 0.15);

        if (Math.random() < chance) {
            pityCounter++;
            const stray = generateStray(pityCounter >= PITY_THRESHOLD);
            if (stray.rarity !== 'common') pityCounter = 0;

            if (window.EventBus) {
                window.EventBus.emit(window.EventBus.Events.STRAY_APPEARED, { stray });
            }
            return stray;
        }
        return null;
    }

    function generateStray(guaranteeRare) {
        const allBreeds = window.BreedsDB ? window.BreedsDB.getAllBreedIds() : ['turk_taklacisi'];

        // Weighted rarity roll
        let roll = Math.random();
        let breedId;

        if (guaranteeRare || roll > 0.95) {
            // Epic/Legendary (S+ tier)
            const epicBreeds = window.BreedsDB ? window.BreedsDB.getBreedsByTier('S').concat(window.BreedsDB.getBreedsByTier('SS')) : [];
            breedId = epicBreeds.length > 0 ? epicBreeds[Math.floor(Math.random() * epicBreeds.length)].id : 'mardin';
        } else if (roll > 0.75) {
            // Rare (A tier)
            const rareBreeds = window.BreedsDB ? window.BreedsDB.getBreedsByTier('A').concat(window.BreedsDB.getBreedsByTier('A+')) : [];
            breedId = rareBreeds.length > 0 ? rareBreeds[Math.floor(Math.random() * rareBreeds.length)].id : 'kayseri_taklacisi';
        } else {
            // Common (B tier)
            const commonBreeds = window.BreedsDB ? window.BreedsDB.getBreedsByTier('B').concat(window.BreedsDB.getBreedsByTier('B+')) : [];
            breedId = commonBreeds.length > 0 ? commonBreeds[Math.floor(Math.random() * commonBreeds.length)].id : 'turk_taklacisi';
        }

        // Create the stray pigeon
        if (window.GeneticsSystem) {
            const stray = window.GeneticsSystem.createPigeon(breedId, {
                gender: Math.random() > 0.5 ? 'male' : 'female'
            });
            stray.loyalty = Math.random() * 30 + 10; // Low initial loyalty
            stray.isStray = true;
            return stray;
        }

        return { breedId, isStray: true, loyalty: 20 };
    }

    // Attract stray with food/patience
    function attemptAttraction(stray, method) {
        let successChance = 0.3;
        if (method === 'premium_feed') successChance = 0.6;
        if (method === 'patience') successChance = 0.45;

        const success = Math.random() < successChance;
        if (success && window.EventBus) {
            window.EventBus.emit(window.EventBus.Events.STRAY_JOINED, { pigeon: stray });
        }
        return success;
    }

    function getPityCounter() { return pityCounter; }
    function resetPity() { pityCounter = 0; }

    return { checkForStray, attemptAttraction, getPityCounter, resetPity };
})();
