/* ============================================================
   js/ui/coop.js — Coop Screen
   Home screen: quick actions, status overview, pigeon list
   ============================================================ */

window.CoopScreen = (function () {
    'use strict';

    const t = (key) => window.I18n ? window.I18n.t(key) : key;

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-coop';

        const pigeons = window.GameState ? window.GameState.pigeons : [];
        const coopState = window.GameState ? window.GameState.coop : { capacity: 12, hygiene: 1.0 };

        screen.innerHTML = `
            <div class="coop-header">
                <h1>🏠 ${t('nav.coop')}</h1>
                <p class="coop-subtitle">${t('coop.subtitle')}</p>
            </div>

            ${renderQuickActions(pigeons, coopState)}
            ${renderStatusGrid(pigeons, coopState)}

            <div class="section-header">
                <span class="section-title">${t('coop.my_pigeons')}</span>
                <span class="text-muted" style="font-size:var(--font-size-sm)">${pigeons.length}/${coopState.capacity}</span>
            </div>

            <div class="coop-pigeon-list" id="coop-pigeon-list">
                ${pigeons.length > 0 ? pigeons.map(p => renderPigeonCard(p)).join('') : renderEmpty()}
            </div>
        `;

        // Bind events after DOM insertion
        requestAnimationFrame(() => bindEvents(screen));

        return screen;
    }

    function renderQuickActions(pigeons, coopState) {
        const hungryCount = pigeons.filter(p => p.hunger < 40).length;
        const sickCount = pigeons.filter(p => p.health && p.health.sick).length;

        return `
            <div class="quick-actions">
                <button class="quick-action-btn ${hungryCount > 0 ? 'needs-attention' : ''}" data-action="feed-all">
                    <span class="action-icon">🌾</span>
                    <span class="action-label">${t('coop.feed_all')}</span>
                </button>
                <button class="quick-action-btn" data-action="water-all">
                    <span class="action-icon">💧</span>
                    <span class="action-label">${t('coop.water')}</span>
                </button>
                <button class="quick-action-btn" data-action="clean">
                    <span class="action-icon">🧹</span>
                    <span class="action-label">${t('coop.clean')}</span>
                </button>
                <button class="quick-action-btn ${sickCount > 0 ? 'needs-attention' : ''}" data-action="health-check">
                    <span class="action-icon">🩺</span>
                    <span class="action-label">${t('coop.health_check')}</span>
                </button>
            </div>
        `;
    }

    function renderStatusGrid(pigeons, coopState) {
        const totalQi = pigeons.length > 0
            ? Math.round(pigeons.reduce((sum, p) => sum + (p.qi || 0), 0) / pigeons.length)
            : 0;
        const sickCount = pigeons.filter(p => p.health && p.health.sick).length;
        const hungryCount = pigeons.filter(p => p.hunger < 40).length;
        const hygienePercent = Math.round((coopState.hygiene || 1) * 100);

        return `
            <div class="coop-status-grid">
                <div class="status-card glass-panel">
                    <div class="status-icon">🕊️</div>
                    <div class="status-value">${pigeons.length}</div>
                    <div class="status-label">${t('coop.total_pigeons')}</div>
                </div>
                <div class="status-card glass-panel">
                    <div class="status-icon">⭐</div>
                    <div class="status-value">${totalQi}</div>
                    <div class="status-label">${t('coop.avg_qi')}</div>
                </div>
                <div class="status-card glass-panel">
                    <div class="status-icon">${sickCount > 0 ? '🤒' : '💚'}</div>
                    <div class="status-value" style="color:${sickCount > 0 ? 'var(--danger)' : 'var(--success)'}">${sickCount > 0 ? sickCount : t('coop.healthy')}</div>
                    <div class="status-label">${t('coop.health_status')}</div>
                </div>
                <div class="status-card glass-panel">
                    <div class="status-icon">🧹</div>
                    <div class="status-value">${hygienePercent}%</div>
                    <div class="status-label">${t('coop.hygiene')}</div>
                </div>
            </div>
        `;
    }

    function renderPigeonCard(pigeon) {
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const breedName = breed ? t(breed.nameKey) : pigeon.breedId;
        const tierClass = pigeon.grade ? 'tier-' + pigeon.grade.toLowerCase().replace('+', '-plus') : 'tier-b';
        const genderIcon = pigeon.gender === 'female' ? '♀' : '♂';
        const genderClass = pigeon.gender === 'female' ? 'gender-female' : 'gender-male';

        // Status badges
        let badges = '';
        if (pigeon.health && pigeon.health.sick) badges += `<span class="badge badge-sick">🤒 ${t('status.sick')}</span>`;
        if (pigeon.hunger < 30) badges += `<span class="badge badge-hungry">🍽️ ${t('status.hungry')}</span>`;

        // Lifecycle display
        let lifecycleIcon = '🕊️';
        if (pigeon.lifecycle === 'egg') lifecycleIcon = '🥚';
        else if (pigeon.lifecycle === 'chick') lifecycleIcon = '🐣';
        else if (pigeon.lifecycle === 'juvenile') lifecycleIcon = '🐥';

        return `
            <div class="pigeon-card" data-pigeon-id="${pigeon.id}">
                <div class="pigeon-avatar" style="border-color:${window.BreedsDB ? window.BreedsDB.getTierColor(pigeon.grade) : '#888'}">
                    ${lifecycleIcon}
                </div>
                <div class="pigeon-info">
                    <div class="pigeon-name">
                        ${pigeon.name || t('pigeon.unnamed')}
                        <span class="${genderClass}" style="font-size:0.8em">${genderIcon}</span>
                    </div>
                    <div class="pigeon-breed">${breedName}</div>
                    ${badges ? `<div style="margin-top:4px">${badges}</div>` : ''}
                </div>
                <div class="pigeon-stats">
                    <span class="tier-badge ${tierClass}">${pigeon.grade || 'B'}</span>
                    <span class="qi-badge" style="background:${window.BreedsDB ? window.BreedsDB.getTierColor(pigeon.grade) : '#888'}22; color:${window.BreedsDB ? window.BreedsDB.getTierColor(pigeon.grade) : '#888'}">${Math.round(pigeon.qi || 0)}</span>
                </div>
            </div>
        `;
    }

    function renderEmpty() {
        return `
            <div class="empty-state">
                <div class="empty-icon">🕊️</div>
                <p class="empty-text">${t('coop.empty')}</p>
                <button class="btn btn-primary" data-action="get-first-pigeon">${t('coop.get_first_pigeon')}</button>
            </div>
        `;
    }

    function bindEvents(screen) {
        // Quick action buttons
        screen.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                handleQuickAction(action);
            });
        });

        // Pigeon card clicks
        screen.querySelectorAll('.pigeon-card').forEach(card => {
            card.addEventListener('click', () => {
                const pigeonId = card.dataset.pigeonId;
                openPigeonDetail(pigeonId);
            });
        });

        // Get first pigeon button
        const firstPigeonBtn = screen.querySelector('[data-action="get-first-pigeon"]');
        if (firstPigeonBtn) {
            firstPigeonBtn.addEventListener('click', () => {
                giveStarterPigeon();
            });
        }
    }

    function handleQuickAction(action) {
        if (!window.GameState) return;
        const pigeons = window.GameState.pigeons;

        switch (action) {
            case 'feed-all': {
                let fedCount = 0;
                pigeons.forEach(p => {
                    if (p.hunger < 90 && p.lifecycle === 'adult') {
                        p.hunger = Math.min(100, p.hunger + 30);
                        fedCount++;
                    }
                });
                if (fedCount > 0 && window.EconomySystem) {
                    const cost = fedCount * 120;
                    if (window.EconomySystem.canAfford('feedMoney', cost)) {
                        window.EconomySystem.spendCurrency('feedMoney', cost);
                        if (window.ScreenManager) window.ScreenManager.showToast(
                            `${fedCount} ${t('coop.pigeons_fed')} (-${cost} ${t('currency.feed_money')})`, 'success'
                        );
                        if (window.AudioManager) window.AudioManager.play('feed_scatter');
                    } else {
                        if (window.ScreenManager) window.ScreenManager.showToast(t('economy.not_enough_feed_money'), 'error');
                    }
                }
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
                break;
            }
            case 'water-all': {
                if (window.ScreenManager) window.ScreenManager.showToast(t('coop.watered'), 'success');
                if (window.AudioManager) window.AudioManager.play('ui_click');
                break;
            }
            case 'clean': {
                if (window.GameState) window.GameState.coop.hygiene = 1.0;
                if (window.ScreenManager) {
                    window.ScreenManager.showToast(t('coop.cleaned'), 'success');
                    window.ScreenManager.refreshCurrentScreen();
                }
                if (window.AudioManager) window.AudioManager.play('ui_click');
                break;
            }
            case 'health-check': {
                const sickPigeons = pigeons.filter(p => p.health && p.health.sick);
                if (sickPigeons.length > 0) {
                    if (window.ScreenManager) window.ScreenManager.showToast(
                        `${sickPigeons.length} ${t('coop.sick_pigeons_found')}`, 'warning'
                    );
                } else {
                    if (window.ScreenManager) window.ScreenManager.showToast(t('coop.all_healthy'), 'success');
                }
                break;
            }
        }
    }

    function openPigeonDetail(pigeonId) {
        if (!window.GameState) return;
        const pigeon = window.GameState.pigeons.find(p => p.id === pigeonId);
        if (!pigeon) return;

        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const breedName = breed ? t(breed.nameKey) : pigeon.breedId;
        const tierClass = pigeon.grade ? 'tier-' + pigeon.grade.toLowerCase().replace('+', '-plus') : 'tier-b';

        const stats = pigeon.stats || {};
        const statNames = ['tumble', 'spinSpeed', 'style', 'balance', 'endurance', 'flockSync'];

        const detailHtml = `
            <div class="pigeon-detail">
                <div class="detail-header">
                    <div class="detail-avatar" style="border-color:${window.BreedsDB ? window.BreedsDB.getTierColor(pigeon.grade) : '#888'}">
                        🕊️
                    </div>
                    <div class="detail-info">
                        <h2>${pigeon.name || t('pigeon.unnamed')}</h2>
                        <p style="color:var(--text-secondary);font-size:var(--font-size-sm)">${breedName}</p>
                        <div class="detail-meta">
                            <span class="tier-badge ${tierClass}">${pigeon.grade}</span>
                            <span class="badge ${pigeon.gender === 'female' ? 'gender-female' : 'gender-male'}">
                                ${pigeon.gender === 'female' ? '♀ ' + t('gender.female') : '♂ ' + t('gender.male')}
                            </span>
                            <span class="badge" style="background:rgba(255,255,255,0.05);color:var(--text-secondary)">
                                Qi: ${Math.round(pigeon.qi || 0)}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="tab-bar">
                    <button class="tab-item active" data-tab="stats">${t('pigeon.stats')}</button>
                    <button class="tab-item" data-tab="genetics">${t('pigeon.genetics')}</button>
                    <button class="tab-item" data-tab="history">${t('pigeon.history')}</button>
                </div>

                <div id="pigeon-tab-content">
                    ${renderStatTab(pigeon, statNames)}
                </div>

                <div class="card-footer" style="margin-top:var(--space-lg)">
                    <button class="btn btn-secondary btn-sm" onclick="window.ScreenManager.closeModal()">
                        ${t('action.close')}
                    </button>
                    <button class="btn btn-primary btn-sm" data-action="train-pigeon" data-pigeon-id="${pigeon.id}">
                        🏋️ ${t('action.train')}
                    </button>
                </div>
            </div>
        `;

        if (window.ScreenManager) window.ScreenManager.openModal(detailHtml);
        if (window.AudioManager) window.AudioManager.play('coo');
    }

    function renderStatTab(pigeon, statNames) {
        const stats = pigeon.stats || {};
        return statNames.map(stat => {
            const current = stats[stat] ? stats[stat].current : 0;
            const cap = stats[stat] ? stats[stat].cap : 100;
            const percent = Math.round((current / 100) * 100);
            const capPercent = Math.round((cap / 100) * 100);

            return `
                <div class="stat-row">
                    <span class="stat-label">${t('stat.' + stat)}</span>
                    <div class="stat-bar">
                        <div class="stat-bar-fill ${stat}" style="width:${percent}%"></div>
                        <div class="stat-bar-cap" style="left:${capPercent}%"></div>
                    </div>
                    <span class="stat-value">${Math.round(current)}/${cap}</span>
                </div>
            `;
        }).join('');
    }

    function giveStarterPigeon() {
        if (!window.GeneticsSystem || !window.GameState) return;

        // Give 2 starter pigeons (1 male, 1 female Türk Taklacısı)
        const male = window.GeneticsSystem.createPigeon('turk_taklacisi', { gender: 'male' });
        const female = window.GeneticsSystem.createPigeon('turk_taklacisi', { gender: 'female' });

        male.name = 'Aslan';
        female.name = 'Sultan';

        window.GameState.pigeons.push(male, female);

        if (window.ScreenManager) {
            window.ScreenManager.showToast(t('onboarding.starter_received'), 'reward');
            window.ScreenManager.refreshCurrentScreen();
        }
        if (window.AudioManager) {
            window.AudioManager.play('success');
            window.AudioManager.play('coo');
        }
    }

    return { render };
})();
