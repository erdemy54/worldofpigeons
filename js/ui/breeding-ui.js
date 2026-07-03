/* ============================================================
   js/ui/breeding-ui.js — Breeding Screen
   Mate selection, compatibility preview, incubation tracking
   ============================================================ */

window.BreedingScreen = (function () {
    'use strict';

    const t = (key) => window.I18n ? window.I18n.t(key) : key;
    let selectedMother = null;
    let selectedFather = null;

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-breeding';

        const activeBreedings = window.GameState ? (window.GameState.activeBreedings || []) : [];

        screen.innerHTML = `
            <div class="section-header">
                <span class="section-title">💕 ${t('breeding.title')}</span>
            </div>

            <div class="breeding-pair">
                <div class="breeding-slot glass-panel ${selectedMother ? '' : 'empty'}" data-role="mother" id="slot-mother">
                    ${selectedMother ? renderSelectedPigeon(selectedMother, '♀') : `
                        <span class="slot-icon">♀</span>
                        <span class="slot-label">${t('breeding.select_mother')}</span>
                    `}
                </div>
                <div class="breeding-connector">❤️</div>
                <div class="breeding-slot glass-panel ${selectedFather ? '' : 'empty'}" data-role="father" id="slot-father">
                    ${selectedFather ? renderSelectedPigeon(selectedFather, '♂') : `
                        <span class="slot-icon">♂</span>
                        <span class="slot-label">${t('breeding.select_father')}</span>
                    `}
                </div>
            </div>

            ${selectedMother && selectedFather ? renderCompatibility() : ''}

            ${selectedMother && selectedFather ? `
                <div style="text-align:center;margin-bottom:var(--space-lg)">
                    <button class="btn btn-primary btn-lg btn-glow" id="btn-start-breeding">
                        🥚 ${t('breeding.start')}
                    </button>
                </div>
            ` : ''}

            ${activeBreedings.length > 0 ? `
                <div class="section-header" style="margin-top:var(--space-lg)">
                    <span class="section-title">🥚 ${t('breeding.active')}</span>
                </div>
                ${activeBreedings.map(b => renderIncubationCard(b)).join('')}
            ` : ''}

            <div class="section-header" style="margin-top:var(--space-lg)">
                <span class="section-title">${t('breeding.available')}</span>
            </div>
            <div id="breeding-available-list">
                ${renderAvailableList()}
            </div>
        `;

        requestAnimationFrame(() => bindEvents(screen));
        return screen;
    }

    function renderSelectedPigeon(pigeon, genderSymbol) {
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        return `
            <div style="font-size:2.5rem">🕊️</div>
            <div style="font-weight:600;font-size:var(--font-size-md)">${pigeon.name || t('pigeon.unnamed')}</div>
            <div style="font-size:var(--font-size-xs);color:var(--text-secondary)">${breed ? t(breed.nameKey) : ''}</div>
            <div class="tier-badge tier-${(pigeon.grade || 'B').toLowerCase().replace('+','-plus')}" style="margin-top:4px">${pigeon.grade}</div>
        `;
    }

    function renderCompatibility() {
        let score = 50;
        let desc = t('breeding.compat_medium');

        if (window.BreedingSystem && selectedMother && selectedFather) {
            const result = window.BreedingSystem.checkCompatibility(selectedMother, selectedFather);
            score = result.score || 50;
            desc = result.description || '';
        }

        let fillClass = 'medium';
        if (score >= 80) fillClass = 'perfect';
        else if (score >= 60) fillClass = 'high';
        else if (score < 30) fillClass = 'low';

        return `
            <div class="card glass-panel" style="margin-bottom:var(--space-lg)">
                <div class="card-header">
                    <span class="card-title">${t('breeding.compatibility')}</span>
                </div>
                <div class="card-body">
                    <div class="compat-meter">
                        <div class="compat-bar">
                            <div class="compat-fill ${fillClass}" style="width:${score}%"></div>
                        </div>
                        <span class="compat-value" style="color:${score >= 60 ? 'var(--success)' : score >= 30 ? 'var(--warning)' : 'var(--danger)'}">${score}%</span>
                    </div>
                    <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-top:var(--space-sm);text-align:center">${desc}</p>
                </div>
            </div>
        `;
    }

    function renderIncubationCard(breeding) {
        const progress = breeding.progress || 0;
        const remaining = breeding.remainingDays || 0;

        return `
            <div class="incubation-card glass-panel">
                <div class="egg-icon">🥚</div>
                <div class="timer-text">${remaining} ${t('time.days_remaining')}</div>
                <div class="progress-bar" style="margin-top:var(--space-sm)">
                    <div class="progress-fill" style="width:${progress}%"></div>
                </div>
                <p style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:var(--space-xs)">
                    ${t('breeding.incubation_progress')}: ${Math.round(progress)}%
                </p>
            </div>
        `;
    }

    function renderAvailableList() {
        const pigeons = window.GameState ? window.GameState.pigeons.filter(p => 
            p.lifecycle === 'adult' && !p.health.sick
        ) : [];

        const males = pigeons.filter(p => p.gender === 'male');
        const females = pigeons.filter(p => p.gender === 'female');

        let html = '';

        if (females.length > 0) {
            html += `<p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-sm)">♀ ${t('gender.female')} (${females.length})</p>`;
            html += females.map(p => renderMiniCard(p, 'mother')).join('');
        }

        if (males.length > 0) {
            html += `<p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin:var(--space-md) 0 var(--space-sm)">♂ ${t('gender.male')} (${males.length})</p>`;
            html += males.map(p => renderMiniCard(p, 'father')).join('');
        }

        if (pigeons.length === 0) {
            html = `<div class="empty-state"><p class="empty-text">${t('breeding.no_adults')}</p></div>`;
        }

        return html;
    }

    function renderMiniCard(pigeon, role) {
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const isSelected = (role === 'mother' && selectedMother && selectedMother.id === pigeon.id) ||
                           (role === 'father' && selectedFather && selectedFather.id === pigeon.id);

        return `
            <div class="pigeon-card ${isSelected ? 'selected' : ''}" data-pigeon-id="${pigeon.id}" data-role="${role}" 
                 style="${isSelected ? 'border-color:var(--gold-500)' : ''}">
                <div class="pigeon-avatar">🕊️</div>
                <div class="pigeon-info">
                    <div class="pigeon-name">${pigeon.name || t('pigeon.unnamed')}</div>
                    <div class="pigeon-breed">${breed ? t(breed.nameKey) : ''}</div>
                </div>
                <span class="tier-badge tier-${(pigeon.grade || 'B').toLowerCase().replace('+','-plus')}">${pigeon.grade}</span>
            </div>
        `;
    }

    function bindEvents(screen) {
        // Slot clicks (to deselect)
        ['slot-mother', 'slot-father'].forEach(slotId => {
            const slot = screen.querySelector('#' + slotId);
            if (slot) {
                slot.addEventListener('click', () => {
                    if (slotId === 'slot-mother') selectedMother = null;
                    else selectedFather = null;
                    if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
                });
            }
        });

        // Available pigeon selection
        screen.querySelectorAll('#breeding-available-list .pigeon-card').forEach(card => {
            card.addEventListener('click', () => {
                const pigeonId = card.dataset.pigeonId;
                const role = card.dataset.role;
                const pigeon = window.GameState ? window.GameState.pigeons.find(p => p.id === pigeonId) : null;
                if (!pigeon) return;

                if (role === 'mother') selectedMother = pigeon;
                else selectedFather = pigeon;

                if (window.AudioManager) window.AudioManager.play('ui_click');
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        });

        // Start breeding
        const breedBtn = screen.querySelector('#btn-start-breeding');
        if (breedBtn) {
            breedBtn.addEventListener('click', () => {
                if (!selectedMother || !selectedFather) return;

                if (window.BreedingSystem) {
                    const result = window.BreedingSystem.startBreeding(selectedMother.id, selectedFather.id);
                    if (result && result.success) {
                        if (!window.GameState.activeBreedings) window.GameState.activeBreedings = [];
                        window.GameState.activeBreedings.push(result.breeding);

                        if (window.ScreenManager) window.ScreenManager.showToast(t('breeding.started'), 'success');
                        if (window.AudioManager) window.AudioManager.play('success');
                    } else {
                        if (window.ScreenManager) window.ScreenManager.showToast(result?.message || t('breeding.failed'), 'error');
                    }
                } else {
                    // Fallback demo
                    if (!window.GameState.activeBreedings) window.GameState.activeBreedings = [];
                    window.GameState.activeBreedings.push({
                        motherId: selectedMother.id,
                        fatherId: selectedFather.id,
                        progress: 0,
                        remainingDays: 18,
                        startTime: Date.now()
                    });
                    if (window.ScreenManager) window.ScreenManager.showToast(t('breeding.started'), 'success');
                    if (window.AudioManager) window.AudioManager.play('success');
                }

                selectedMother = null;
                selectedFather = null;
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        }
    }

    return { render };
})();
