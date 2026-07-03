/* ============================================================
   js/ui/competition-ui.js — Competition Screen
   Performance, beauty, attraction competition modes
   ============================================================ */
window.CompetitionScreen = (function () {
    'use strict';
    const t = (key) => window.I18n ? window.I18n.t(key) : key;

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-competition';
        screen.innerHTML = `
            <div class="section-header"><span class="section-title">🏆 ${t('competition.title')}</span></div>
            <div class="competition-types">
                <div class="competition-type glass-panel" data-type="performance">
                    <div class="comp-icon">🕊️</div>
                    <div class="comp-name">${t('competition.performance')}</div>
                </div>
                <div class="competition-type glass-panel" data-type="beauty">
                    <div class="comp-icon">✨</div>
                    <div class="comp-name">${t('competition.beauty')}</div>
                </div>
                <div class="competition-type glass-panel" data-type="attraction">
                    <div class="comp-icon">💫</div>
                    <div class="comp-name">${t('competition.attraction')}</div>
                </div>
            </div>
            <div class="section-header"><span class="section-title">${t('competition.rankings')}</span></div>
            <div class="ranking-list">
                ${generateMockRankings()}
            </div>
            <div style="text-align:center;margin-top:var(--space-lg)">
                <button class="btn btn-primary btn-lg" id="btn-enter-competition">🏆 ${t('competition.enter')}</button>
            </div>
        `;
        requestAnimationFrame(() => {
            const btn = screen.querySelector('#btn-enter-competition');
            if (btn) btn.addEventListener('click', () => {
                if (window.ScreenManager) window.ScreenManager.showToast(t('competition.entered'), 'success');
                if (window.AudioManager) window.AudioManager.play('success');
            });
        });
        return screen;
    }

    function generateMockRankings() {
        const names = ['Ahmet\'in Şahini', 'Mehmet\'in Aslanı', 'Fatma\'nın Sultanı', 'Ali\'nin Kartalı', 'Hasan\'ın Yıldızı'];
        return names.map((name, i) => `
            <div class="ranking-item">
                <div class="rank-number">${i + 1}</div>
                <div style="flex:1"><span style="font-weight:600">${name}</span></div>
                <span style="color:var(--gold-300);font-weight:700;font-size:var(--font-size-sm)">${Math.round(950 - i * 120)} pts</span>
            </div>
        `).join('');
    }

    return { render };
})();
