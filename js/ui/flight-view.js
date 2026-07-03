/* ============================================================
   js/ui/flight-view.js — Flight View Screen
   Pre-flight selection, active flight display, post-flight summary
   ============================================================ */

window.FlightViewScreen = (function () {
    'use strict';

    const t = (key) => window.I18n ? window.I18n.t(key) : key;
    let selectedPigeons = [];
    let flightSession = null;
    let flightPhase = 'pre'; // pre | active | summary

    function render() {
        const screen = document.createElement('div');
        screen.className = 'screen screen-flight';

        if (flightPhase === 'active' && flightSession) {
            screen.innerHTML = renderActiveHtml();
        } else if (flightPhase === 'summary' && flightSession) {
            screen.innerHTML = renderSummaryHtml();
        } else {
            screen.innerHTML = renderPreFlightHtml();
        }

        requestAnimationFrame(() => bindEvents(screen));
        return screen;
    }

    function renderPreFlightHtml() {
        const pigeons = window.GameState ? window.GameState.pigeons.filter(p => p.lifecycle === 'adult' && !p.health.sick) : [];

        return `
            <div class="flight-pre">
                <h2>🕊️ ${t('flight.select_flock')}</h2>
                <p style="text-align:center;color:var(--text-secondary);font-size:var(--font-size-sm);margin-bottom:var(--space-lg)">
                    ${t('flight.select_desc')} (${selectedPigeons.length}/8)
                </p>

                <div class="flock-select-grid">
                    ${pigeons.map(p => renderSelectCard(p)).join('')}
                </div>

                ${pigeons.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">🕊️</div>
                        <p class="empty-text">${t('flight.no_pigeons_available')}</p>
                    </div>
                ` : ''}

                <div style="display:flex;justify-content:center;gap:var(--space-md);margin-top:var(--space-lg)">
                    <button class="btn btn-primary btn-lg ${selectedPigeons.length === 0 ? '' : 'btn-glow'}" 
                        id="btn-launch-flight" ${selectedPigeons.length === 0 ? 'disabled' : ''}>
                        🚀 ${t('flight.launch')}
                    </button>
                </div>
            </div>
        `;
    }

    function renderSelectCard(pigeon) {
        const isSelected = selectedPigeons.includes(pigeon.id);
        const breed = window.BreedsDB ? window.BreedsDB.getBreed(pigeon.breedId) : null;
        const breedName = breed ? t(breed.nameKey) : pigeon.breedId;

        return `
            <div class="flock-select-item glass-panel ${isSelected ? 'selected' : ''}" data-pigeon-id="${pigeon.id}">
                <div class="select-check">✓</div>
                <div style="font-size:2rem;margin-bottom:4px">🕊️</div>
                <div style="font-size:var(--font-size-sm);font-weight:600">${pigeon.name || t('pigeon.unnamed')}</div>
                <div style="font-size:var(--font-size-xs);color:var(--text-muted)">${breedName}</div>
                <div class="tier-badge tier-${(pigeon.grade || 'B').toLowerCase().replace('+','-plus')}" style="margin-top:4px">${pigeon.grade}</div>
            </div>
        `;
    }

    function renderActiveHtml() {
        const score = flightSession ? flightSession.totalScore : 0;
        const elapsed = flightSession ? flightSession.elapsedMinutes : 0;

        return `
            <div class="flight-score">
                <div class="score-value">${Math.round(score)}</div>
                <div class="score-label">${t('flight.score')}</div>
            </div>

            <div class="view-toggle">
                <button class="active" data-view="far">${t('flight.far_view')}</button>
                <button data-view="close">${t('flight.close_view')}</button>
            </div>

            <div id="flight-event-log" style="position:absolute;bottom:80px;left:var(--space-md);right:var(--space-md);z-index:50;max-height:120px;overflow-y:auto;pointer-events:none">
            </div>

            <div class="flight-controls">
                <button class="btn btn-secondary" id="btn-end-flight">🛬 ${t('flight.land')}</button>
            </div>
        `;
    }

    function renderSummaryHtml() {
        if (!flightSession) return '';

        const rewards = flightSession.rewards || {};

        return `
            <div class="flight-summary">
                <h2>🏆 ${t('flight.summary_title')}</h2>

                <div class="summary-stats">
                    <div class="summary-stat">
                        <div class="stat-number">${Math.round(flightSession.totalScore)}</div>
                        <div class="stat-desc">${t('flight.total_score')}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-number">${flightSession.tricksPerformed || 0}</div>
                        <div class="stat-desc">${t('flight.tricks_performed')}</div>
                    </div>
                    <div class="summary-stat">
                        <div class="stat-number">${flightSession.elapsedMinutes || 0}m</div>
                        <div class="stat-desc">${t('flight.duration')}</div>
                    </div>
                </div>

                <div class="card glass-panel" style="margin-bottom:var(--space-lg)">
                    <div class="card-header">
                        <span class="card-title">${t('flight.rewards')}</span>
                    </div>
                    <div class="card-body">
                        <div style="display:flex;gap:var(--space-lg);justify-content:center">
                            <div style="text-align:center">
                                <span style="font-size:1.5rem">🌾</span>
                                <div style="font-weight:700;color:var(--gold-300)">+${rewards.feedMoney || 0}</div>
                            </div>
                            <div style="text-align:center">
                                <span style="font-size:1.5rem">⭐</span>
                                <div style="font-weight:700;color:var(--gold-300)">+${rewards.xp || 0} XP</div>
                            </div>
                        </div>
                    </div>
                </div>

                ${renderStatGains()}

                <div style="text-align:center">
                    <button class="btn btn-primary btn-lg" id="btn-flight-done">${t('flight.done')}</button>
                </div>
            </div>
        `;
    }

    function renderStatGains() {
        if (!flightSession || !flightSession.statGains) return '';

        const gains = flightSession.statGains;
        if (Object.keys(gains).length === 0) return '';

        let html = `<div class="card glass-panel" style="margin-bottom:var(--space-lg)">
            <div class="card-header"><span class="card-title">${t('flight.stat_gains')}</span></div>
            <div class="card-body">`;

        for (const [pigeonId, stats] of Object.entries(gains)) {
            const pigeon = window.GameState ? window.GameState.pigeons.find(p => p.id === pigeonId) : null;
            if (!pigeon) continue;
            html += `<div style="margin-bottom:8px"><strong>${pigeon.name}</strong>: `;
            const entries = Object.entries(stats).filter(([, v]) => v > 0);
            html += entries.map(([stat, val]) => `${t('stat.' + stat)} +${val.toFixed(1)}`).join(', ');
            html += `</div>`;
        }

        html += `</div></div>`;
        return html;
    }

    function bindEvents(screen) {
        // Pre-flight: pigeon selection
        screen.querySelectorAll('.flock-select-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.pigeonId;
                const idx = selectedPigeons.indexOf(id);
                if (idx >= 0) {
                    selectedPigeons.splice(idx, 1);
                } else if (selectedPigeons.length < 8) {
                    selectedPigeons.push(id);
                }
                if (window.AudioManager) window.AudioManager.play('ui_click');
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        });

        // Launch flight
        const launchBtn = screen.querySelector('#btn-launch-flight');
        if (launchBtn) {
            launchBtn.addEventListener('click', () => startFlight());
        }

        // End flight
        const endBtn = screen.querySelector('#btn-end-flight');
        if (endBtn) {
            endBtn.addEventListener('click', () => endFlight());
        }

        // Flight done
        const doneBtn = screen.querySelector('#btn-flight-done');
        if (doneBtn) {
            doneBtn.addEventListener('click', () => {
                flightPhase = 'pre';
                flightSession = null;
                selectedPigeons = [];
                if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
            });
        }
    }

    function startFlight() {
        if (selectedPigeons.length === 0) return;

        if (window.FlightSystem) {
            flightSession = window.FlightSystem.startFlight(selectedPigeons);
        } else {
            // Fallback simulation
            flightSession = {
                pigeonIds: [...selectedPigeons],
                totalScore: 0,
                tricksPerformed: 0,
                elapsedMinutes: 0,
                events: [],
                startTime: Date.now(),
                rewards: { feedMoney: 0, xp: 0 },
                statGains: {}
            };
        }

        flightPhase = 'active';
        if (window.AudioManager) {
            window.AudioManager.play('wing_clap');
        }

        // Start simulation tick
        simulateFlight();

        if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();

        // Activate canvas
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.classList.add('active');
    }

    function simulateFlight() {
        if (flightPhase !== 'active' || !flightSession) return;

        // Simulate over 10 seconds for MVP demo
        const simInterval = setInterval(() => {
            if (flightPhase !== 'active' || !flightSession) {
                clearInterval(simInterval);
                return;
            }

            flightSession.elapsedMinutes += 1;

            // Random trick events
            if (Math.random() < 0.3) {
                const pigeonId = selectedPigeons[Math.floor(Math.random() * selectedPigeons.length)];
                const pigeon = window.GameState ? window.GameState.pigeons.find(p => p.id === pigeonId) : null;

                if (pigeon && window.FlightSystem) {
                    const result = window.FlightSystem.performTrick(pigeon, 'tumble');
                    if (result && result.success) {
                        flightSession.totalScore += result.score;
                        flightSession.tricksPerformed++;

                        // Show trick notification
                        showTrickNotification(pigeon.name, result.trickName, result.score);

                        if (window.AudioManager) window.AudioManager.play('tumble_whoosh');
                    }
                } else {
                    // Fallback
                    const score = Math.round(Math.random() * 20 + 5);
                    flightSession.totalScore += score;
                    flightSession.tricksPerformed++;
                }
            }

            // Random threat (5% chance)
            if (Math.random() < 0.05) {
                if (window.AudioManager) window.AudioManager.play('hawk_cry');
            }

            // Update score display
            const scoreEl = document.querySelector('.score-value');
            if (scoreEl) scoreEl.textContent = Math.round(flightSession.totalScore);

            // Auto-end after 15 ticks
            if (flightSession.elapsedMinutes >= 15) {
                clearInterval(simInterval);
                endFlight();
            }
        }, 1500);
    }

    function showTrickNotification(pigeonName, trickName, score) {
        const container = document.getElementById('flight-event-log');
        if (!container) return;

        const entry = document.createElement('div');
        entry.style.cssText = 'color:var(--gold-300);font-size:var(--font-size-sm);font-weight:600;margin-bottom:4px;animation:screenFadeIn 0.3s ease';
        entry.textContent = `✨ ${pigeonName} → ${trickName || 'Takla'} (+${score})`;
        container.appendChild(entry);
        container.scrollTop = container.scrollHeight;
    }

    function endFlight() {
        if (!flightSession) return;

        // Calculate rewards
        const score = flightSession.totalScore;
        flightSession.rewards = {
            feedMoney: Math.round(score * 3 + 100),
            xp: Math.round(score * 0.5 + 20)
        };

        // Apply rewards
        if (window.EconomySystem) {
            window.EconomySystem.addCurrency('feedMoney', flightSession.rewards.feedMoney);
        }

        // Apply stat gains via training
        flightSession.statGains = {};
        if (window.TrainingSystem && window.GameState) {
            selectedPigeons.forEach(pid => {
                const pigeon = window.GameState.pigeons.find(p => p.id === pid);
                if (pigeon) {
                    const gains = window.TrainingSystem.trainPigeon(pigeon, 'basicFlight');
                    if (gains) flightSession.statGains[pid] = gains;
                }
            });
        }

        flightPhase = 'summary';

        if (window.AudioManager) {
            window.AudioManager.play('landing');
            window.AudioManager.play('coin');
        }

        // Hide canvas
        const canvas = document.getElementById('game-canvas');
        if (canvas) canvas.classList.remove('active');

        if (window.ScreenManager) window.ScreenManager.refreshCurrentScreen();
    }

    return { render };
})();
