/* ============================================================
   js/ui/encyclopedia.js — Pigeondex
   Shows discovered vs locked breeds
   ============================================================ */

window.EncyclopediaScreen = (function () {
    'use strict';

    function render() {
        const t = window.I18n ? window.I18n.t.bind(window.I18n) : (k) => k;
        const screen = document.createElement('div');
        screen.className = 'screen screen-encyclopedia';

        const breeds = window.BreedsDB ? window.BreedsDB.getAllBreeds() : [];
        const discovered = window.GameState.discoveredBreeds || [];

        let gridHtml = '';
        let unlockedCount = 0;

        breeds.forEach(breed => {
            const isUnlocked = discovered.includes(breed.id);
            if (isUnlocked) unlockedCount++;

            if (isUnlocked) {
                gridHtml += `
                    <div class="encyclopedia-card unlocked glass-panel">
                        <div class="encyclopedia-icon" style="background-image: url('assets/logo.png'); background-size: cover; background-position: center;"></div>
                        <div class="encyclopedia-name">${breed.name}</div>
                        <div class="encyclopedia-tier tier-${breed.baseGrade.toLowerCase()}">${breed.baseGrade}</div>
                    </div>
                `;
            } else {
                gridHtml += `
                    <div class="encyclopedia-card locked glass-panel">
                        <div class="encyclopedia-icon silhouette">?</div>
                        <div class="encyclopedia-name">???</div>
                        <div class="encyclopedia-tier">???</div>
                    </div>
                `;
            }
        });

        screen.innerHTML = `
            <div class="section-header">
                <span class="section-title">📖 Pigeondex</span>
                <span class="pigeondex-progress" style="font-size: var(--font-size-sm); color: var(--color-primary);">${unlockedCount} / ${breeds.length}</span>
            </div>
            
            <div class="encyclopedia-grid">
                ${gridHtml}
            </div>
        `;

        return screen;
    }

    // Export public methods
    return {
        render: render
    };
})();
