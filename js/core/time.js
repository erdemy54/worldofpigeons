/**
 * World of Pigeon's - Time Manager
 * Handles game time: 1 game-day = 10 real minutes.
 * Day/night phases, timer system, offline progress.
 * Uses window.TimeManager global.
 */
(function () {
  'use strict';

  /* ── Constants ── */
  var REAL_MS_PER_GAME_DAY = 10 * 60 * 1000;  // 10 real minutes = 1 game day
  var GAME_HOURS_PER_DAY = 24;
  var REAL_MS_PER_GAME_HOUR = REAL_MS_PER_GAME_DAY / GAME_HOURS_PER_DAY;
  var TICK_INTERVAL_MS = 1000; // update every real second
  var MAX_OFFLINE_DAYS = 7;    // cap offline progress at 7 game days

  /* ── Day Phases ── */
  var PHASES = {
    DAWN: 'dawn',       // 05:00 - 07:00
    MORNING: 'morning', // 07:00 - 12:00
    AFTERNOON: 'afternoon', // 12:00 - 17:00
    DUSK: 'dusk',       // 17:00 - 19:00
    EVENING: 'evening', // 19:00 - 22:00
    NIGHT: 'night'      // 22:00 - 05:00
  };

  /* ── State ── */
  var state = {
    gameDay: 1,
    gameHour: 6.0,       // fractional hour (6.5 = 06:30)
    phase: PHASES.DAWN,
    running: false,
    speed: 1,            // time multiplier (1x, 2x, 3x)
    lastRealTime: 0,     // real timestamp of last update (ms)
    totalElapsedDays: 0  // lifetime counter
  };

  var tickIntervalId = null;

  /* ── Timers ── */
  var timers = {};
  var timerIdCounter = 0;

  /* ── Phase Boundaries ── */
  function getPhase(hour) {
    if (hour >= 5 && hour < 7)   return PHASES.DAWN;
    if (hour >= 7 && hour < 12)  return PHASES.MORNING;
    if (hour >= 12 && hour < 17) return PHASES.AFTERNOON;
    if (hour >= 17 && hour < 19) return PHASES.DUSK;
    if (hour >= 19 && hour < 22) return PHASES.EVENING;
    return PHASES.NIGHT;
  }

  function isDaytime(hour) {
    return hour >= 6 && hour < 20;
  }

  /* ── Core Tick ── */
  function tick() {
    if (!state.running) return;

    var now = Date.now();
    var realDelta = now - state.lastRealTime;
    state.lastRealTime = now;

    // Convert real delta to game hours, applying speed multiplier
    var gameHoursDelta = (realDelta / REAL_MS_PER_GAME_HOUR) * state.speed;

    advanceTime(gameHoursDelta);
  }

  /**
   * Advance game time by a given number of game hours.
   * Handles day rollovers and phase transitions.
   */
  function advanceTime(gameHours) {
    var previousHour = state.gameHour;
    var previousDay = state.gameDay;
    var previousPhase = state.phase;

    state.gameHour += gameHours;

    // Handle day rollover(s)
    while (state.gameHour >= 24) {
      state.gameHour -= 24;
      state.gameDay += 1;
      state.totalElapsedDays += 1;

      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.GAME_DAY_CHANGE) || 'game:dayChange',
          { day: state.gameDay, totalDays: state.totalElapsedDays }
        );
      }
    }

    // Update phase
    state.phase = getPhase(state.gameHour);
    if (state.phase !== previousPhase) {
      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.GAME_PHASE_CHANGE) || 'game:phaseChange',
          { phase: state.phase, previousPhase: previousPhase, hour: state.gameHour }
        );
      }
    }

    // Process timers
    updateTimers(gameHours);

    // Emit tick event
    if (window.EventBus && window.EventBus.emit) {
      window.EventBus.emit(
        (window.EventBus.Events && window.EventBus.Events.GAME_TICK) || 'game:tick',
        {
          gameDay: state.gameDay,
          gameHour: state.gameHour,
          phase: state.phase,
          isDaytime: isDaytime(state.gameHour)
        }
      );
    }
  }

  /* ── Timer System ── */

  /**
   * Create a new timer that fires after a specified number of game hours.
   * @param {number} durationHours - Game hours until timer fires.
   * @param {Function} callback - Function to call when timer completes.
   * @param {boolean} [repeat=false] - If true, the timer repeats.
   * @returns {number} Timer ID.
   */
  function addTimer(durationHours, callback, repeat) {
    var id = ++timerIdCounter;
    timers[id] = {
      id: id,
      remaining: durationHours,
      duration: durationHours,
      callback: callback,
      repeat: !!repeat,
      paused: false
    };
    return id;
  }

  /**
   * Remove a timer by ID.
   * @param {number} id
   * @returns {boolean}
   */
  function removeTimer(id) {
    if (timers[id]) {
      delete timers[id];
      return true;
    }
    return false;
  }

  /**
   * Pause a specific timer.
   * @param {number} id
   */
  function pauseTimer(id) {
    if (timers[id]) timers[id].paused = true;
  }

  /**
   * Resume a specific timer.
   * @param {number} id
   */
  function resumeTimer(id) {
    if (timers[id]) timers[id].paused = false;
  }

  /**
   * Get info about a timer.
   * @param {number} id
   * @returns {Object|null}
   */
  function getTimer(id) {
    var t = timers[id];
    if (!t) return null;
    return {
      id: t.id,
      remaining: t.remaining,
      duration: t.duration,
      progress: 1 - (t.remaining / t.duration),
      paused: t.paused
    };
  }

  /**
   * Advance all active timers by the given game hours.
   */
  function updateTimers(gameHours) {
    var ids = Object.keys(timers);
    for (var i = 0; i < ids.length; i++) {
      var timer = timers[ids[i]];
      if (!timer || timer.paused) continue;

      timer.remaining -= gameHours;

      if (timer.remaining <= 0) {
        try {
          timer.callback({ timerId: timer.id });
        } catch (err) {
          console.error('[TimeManager] Timer callback error:', err);
        }

        if (timer.repeat) {
          timer.remaining = timer.duration + timer.remaining; // carry over excess
        } else {
          delete timers[timer.id];
        }
      }
    }
  }

  /* ── Offline Progress ── */

  /**
   * Calculate and apply offline progress since last session.
   * @param {number} lastTimestamp - Real-world timestamp (ms) of last save.
   * @returns {Object} Summary of offline progress { realMinutes, gameDays, gameHours, capped }.
   */
  function calculateOfflineProgress(lastTimestamp) {
    if (!lastTimestamp) return { realMinutes: 0, gameDays: 0, gameHours: 0, capped: false };

    var now = Date.now();
    var realDelta = now - lastTimestamp;
    if (realDelta < 0) realDelta = 0;

    var realMinutes = realDelta / 60000;
    var gameDays = realDelta / REAL_MS_PER_GAME_DAY;
    var capped = false;

    if (gameDays > MAX_OFFLINE_DAYS) {
      gameDays = MAX_OFFLINE_DAYS;
      capped = true;
    }

    var gameHours = gameDays * GAME_HOURS_PER_DAY;

    return {
      realMinutes: Math.round(realMinutes * 10) / 10,
      gameDays: Math.round(gameDays * 100) / 100,
      gameHours: Math.round(gameHours * 10) / 10,
      capped: capped
    };
  }

  /**
   * Apply offline progress to the time state.
   * @param {number} lastTimestamp
   * @returns {Object} The offline progress summary.
   */
  function applyOfflineProgress(lastTimestamp) {
    var progress = calculateOfflineProgress(lastTimestamp);

    if (progress.gameHours > 0) {
      advanceTime(progress.gameHours);

      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.OFFLINE_PROGRESS) || 'system:offlineProgress',
          progress
        );
      }
    }

    return progress;
  }

  /* ── Control Methods ── */

  /**
   * Start the time system.
   * @param {Object} [savedState] - Previously saved time state to restore.
   */
  function start(savedState) {
    if (savedState) {
      state.gameDay = savedState.gameDay || 1;
      state.gameHour = savedState.gameHour || 6.0;
      state.totalElapsedDays = savedState.totalElapsedDays || 0;
      state.speed = savedState.speed || 1;
      state.phase = getPhase(state.gameHour);
    }

    state.lastRealTime = Date.now();
    state.running = true;

    if (tickIntervalId) clearInterval(tickIntervalId);
    tickIntervalId = setInterval(tick, TICK_INTERVAL_MS);
  }

  /**
   * Stop the time system.
   */
  function stop() {
    state.running = false;
    if (tickIntervalId) {
      clearInterval(tickIntervalId);
      tickIntervalId = null;
    }
  }

  /**
   * Pause time progression.
   */
  function pause() {
    state.running = false;
    if (window.EventBus && window.EventBus.emit) {
      window.EventBus.emit(
        (window.EventBus.Events && window.EventBus.Events.GAME_PAUSE) || 'game:pause'
      );
    }
  }

  /**
   * Resume time progression.
   */
  function resume() {
    state.lastRealTime = Date.now();
    state.running = true;
    if (window.EventBus && window.EventBus.emit) {
      window.EventBus.emit(
        (window.EventBus.Events && window.EventBus.Events.GAME_RESUME) || 'game:resume'
      );
    }
  }

  /**
   * Set time speed multiplier.
   * @param {number} multiplier - 1, 2, or 3.
   */
  function setSpeed(multiplier) {
    state.speed = Math.max(1, Math.min(3, multiplier));
  }

  /**
   * Get a snapshot of the current time state for saving.
   * @returns {Object}
   */
  function getState() {
    return {
      gameDay: state.gameDay,
      gameHour: state.gameHour,
      phase: state.phase,
      totalElapsedDays: state.totalElapsedDays,
      speed: state.speed,
      lastRealTime: Date.now()
    };
  }

  /**
   * Get a formatted time string HH:MM for display.
   * @returns {string}
   */
  function getFormattedTime() {
    var h = Math.floor(state.gameHour);
    var m = Math.floor((state.gameHour - h) * 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  /**
   * Get a formatted day string "Day N" for display.
   * @returns {string}
   */
  function getFormattedDay() {
    return (window.I18n ? window.I18n.t('time.day') : 'Day') + ' ' + state.gameDay;
  }

  /* ── Public API ── */
  window.TimeManager = {
    start: start,
    stop: stop,
    pause: pause,
    resume: resume,
    setSpeed: setSpeed,
    getState: getState,
    getFormattedTime: getFormattedTime,
    getFormattedDay: getFormattedDay,
    calculateOfflineProgress: calculateOfflineProgress,
    applyOfflineProgress: applyOfflineProgress,

    // Timer sub-system
    addTimer: addTimer,
    removeTimer: removeTimer,
    pauseTimer: pauseTimer,
    resumeTimer: resumeTimer,
    getTimer: getTimer,

    // Direct accessors (read-only recommended)
    get gameDay() { return state.gameDay; },
    get gameHour() { return state.gameHour; },
    get phase() { return state.phase; },
    get isRunning() { return state.running; },
    get speed() { return state.speed; },
    get isDaytime() { return isDaytime(state.gameHour); },

    // Constants
    PHASES: PHASES,
    REAL_MS_PER_GAME_DAY: REAL_MS_PER_GAME_DAY,
    MAX_OFFLINE_DAYS: MAX_OFFLINE_DAYS
  };
})();
