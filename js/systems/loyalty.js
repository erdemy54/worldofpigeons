/* ============================================================
   js/systems/loyalty.js — Loyalty & Escape System
   ============================================================ */
window.LoyaltySystem = (function () {
    'use strict';

    // Loyalty increases with: feeding, training, flying, quality care
    // Loyalty decreases with: hunger, sickness, overcrowding, neglect
    function updateLoyalty(pigeon, actions) {
        if (!pigeon) return;
        let delta = 0;
        if (actions.fed) delta += 2;
        if (actions.trained) delta += 3;
        if (actions.flew) delta += 4;
        if (pigeon.hunger < 30) delta -= 5;
        if (pigeon.health && pigeon.health.sick) delta -= 3;
        if (actions.crowded) delta -= 2;

        pigeon.loyalty = Math.max(0, Math.min(100, (pigeon.loyalty || 70) + delta));
    }

    // Escape check during flight
    // P(escape) = (1 - loyalty/100) * breed_factor * (1 - sync_bonus)
    function checkEscape(pigeon, flockSyncBonus) {
        const loyalty = pigeon.loyalty || 70;
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const breedFactor = breed ? (1 - breed.temperament.loyaltyBase / 100) : 0.3;
        const syncBonus = flockSyncBonus || 0;

        const escapeChance = (1 - loyalty / 100) * breedFactor * (1 - syncBonus);
        const roll = Math.random();

        if (roll < escapeChance) {
            if (window.EventBus) {
                window.EventBus.emit(window.EventBus.Events.PIGEON_ESCAPED, { pigeon });
            }
            return true;
        }
        return false;
    }

    return { updateLoyalty, checkEscape };
})();
