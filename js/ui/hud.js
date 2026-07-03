/* ============================================================
   js/ui/hud.js — HUD (Top Bar) Controller
   Updates currencies, level, notifications in real-time
   ============================================================ */

window.HudController = (function () {
    'use strict';

    const elements = {};

    function init() {
        elements.level = document.getElementById('hud-level');
        elements.levelBadge = elements.level ? elements.level.querySelector('.hud-level-badge') : null;
        elements.playerName = document.getElementById('hud-player-name');
        elements.feedValue = document.getElementById('currency-feed-value');
        elements.tokenValue = document.getElementById('currency-token-value');
        elements.diamondValue = document.getElementById('currency-diamond-value');
        elements.notifBadge = document.getElementById('notification-badge');

        // Listen for economy changes
        if (window.EventBus) {
            window.EventBus.on(window.EventBus.Events.CURRENCY_CHANGED, onCurrencyChanged);
            window.EventBus.on(window.EventBus.Events.LEVEL_UP, onLevelUp);
            window.EventBus.on(window.EventBus.Events.NOTIFICATION, onNotification);
        }

        // Initial render from game state
        refreshAll();
    }

    function refreshAll() {
        if (window.EconomySystem) {
            const currencies = window.EconomySystem.getWallet();
            updateCurrency('feedMoney', currencies.feedMoney);
            updateCurrency('tokens', currencies.tokens);
            updateCurrency('diamonds', currencies.diamonds);
        }

        // Set player info
        if (window.GameState) {
            setPlayerName(window.GameState.player.name);
            setLevel(window.GameState.player.level);
        }
    }

    function onCurrencyChanged(data) {
        if (data.type === 'feedMoney') updateCurrency('feedMoney', data.newValue);
        else if (data.type === 'tokens') updateCurrency('tokens', data.newValue);
        else if (data.type === 'diamonds') updateCurrency('diamonds', data.newValue);
    }

    function updateCurrency(type, value) {
        const formatted = formatNumber(value);
        if (type === 'feedMoney' && elements.feedValue) {
            animateValue(elements.feedValue, formatted);
        } else if (type === 'tokens' && elements.tokenValue) {
            animateValue(elements.tokenValue, formatted);
        } else if (type === 'diamonds' && elements.diamondValue) {
            animateValue(elements.diamondValue, formatted);
        }
    }

    function animateValue(el, newValue) {
        const oldValue = el.textContent;
        el.textContent = newValue;
        if (oldValue !== newValue) {
            el.style.transition = 'none';
            el.style.transform = 'scale(1.3)';
            el.style.color = '#f0d78c';
            requestAnimationFrame(() => {
                el.style.transition = 'transform 0.3s ease, color 0.3s ease';
                el.style.transform = 'scale(1)';
                el.style.color = '';
            });
        }
    }

    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 10000) return (num / 1000).toFixed(1) + 'K';
        if (num >= 1000) return num.toLocaleString('tr-TR');
        return String(Math.floor(num));
    }

    function setPlayerName(name) {
        if (elements.playerName) elements.playerName.textContent = name || '';
    }

    function setLevel(level) {
        if (elements.levelBadge) {
            elements.levelBadge.textContent = level || 1;
        }
    }

    function onLevelUp(data) {
        setLevel(data.level);
        if (elements.levelBadge) {
            elements.levelBadge.style.animation = 'none';
            requestAnimationFrame(() => {
                elements.levelBadge.style.animation = 'rewardBounce 0.6s ease';
            });
        }
    }

    let notifCount = 0;

    function onNotification() {
        notifCount++;
        if (elements.notifBadge) {
            elements.notifBadge.textContent = notifCount > 99 ? '99+' : notifCount;
            elements.notifBadge.classList.remove('hidden');
        }
    }

    function clearNotifications() {
        notifCount = 0;
        if (elements.notifBadge) {
            elements.notifBadge.classList.add('hidden');
        }
    }

    return { init, refreshAll, setPlayerName, setLevel, clearNotifications };
})();
