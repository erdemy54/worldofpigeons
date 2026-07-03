/* ============================================================
   js/ui/health-ui.js — Health Screen
   Disease management, treatment, quarantine
   ============================================================ */
window.HealthScreen = (function () {
    'use strict';
    const t = (key) => window.I18n ? window.I18n.t(key) : key;

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-health';
        const pigeons = window.GameState ? window.GameState.pigeons : [];
        const sickPigeons = pigeons.filter(p => p.health && p.health.sick);
        const healthyCount = pigeons.length - sickPigeons.length;

        screen.innerHTML = `
            <div class="section-header"><span class="section-title">🩺 ${t('health.title')}</span></div>
            <div class="health-overview">
                <div class="health-stat glass-panel">
                    <div class="health-number" style="color:var(--success)">${healthyCount}</div>
                    <div class="health-label">${t('health.healthy')}</div>
                </div>
                <div class="health-stat glass-panel">
                    <div class="health-number" style="color:var(--danger)">${sickPigeons.length}</div>
                    <div class="health-label">${t('health.sick')}</div>
                </div>
                <div class="health-stat glass-panel">
                    <div class="health-number">${Math.round((window.GameState?.coop?.hygiene || 1) * 100)}%</div>
                    <div class="health-label">${t('coop.hygiene')}</div>
                </div>
            </div>
            ${sickPigeons.length > 0 ? `
                <div class="section-header"><span class="section-title">${t('health.sick_pigeons')}</span></div>
                ${sickPigeons.map(p => renderSickCard(p)).join('')}
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">💚</div>
                    <p class="empty-text">${t('health.all_healthy')}</p>
                </div>
            `}
        `;
        requestAnimationFrame(() => bindEvents(screen));
        return screen;
    }

    function renderSickCard(pigeon) {
        const disease = pigeon.health.diseaseId && window.DiseasesDB ? window.DiseasesDB.getDisease(pigeon.health.diseaseId) : null;
        const diseaseName = disease ? t(disease.nameKey) : t('health.unknown_disease');
        return `
            <div class="card glass-panel" style="margin-bottom:var(--space-sm);border-left:3px solid var(--danger)">
                <div class="card-header">
                    <span class="card-title" style="font-size:var(--font-size-md)">🕊️ ${pigeon.name || t('pigeon.unnamed')}</span>
                    <span class="badge badge-sick">${diseaseName}</span>
                </div>
                <div class="card-body">
                    <div style="display:flex;justify-content:space-between;font-size:var(--font-size-sm);color:var(--text-secondary)">
                        <span>${t('health.severity')}: ${Math.round((pigeon.health.severity || 0.5) * 100)}%</span>
                        <span>${t('health.days_sick')}: ${pigeon.health.daysSick || 0}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="btn btn-secondary btn-sm" data-action="quarantine" data-pigeon-id="${pigeon.id}">🔒 ${t('health.quarantine')}</button>
                    <button class="btn btn-primary btn-sm" data-action="treat" data-pigeon-id="${pigeon.id}" data-disease="${pigeon.health.diseaseId}">💊 ${t('health.treat')}</button>
                </div>
            </div>
        `;
    }

    function bindEvents(screen) {
        screen.querySelectorAll('[data-action="treat"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const pigeonId = btn.dataset.pigeonId;
                const diseaseId = btn.dataset.disease;
                if (window.HealthSystem && window.GameState) {
                    const pigeon = window.GameState.pigeons.find(p => p.id === pigeonId);
                    if (pigeon) {
                        const disease = window.DiseasesDB ? window.DiseasesDB.getDisease(diseaseId) : null;
                        const medicineId = disease ? disease.treatmentId : null;
                        if (medicineId && window.EconomySystem) {
                            const item = window.ItemsDB ? window.ItemsDB.getItem('medicine', medicineId) : null;
                            const cost = item ? Object.entries(item.cost)[0] : null;
                            if (cost && window.EconomySystem.canAfford(cost[0], cost[1])) {
                                window.EconomySystem.spendCurrency(cost[0], cost[1]);
                                window.HealthSystem.treat(pigeon, medicineId);
                                if (window.ScreenManager) window.ScreenManager.showToast(t('health.treatment_applied'), 'success');
                                if (window.AudioManager) window.AudioManager.play('success');
                            } else {
                                if (window.ScreenManager) window.ScreenManager.showToast(t('economy.not_enough'), 'error');
                            }
                        }
                        if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
                    }
                }
            });
        });
        screen.querySelectorAll('[data-action="quarantine"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.ScreenManager) window.ScreenManager.showToast(t('health.quarantined'), 'info');
                if (window.AudioManager) window.AudioManager.play('ui_click');
            });
        });
    }

    return { render };
})();
