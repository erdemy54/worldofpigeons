/* ============================================================
   js/ui/quests-ui.js — Quests Screen
   Daily & weekly quests with progress tracking
   ============================================================ */
window.QuestsScreen = (function () {
    'use strict';
    const t = (key) => window.I18n ? window.I18n.t(key) : key;

    function getQuests() {
        return window.GameState ? (window.GameState.quests || generateDefaultQuests()) : generateDefaultQuests();
    }

    function generateDefaultQuests() {
        return {
            daily: [
                { id: 'd1', titleKey: 'quest.feed_5', target: 5, current: 0, reward: { feedMoney: 300 }, type: 'feed' },
                { id: 'd2', titleKey: 'quest.fly_once', target: 1, current: 0, reward: { feedMoney: 500 }, type: 'flight' },
                { id: 'd3', titleKey: 'quest.train_3', target: 3, current: 0, reward: { feedMoney: 200 }, type: 'train' },
                { id: 'd4', titleKey: 'quest.clean_coop', target: 1, current: 0, reward: { tokens: 5 }, type: 'clean' },
            ],
            weekly: [
                { id: 'w1', titleKey: 'quest.breed_once', target: 1, current: 0, reward: { tokens: 15 }, type: 'breed' },
                { id: 'w2', titleKey: 'quest.win_competition', target: 1, current: 0, reward: { tokens: 20, diamonds: 1 }, type: 'competition' },
                { id: 'w3', titleKey: 'quest.score_500', target: 500, current: 0, reward: { tokens: 10 }, type: 'score' },
            ]
        };
    }

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-quests';
        const quests = getQuests();

        screen.innerHTML = `
            <div class="section-header"><span class="section-title">📜 ${t('quest.title')}</span></div>
            <div class="tab-bar">
                <button class="tab-item active" data-tab="daily">${t('quest.daily')}</button>
                <button class="tab-item" data-tab="weekly">${t('quest.weekly')}</button>
            </div>
            <div id="quest-list">
                ${renderQuestList(quests.daily)}
            </div>
        `;

        requestAnimationFrame(() => {
            screen.querySelectorAll('.tab-item').forEach(tab => {
                tab.addEventListener('click', () => {
                    screen.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    const list = screen.querySelector('#quest-list');
                    const type = tab.dataset.tab;
                    if (list) list.innerHTML = renderQuestList(type === 'weekly' ? quests.weekly : quests.daily);
                    if (window.AudioManager) window.AudioManager.play('ui_click');
                });
            });
            screen.querySelectorAll('[data-action="claim"]').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (window.ScreenManager) window.ScreenManager.showToast(t('quest.claimed'), 'reward');
                    if (window.AudioManager) window.AudioManager.play('coin');
                });
            });
        });

        return screen;
    }

    function renderQuestList(quests) {
        return quests.map(q => {
            const progress = Math.min((q.current / q.target) * 100, 100);
            const done = q.current >= q.target;
            const rewardText = Object.entries(q.reward).map(([k, v]) => {
                const icon = k === 'feedMoney' ? '🌾' : k === 'tokens' ? '🏅' : '💎';
                return `${icon} ${v}`;
            }).join(' ');

            return `
                <div class="quest-item glass-panel ${done ? '' : ''}" style="${done ? 'opacity:0.7' : ''}">
                    <div class="quest-header">
                        <span class="quest-title">${done ? '✅' : '📌'} ${t(q.titleKey)}</span>
                        <span class="quest-reward">${rewardText}</span>
                    </div>
                    <div class="quest-progress">
                        <div class="progress-bar" style="flex:1">
                            <div class="progress-fill" style="width:${progress}%;${done ? 'background:var(--success)' : ''}"></div>
                        </div>
                        <span class="progress-text">${q.current}/${q.target}</span>
                    </div>
                    ${done ? `<button class="btn btn-primary btn-sm" data-action="claim" style="margin-top:var(--space-sm);width:100%">${t('quest.claim')}</button>` : ''}
                </div>
            `;
        }).join('');
    }

    return { render };
})();
