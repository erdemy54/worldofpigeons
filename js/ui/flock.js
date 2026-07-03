/* ============================================================
   js/ui/flock.js — Flock Screen
   Full pigeon roster with search, filter, sort, and detail view
   ============================================================ */

window.FlockScreen = (function () {
    'use strict';

    const t = (key) => window.I18n ? window.I18n.t(key) : key;
    let currentFilter = 'all';
    let searchTerm = '';

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-flock';

        const pigeons = window.GameState ? window.GameState.pigeons : [];

        screen.innerHTML = `
            <div class="flock-header">
                <span class="section-title">📋 ${t('nav.flock')}</span>
                <span class="text-muted" style="font-size:var(--font-size-sm)">${pigeons.length} ${t('flock.total')}</span>
            </div>

            <div class="flock-search">
                <span class="search-icon">🔍</span>
                <input type="text" class="input-field" id="flock-search-input" 
                    placeholder="${t('flock.search_placeholder')}" style="padding-left:36px" value="${searchTerm}">
            </div>

            <div class="flock-filters" id="flock-filters">
                <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">${t('flock.filter_all')}</button>
                <button class="filter-chip ${currentFilter === 'tumbler' ? 'active' : ''}" data-filter="tumbler">${t('family.tumbler')}</button>
                <button class="filter-chip ${currentFilter === 'highflyer' ? 'active' : ''}" data-filter="highflyer">${t('family.highflyer')}</button>
                <button class="filter-chip ${currentFilter === 'postal' ? 'active' : ''}" data-filter="postal">${t('family.postal')}</button>
                <button class="filter-chip ${currentFilter === 'singer' ? 'active' : ''}" data-filter="singer">${t('family.singer')}</button>
                <button class="filter-chip ${currentFilter === 'ornamental' ? 'active' : ''}" data-filter="ornamental">${t('family.ornamental')}</button>
                <button class="filter-chip ${currentFilter === 'sick' ? 'active' : ''}" data-filter="sick">🤒 ${t('status.sick')}</button>
            </div>

            <div class="flock-list" id="flock-list">
                ${renderFilteredList(pigeons)}
            </div>
        `;

        requestAnimationFrame(() => bindEvents(screen));
        return screen;
    }

    function renderFilteredList(pigeons) {
        let filtered = pigeons;

        // Apply family filter
        if (currentFilter !== 'all' && currentFilter !== 'sick') {
            filtered = filtered.filter(p => {
                const breed = window.BreedsDB ? window.BreedsDB.getBreed(p.breedId) : null;
                return breed && breed.family === currentFilter;
            });
        } else if (currentFilter === 'sick') {
            filtered = filtered.filter(p => p.health && p.health.sick);
        }

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => {
                const name = (p.name || '').toLowerCase();
                const breed = window.BreedsDB ? window.BreedsDB.getBreed(p.breedId) : null;
                const breedName = breed ? t(breed.nameKey).toLowerCase() : '';
                return name.includes(term) || breedName.includes(term);
            });
        }

        // Sort by Qi descending
        filtered.sort((a, b) => (b.qi || 0) - (a.qi || 0));

        if (filtered.length === 0) {
            return `<div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p class="empty-text">${t('flock.no_results')}</p>
            </div>`;
        }

        return filtered.map(p => renderFlockCard(p)).join('');
    }

    function renderFlockCard(pigeon) {
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const breedName = breed ? t(breed.nameKey) : pigeon.breedId;
        const tierColor = window.BreedsDB ? window.BreedsDB.getTierColor(pigeon.grade) : '#888';
        const genderIcon = pigeon.gender === 'female' ? '♀' : '♂';

        // Condition bar color
        let condColor = 'var(--health-green)';
        if (pigeon.condition < 0.5) condColor = 'var(--health-red)';
        else if (pigeon.condition < 0.75) condColor = 'var(--health-yellow)';

        return `
            <div class="pigeon-card" data-pigeon-id="${pigeon.id}">
                <div class="pigeon-avatar" style="border-color:${tierColor}">🕊️</div>
                <div class="pigeon-info">
                    <div class="pigeon-name">${pigeon.name || t('pigeon.unnamed')} <span class="${pigeon.gender === 'female' ? 'gender-female' : 'gender-male'}">${genderIcon}</span></div>
                    <div class="pigeon-breed">${breedName} · Gen ${pigeon.generation || 1}</div>
                    <div style="margin-top:4px">
                        <div class="progress-bar" style="height:4px;width:60px;display:inline-block;vertical-align:middle">
                            <div class="progress-fill" style="width:${Math.round((pigeon.condition || 1) * 100)}%;background:${condColor}"></div>
                        </div>
                        <span style="font-size:0.65rem;color:var(--text-muted);margin-left:4px">${Math.round((pigeon.condition || 1) * 100)}%</span>
                    </div>
                </div>
                <div class="pigeon-stats">
                    <span class="tier-badge tier-${(pigeon.grade || 'B').toLowerCase().replace('+', '-plus')}">${pigeon.grade || 'B'}</span>
                </div>
            </div>
        `;
    }

    function bindEvents(screen) {
        // Search
        const searchInput = screen.querySelector('#flock-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchTerm = e.target.value;
                const list = screen.querySelector('#flock-list');
                const pigeons = window.GameState ? window.GameState.pigeons : [];
                if (list) list.innerHTML = renderFilteredList(pigeons);
                rebindCards(screen);
            });
        }

        // Filters
        screen.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                currentFilter = chip.dataset.filter;
                screen.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === currentFilter));
                const list = screen.querySelector('#flock-list');
                const pigeons = window.GameState ? window.GameState.pigeons : [];
                if (list) list.innerHTML = renderFilteredList(pigeons);
                rebindCards(screen);
                if (window.AudioManager) window.AudioManager.play('ui_click');
            });
        });

        rebindCards(screen);
    }

    function rebindCards(screen) {
        screen.querySelectorAll('.pigeon-card').forEach(card => {
            card.addEventListener('click', () => {
                const pigeonId = card.dataset.pigeonId;
                if (window.CoopScreen) {
                    window.CoopScreen.render(); // ensure it's loaded
                }
                // Reuse coop's detail modal
                if (window.CoopScreen && typeof window.CoopScreen.openPigeonDetail === 'function') {
                    window.CoopScreen.openPigeonDetail(pigeonId);
                } else {
                    // Fallback: simple toast
                    const pigeon = window.GameState ? window.GameState.pigeons.find(p => p.id === pigeonId) : null;
                    if (pigeon && window.ScreenManager) {
                        window.ScreenManager.showToast(`${pigeon.name} - Qi: ${Math.round(pigeon.qi || 0)}`, 'info');
                    }
                }
            });
        });
    }

    return { render };
})();
