/* ============================================================
   js/ui/screens.js — Screen Manager (Hub-spoke navigation)
   Handles switching between screens, back navigation, modals
   ============================================================ */

window.ScreenManager = (function () {
    'use strict';

    const SCREENS = ['coop', 'flight', 'flock', 'market', 'more'];
    let currentScreen = 'coop';
    let screenStack = [];
    let screenRenderers = {};

    function init() {
        // Bind bottom nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const screen = tab.dataset.screen;
                if (screen) switchScreen(screen);
                if (window.AudioManager) window.AudioManager.play('ui_click');
            });
        });

        // Settings button
        const settingsBtn = document.getElementById('btn-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                toggleSettings(true);
                if (window.AudioManager) window.AudioManager.play('ui_click');
            });
        }

        const settingsClose = document.getElementById('settings-close');
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                toggleSettings(false);
            });
        }

        // Language setting
        const langSelect = document.getElementById('setting-language');
        if (langSelect) {
            langSelect.value = window.I18n ? window.I18n.getLanguage() : 'tr';
            langSelect.addEventListener('change', (e) => {
                if (window.I18n) window.I18n.setLanguage(e.target.value);
                refreshCurrentScreen();
            });
        }

        // Sound settings
        const soundToggle = document.getElementById('setting-sound');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                if (window.AudioManager) window.AudioManager.setSfxEnabled(e.target.checked);
            });
        }

        // Modal overlay click-to-close
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) closeModal();
            });
        }

        // Listen for screen change events
        if (window.EventBus) {
            window.EventBus.on(window.EventBus.Events.SCREEN_CHANGED, (data) => {
                updateNavHighlight(data.screen);
            });
        }

        // Render initial screen
        switchScreen('coop');
    }

    function registerScreen(name, renderer) {
        screenRenderers[name] = renderer;
    }

    function switchScreen(screenName) {
        if (!SCREENS.includes(screenName) && !screenRenderers[screenName]) return;

        const container = document.getElementById('screen-container');
        const canvas = document.getElementById('game-canvas');
        if (!container) return;

        currentScreen = screenName;
        screenStack = [screenName];

        // Show canvas only for flight
        if (canvas) {
            canvas.classList.toggle('active', screenName === 'flight');
        }

        // Render screen content
        container.innerHTML = '';
        container.scrollTop = 0;

        if (screenRenderers[screenName]) {
            const screenEl = screenRenderers[screenName].render();
            if (screenEl) {
                container.appendChild(screenEl);
            }
        } else {
            container.innerHTML = renderPlaceholder(screenName);
        }

        updateNavHighlight(screenName);

        if (window.EventBus) {
            window.EventBus.emit(window.EventBus.Events.SCREEN_CHANGED, { screen: screenName });
        }

        if (window.AudioManager) window.AudioManager.play('ui_swipe');
    }

    function pushScreen(screenName, renderFn) {
        screenStack.push(screenName);
        const container = document.getElementById('screen-container');
        if (!container) return;
        container.innerHTML = '';
        container.scrollTop = 0;

        if (renderFn) {
            const el = renderFn();
            if (el) container.appendChild(el);
        } else if (screenRenderers[screenName]) {
            const el = screenRenderers[screenName].render();
            if (el) container.appendChild(el);
        }
    }

    function popScreen() {
        if (screenStack.length > 1) {
            screenStack.pop();
            const prev = screenStack[screenStack.length - 1];
            switchScreen(prev);
        }
    }

    function refreshCurrentScreen() {
        switchScreen(currentScreen);
    }

    function updateNavHighlight(screenName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.screen === screenName);
        });
    }

    function toggleSettings(show) {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.toggle('hidden', !show);
        }
    }

    // Modal system
    function openModal(contentHtml) {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        if (overlay && content) {
            if (typeof contentHtml === 'string') {
                content.innerHTML = contentHtml;
            } else if (contentHtml instanceof HTMLElement) {
                content.innerHTML = '';
                content.appendChild(contentHtml);
            }
            overlay.classList.remove('hidden');
        }
        if (window.EventBus) {
            window.EventBus.emit(window.EventBus.Events.MODAL_OPENED);
        }
    }

    function closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('hidden');
        if (window.EventBus) {
            window.EventBus.emit(window.EventBus.Events.MODAL_CLOSED);
        }
    }

    // Toast notification
    function showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, duration);
    }

    function renderPlaceholder(screenName) {
        const t = window.I18n ? window.I18n.t.bind(window.I18n) : (k) => k;
        return `
            <div class="screen">
                <div class="empty-state">
                    <div class="empty-icon">🚧</div>
                    <p class="empty-text">${t('nav.' + screenName)} - ${t('common.coming_soon') || 'Yakında'}</p>
                </div>
            </div>
        `;
    }

    function getCurrentScreen() { return currentScreen; }

    return {
        init,
        registerScreen,
        switchScreen,
        pushScreen,
        popScreen,
        refreshCurrentScreen,
        openModal,
        closeModal,
        showToast,
        getCurrentScreen
    };
})();
