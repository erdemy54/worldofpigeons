/* ============================================================
   js/core/game.js — Main Game Controller
   Initializes all systems, manages game state, runs game loop
   THIS FILE MUST BE LOADED LAST
   ============================================================ */

// Global game state
window.GameState = {
    version: 1,
    player: {
        name: '',
        level: 1,
        xp: 0,
        xpToNextLevel: 100
    },
    pigeons: [],
    coop: {
        capacity: 12,
        hygiene: 1.0,
        upgrades: {},
        lastCleanTime: Date.now()
    },
    economy: {
        feedMoney: 5000,
        tokens: 20,
        diamonds: 5
    },
    quests: null,
    activeBreedings: [],
    settings: {
        language: 'tr',
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true
    },
    stats: {
        totalFlights: 0,
        totalTricks: 0,
        totalBreedings: 0,
        pigeonsBred: 0,
        highestQi: 0,
        daysPlayed: 0
    },
    lastSaveTime: Date.now(),
    isNewPlayer: true
};

window.GameController = (function () {
    'use strict';

    let isRunning = false;
    let lastFrameTime = 0;
    let canvas, ctx;

    function init() {
        console.log('%c🕊️ World of Pigeon\'s — Initializing...', 'color: #d4a853; font-size: 16px; font-weight: bold;');

        // Load saved game
        loadGame();

        // Initialize canvas
        canvas = document.getElementById('game-canvas');
        if (canvas) {
            ctx = canvas.getContext('2d');
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        // Initialize core systems
        if (window.I18n) {
            window.I18n.setLanguage(window.GameState.settings.language);
        }

        if (window.AudioManager) {
            window.AudioManager.init();
        }

        if (window.TimeManager) {
            window.TimeManager.start();
        }

        // Initialize economy with saved values
        if (window.EconomySystem && window.EconomySystem.init) {
            window.EconomySystem.init(window.GameState.economy);
        }

        // Initialize UI
        if (window.HudController) window.HudController.init();

        // Register screens
        if (window.ScreenManager) {
            window.ScreenManager.registerScreen('coop', window.CoopScreen);
            window.ScreenManager.registerScreen('flight', window.FlightViewScreen);
            window.ScreenManager.registerScreen('flock', window.FlockScreen);
            window.ScreenManager.registerScreen('market', window.MarketScreen);
            window.ScreenManager.registerScreen('more', {
                render: renderMoreScreen
            });

            window.ScreenManager.init();
        }

        // Start loading animation
        startLoadingSequence();
    }

    function startLoadingSequence() {
        const loadingBar = document.getElementById('loading-bar');
        const loadingStatus = document.getElementById('loading-status');
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');

        const t = window.I18n ? window.I18n.t.bind(window.I18n) : (k) => k;
        const steps = [
            { progress: 20, text: t('loading.breeds') || 'Irklar yükleniyor...' },
            { progress: 40, text: t('loading.genetics') || 'Genetik sistem hazırlanıyor...' },
            { progress: 60, text: t('loading.world') || 'Dünya oluşturuluyor...' },
            { progress: 80, text: t('loading.audio') || 'Ses sistemi başlatılıyor...' },
            { progress: 100, text: t('loading.ready') || 'Hazır!' },
        ];

        let stepIndex = 0;
        const interval = setInterval(() => {
            if (stepIndex >= steps.length) {
                clearInterval(interval);

                // Fade out loading screen, show game
                setTimeout(() => {
                    if (loadingScreen) loadingScreen.classList.add('fade-out');
                    if (gameContainer) gameContainer.classList.remove('hidden');

                    setTimeout(() => {
                        if (loadingScreen) loadingScreen.style.display = 'none';

                        // Refresh HUD
                        if (window.HudController) window.HudController.refreshAll();

                        // Start game loop
                        startGameLoop();

                        // Show onboarding for new players
                        if (window.GameState.isNewPlayer && window.OnboardingSystem) {
                            window.OnboardingSystem.start();
                        }

                        // Auto-give starter pigeons if none exist
                        if (window.GameState.pigeons.length === 0) {
                            giveStarterPigeons();
                        }

                        // Process offline progress
                        processOfflineProgress();

                        // Emit game loaded
                        if (window.EventBus) {
                            window.EventBus.emit(window.EventBus.Events.GAME_LOADED, window.GameState);
                        }

                        console.log('%c🕊️ World of Pigeon\'s — Ready!', 'color: #4caf50; font-size: 14px;');
                    }, 600);
                }, 300);

                return;
            }

            const step = steps[stepIndex];
            if (loadingBar) loadingBar.style.width = step.progress + '%';
            if (loadingStatus) loadingStatus.textContent = step.text;
            stepIndex++;
        }, 400);
    }

    function giveStarterPigeons() {
        if (!window.GeneticsSystem) return;

        const male = window.GeneticsSystem.createPigeon('turk_taklacisi', { gender: 'male' });
        const female = window.GeneticsSystem.createPigeon('turk_taklacisi', { gender: 'female' });

        male.name = 'Aslan';
        female.name = 'Sultan';

        window.GameState.pigeons.push(male, female);
        window.GameState.isNewPlayer = false;

        // Recalculate Qi for starters
        [male, female].forEach(p => {
            if (window.GeneticsSystem.calculateQi) {
                p.qi = window.GeneticsSystem.calculateQi(p);
                p.grade = window.GeneticsSystem.getQualityGrade(p.qi);
            }
        });

        saveGame();
    }

    function processOfflineProgress() {
        if (!window.TimeManager) return;

        const lastSave = window.GameState.lastSaveTime;
        if (!lastSave) return;

        const elapsed = Date.now() - lastSave;
        const elapsedMinutes = elapsed / 60000;

        if (elapsedMinutes < 1) return; // Less than 1 minute, skip

        const gameDaysElapsed = elapsedMinutes / 10; // 10 real minutes = 1 game day

        if (gameDaysElapsed > 0.1) {
            // Hunger decay
            window.GameState.pigeons.forEach(p => {
                p.hunger = Math.max(0, (p.hunger || 100) - gameDaysElapsed * 8);
                // Condition decay from hunger
                if (p.hunger < 20) {
                    p.condition = Math.max(0.3, (p.condition || 1) - gameDaysElapsed * 0.05);
                }
            });

            // Hygiene decay
            window.GameState.coop.hygiene = Math.max(0, (window.GameState.coop.hygiene || 1) - gameDaysElapsed * 0.03);

            const t = window.I18n ? window.I18n.t.bind(window.I18n) : (k) => k;
            if (window.ScreenManager && gameDaysElapsed > 0.5) {
                window.ScreenManager.showToast(
                    `${t('offline.welcome_back')} (${Math.floor(gameDaysElapsed)} ${t('time.game_days')})`,
                    'info', 4000
                );
            }
        }
    }

    // ---- GAME LOOP ----
    function startGameLoop() {
        isRunning = true;
        lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);

        // Auto-save interval (every 60 seconds)
        setInterval(() => {
            saveGame();
        }, 60000);
    }

    function gameLoop(timestamp) {
        if (!isRunning) return;

        const deltaTime = (timestamp - lastFrameTime) / 1000; // seconds
        lastFrameTime = timestamp;

        // Time system updates itself internally via setInterval
        // No manual update needed here

        // Render canvas (only when flight view is active)
        if (canvas && ctx && canvas.classList.contains('active')) {
            renderFlightCanvas(deltaTime);
        }

        requestAnimationFrame(gameLoop);
    }

    function renderFlightCanvas(deltaTime) {
        const w = canvas.width;
        const h = canvas.height;

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Get current time phase
        const phase = window.TimeManager ? window.TimeManager.phase : 'day';

        // Render sky
        if (window.SkyRenderer) {
            window.SkyRenderer.render(ctx, canvas, phase, deltaTime);
        }

        // Render pigeons
        const flyingPigeons = window.GameState.pigeons.filter(p => p._isFlying);
        if (flyingPigeons.length > 0 && window.PigeonSprite) {
            const time = performance.now() / 1000;
            window.PigeonSprite.drawFlock(ctx, flyingPigeons, w * 0.5, h * 0.4, time);
        }

        // Render particles
        if (window.ParticleSystem) {
            window.ParticleSystem.update(deltaTime);
            window.ParticleSystem.render(ctx);
        }
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
        canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
        if (ctx) ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

        if (window.SkyRenderer) window.SkyRenderer.init(canvas);
        if (window.CameraController) window.CameraController.init(canvas.width, canvas.height);
    }

    // ---- SAVE / LOAD ----
    function saveGame() {
        window.GameState.lastSaveTime = Date.now();

        // Sync economy state
        if (window.EconomySystem && window.EconomySystem.getCurrencies) {
            window.GameState.economy = window.EconomySystem.getCurrencies();
        }

        if (window.SaveManager) {
            window.SaveManager.save(window.GameState);
        }
    }

    function loadGame() {
        if (window.SaveManager && window.SaveManager.exists()) {
            const saved = window.SaveManager.load();
            if (saved) {
                // Merge saved state (keeping defaults for new fields)
                Object.keys(saved).forEach(key => {
                    if (key === 'pigeons') {
                        window.GameState.pigeons = saved.pigeons || [];
                    } else if (typeof saved[key] === 'object' && !Array.isArray(saved[key]) && saved[key] !== null) {
                        window.GameState[key] = { ...window.GameState[key], ...saved[key] };
                    } else {
                        window.GameState[key] = saved[key];
                    }
                });
                window.GameState.isNewPlayer = false;
            }
        }
    }

    // ---- MORE SCREEN ----
    function renderMoreScreen() {
        const t = window.I18n ? window.I18n.t.bind(window.I18n) : (k) => k;
        const screen = document.createElement('div');
        screen.className = 'screen screen-more';

        screen.innerHTML = `
            <div class="section-header">
                <span class="section-title">⭐ ${t('nav.more')}</span>
            </div>

            <div class="more-menu">
                <div class="more-menu-item glass-panel" data-action="breeding">
                    <span class="menu-icon">💕</span>
                    <span class="menu-label">${t('breeding.title')}</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="more-menu-item glass-panel" data-action="health">
                    <span class="menu-icon">🩺</span>
                    <span class="menu-label">${t('health.title')}</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="more-menu-item glass-panel" data-action="competition">
                    <span class="menu-icon">🏆</span>
                    <span class="menu-label">${t('competition.title')}</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="more-menu-item glass-panel" data-action="quests">
                    <span class="menu-icon">📜</span>
                    <span class="menu-label">${t('quest.title')}</span>
                    <span class="menu-arrow">›</span>
                </div>
                <div class="more-menu-item glass-panel" data-action="settings">
                    <span class="menu-icon">⚙️</span>
                    <span class="menu-label">${t('settings.title')}</span>
                    <span class="menu-arrow">›</span>
                </div>
            </div>

            <div class="card glass-panel" style="margin-top:var(--space-lg);text-align:center;padding:var(--space-lg)">
                <p style="font-size:var(--font-size-sm);color:var(--text-muted)">World of Pigeon's v0.1.0-MVP</p>
                <p style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:4px">© 2026 Erdem YILMAZ</p>
                <p style="font-size:var(--font-size-xs);color:var(--text-muted);margin-top:2px">worldofpigeons.com</p>
            </div>
        `;

        requestAnimationFrame(() => {
            screen.querySelectorAll('.more-menu-item').forEach(item => {
                item.addEventListener('click', () => {
                    const action = item.dataset.action;
                    if (window.AudioManager) window.AudioManager.play('ui_click');

                    switch (action) {
                        case 'breeding':
                            if (window.ScreenManager) window.ScreenManager.pushScreen('breeding', () => window.BreedingScreen.render());
                            break;
                        case 'health':
                            if (window.ScreenManager) window.ScreenManager.pushScreen('health', () => window.HealthScreen.render());
                            break;
                        case 'competition':
                            if (window.ScreenManager) window.ScreenManager.pushScreen('competition', () => window.CompetitionScreen.render());
                            break;
                        case 'quests':
                            if (window.ScreenManager) window.ScreenManager.pushScreen('quests', () => window.QuestsScreen.render());
                            break;
                        case 'settings':
                            const settingsPanel = document.getElementById('settings-panel');
                            if (settingsPanel) settingsPanel.classList.remove('hidden');
                            break;
                    }
                });
            });
        });

        return screen;
    }

    return { init, saveGame, loadGame };
})();

// ---- AUTO-START ----
document.addEventListener('DOMContentLoaded', () => {
    window.GameController.init();
});
