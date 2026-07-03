/* ============================================================
   js/ui/onboarding.js — First-Time User Experience (FTUE)
   Step-by-step tutorial overlay for new players
   ============================================================ */
window.OnboardingSystem = (function () {
    'use strict';
    const t = (key) => window.I18n ? window.I18n.t(key) : key;

    const STEPS = [
        { icon: '🕊️', titleKey: 'onboarding.welcome_title', textKey: 'onboarding.welcome_text' },
        { icon: '🏠', titleKey: 'onboarding.coop_title', textKey: 'onboarding.coop_text' },
        { icon: '🌾', titleKey: 'onboarding.feeding_title', textKey: 'onboarding.feeding_text' },
        { icon: '🕊️', titleKey: 'onboarding.flight_title', textKey: 'onboarding.flight_text' },
        { icon: '💕', titleKey: 'onboarding.breeding_title', textKey: 'onboarding.breeding_text' },
        { icon: '🏆', titleKey: 'onboarding.goal_title', textKey: 'onboarding.goal_text' },
    ];

    let currentStep = 0;
    let overlay = null;

    function shouldShow() {
        return !localStorage.getItem('wop_onboarding_done');
    }

    function start() {
        if (!shouldShow()) return;
        currentStep = 0;
        showStep();
    }

    function showStep() {
        if (currentStep >= STEPS.length) {
            finish();
            return;
        }

        const step = STEPS[currentStep];

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'onboarding-overlay';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="onboarding-card glass-panel">
                <div class="onboarding-icon">${step.icon}</div>
                <h3 class="onboarding-title">${t(step.titleKey)}</h3>
                <p class="onboarding-text">${t(step.textKey)}</p>
                <div class="onboarding-steps">
                    ${STEPS.map((_, i) => `<div class="onboarding-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}"></div>`).join('')}
                </div>
                <div style="display:flex;gap:var(--space-sm);justify-content:center">
                    ${currentStep > 0 ? `<button class="btn btn-secondary" id="onboarding-prev">← ${t('action.back')}</button>` : ''}
                    <button class="btn btn-primary" id="onboarding-next">
                        ${currentStep === STEPS.length - 1 ? `🚀 ${t('onboarding.start_game')}` : `${t('action.next')} →`}
                    </button>
                </div>
                <button style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem" id="onboarding-skip">✕</button>
            </div>
        `;

        overlay.querySelector('#onboarding-next').addEventListener('click', () => {
            currentStep++;
            if (window.AudioManager) window.AudioManager.play('ui_click');
            showStep();
        });

        const prevBtn = overlay.querySelector('#onboarding-prev');
        if (prevBtn) prevBtn.addEventListener('click', () => { currentStep--; showStep(); });

        overlay.querySelector('#onboarding-skip').addEventListener('click', finish);
    }

    function finish() {
        localStorage.setItem('wop_onboarding_done', '1');
        if (overlay && overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
            overlay = null;
        }
    }

    function reset() {
        localStorage.removeItem('wop_onboarding_done');
    }

    return { start, shouldShow, finish, reset };
})();
