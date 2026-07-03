/* ============================================================
   js/ui/market-ui.js — Market Screen
   Buy items, sell pigeons, browse categories
   ============================================================ */

window.MarketScreen = (function () {
    'use strict';

    const t = (key) => window.I18n ? window.I18n.t(key) : key;
    let currentCategory = null;

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-market';

        screen.innerHTML = currentCategory ? renderCategoryView() : renderCategoriesView();
        requestAnimationFrame(() => bindEvents(screen));
        return screen;
    }

    function renderCategoriesView() {
        return `
            <div class="section-header">
                <span class="section-title">🏪 ${t('nav.market')}</span>
            </div>

            <div class="market-categories">
                <div class="market-category glass-panel" data-category="feed">
                    <div class="category-icon">🌾</div>
                    <div class="category-name">${t('market.feed')}</div>
                    <div class="category-count">3 ${t('market.items')}</div>
                </div>
                <div class="market-category glass-panel" data-category="medicine">
                    <div class="category-icon">💊</div>
                    <div class="category-name">${t('market.medicine')}</div>
                    <div class="category-count">5 ${t('market.items')}</div>
                </div>
                <div class="market-category glass-panel" data-category="supplements">
                    <div class="category-icon">💉</div>
                    <div class="category-name">${t('market.supplements')}</div>
                    <div class="category-count">3 ${t('market.items')}</div>
                </div>
                <div class="market-category glass-panel" data-category="upgrades">
                    <div class="category-icon">🔧</div>
                    <div class="category-name">${t('market.upgrades')}</div>
                    <div class="category-count">5 ${t('market.items')}</div>
                </div>
            </div>

            <div class="section-header" style="margin-top:var(--space-lg)">
                <span class="section-title">🕊️ ${t('market.sell_pigeons')}</span>
            </div>
            <p style="font-size:var(--font-size-sm);color:var(--text-secondary);margin-bottom:var(--space-md)">
                ${t('market.sell_desc')}
            </p>
            ${renderSellablePigeons()}
        `;
    }

    function renderCategoryView() {
        const items = window.ItemsDB ? window.ItemsDB.getItemsByCategory(currentCategory) : [];

        return `
            <div class="section-header">
                <button class="btn btn-secondary btn-sm" id="btn-market-back">← ${t('action.back')}</button>
                <span class="section-title">${t('market.' + currentCategory)}</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
                ${items.map(item => renderMarketItem(item)).join('')}
            </div>
        `;
    }

    function renderMarketItem(item) {
        const costEntry = Object.entries(item.cost || {})[0] || ['feedMoney', 0];
        const currencyType = costEntry[0];
        const costValue = costEntry[1];
        const currencyIcon = currencyType === 'feedMoney' ? '🌾' : currencyType === 'tokens' ? '🏅' : '💎';
        const canBuy = window.EconomySystem ? window.EconomySystem.canAfford(currencyType, costValue) : true;

        return `
            <div class="market-item glass-panel" data-item-id="${item.id}" data-category="${currentCategory}">
                <div class="item-icon">${item.icon || '📦'}</div>
                <div class="item-info">
                    <div class="item-name">${t(item.nameKey)}</div>
                    <div class="item-desc">${t(item.descriptionKey || item.nameKey + '.desc')}</div>
                </div>
                <div style="text-align:right">
                    <div class="item-price">${currencyIcon} ${costValue}</div>
                    <button class="btn btn-primary btn-sm" data-action="buy" data-item="${item.id}" 
                        ${canBuy ? '' : 'disabled'} style="margin-top:4px">
                        ${t('action.buy')}
                    </button>
                </div>
            </div>
        `;
    }

    function renderSellablePigeons() {
        const pigeons = window.GameState ? window.GameState.pigeons.filter(p => p.lifecycle === 'adult' && !p.isFavorite) : [];
        if (pigeons.length === 0) {
            return `<div class="empty-state"><p class="empty-text">${t('market.no_sellable')}</p></div>`;
        }

        return pigeons.slice(0, 5).map(p => {
            const value = window.EconomySystem ? window.EconomySystem.getMarketValue(p) : Math.round((p.qi || 10) * 50);
            const breed = window.BreedsDB ? window.BreedsDB.getBreed(p.breedId) : null;

            return `
                <div class="pigeon-card" style="margin-bottom:var(--space-sm)">
                    <div class="pigeon-avatar">🕊️</div>
                    <div class="pigeon-info">
                        <div class="pigeon-name">${p.name || t('pigeon.unnamed')}</div>
                        <div class="pigeon-breed">${breed ? t(breed.nameKey) : ''} · Qi ${Math.round(p.qi || 0)}</div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-weight:700;color:var(--gold-300);font-size:var(--font-size-sm)">🌾 ${value}</div>
                        <button class="btn btn-sm" data-action="sell" data-pigeon-id="${p.id}" data-value="${value}"
                            style="margin-top:4px;background:rgba(244,67,54,0.2);color:#ef5350;border:1px solid rgba(244,67,54,0.3)">
                            ${t('action.sell')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    function bindEvents(screen) {
        // Category navigation
        screen.querySelectorAll('.market-category').forEach(cat => {
            cat.addEventListener('click', () => {
                currentCategory = cat.dataset.category;
                if (window.AudioManager) window.AudioManager.play('ui_click');
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        });

        // Back button
        const backBtn = screen.querySelector('#btn-market-back');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                currentCategory = null;
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        }

        // Buy buttons
        screen.querySelectorAll('[data-action="buy"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = btn.dataset.item;
                if (window.EconomySystem && currentCategory) {
                    const result = window.EconomySystem.purchaseItem(currentCategory, itemId, 1);
                    if (result && result.success) {
                        if (window.ScreenManager) window.ScreenManager.showToast(t('market.purchased'), 'success');
                        if (window.AudioManager) window.AudioManager.play('coin');
                    } else {
                        if (window.ScreenManager) window.ScreenManager.showToast(t('economy.not_enough'), 'error');
                        if (window.AudioManager) window.AudioManager.play('error');
                    }
                    if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
                }
            });
        });

        // Sell buttons
        screen.querySelectorAll('[data-action="sell"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const pigeonId = btn.dataset.pigeonId;
                const value = parseInt(btn.dataset.value) || 0;

                if (window.GameState && window.EconomySystem) {
                    const idx = window.GameState.pigeons.findIndex(p => p.id === pigeonId);
                    if (idx >= 0) {
                        window.GameState.pigeons.splice(idx, 1);
                        window.EconomySystem.addCurrency('feedMoney', value);
                        if (window.ScreenManager) window.ScreenManager.showToast(`+${value} 🌾`, 'reward');
                        if (window.AudioManager) window.AudioManager.play('coin');
                        if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
                    }
                }
            });
        });
    }

    return { render };
})();
