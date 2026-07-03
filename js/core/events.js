/**
 * World of Pigeon's - Event Bus
 * Lightweight pub/sub system with named event constants.
 * Uses window.EventBus global.
 */
(function () {
  'use strict';

  /** @type {Object.<string, Array<{fn: Function, once: boolean}>>} */
  var listeners = {};

  /**
   * Subscribe to an event.
   * @param {string} event  - Event name (use EventBus.Events constants).
   * @param {Function} fn   - Callback function.
   * @returns {Function} Unsubscribe function for convenience.
   */
  function on(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push({ fn: fn, once: false });
    return function () { off(event, fn); };
  }

  /**
   * Subscribe to an event for a single firing only.
   * @param {string} event
   * @param {Function} fn
   * @returns {Function} Unsubscribe function.
   */
  function once(event, fn) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push({ fn: fn, once: true });
    return function () { off(event, fn); };
  }

  /**
   * Unsubscribe a specific callback from an event.
   * @param {string} event
   * @param {Function} fn
   */
  function off(event, fn) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(function (entry) {
      return entry.fn !== fn;
    });
    if (listeners[event].length === 0) delete listeners[event];
  }

  /**
   * Emit an event, calling all registered listeners.
   * @param {string} event
   * @param {...*} args - Arguments forwarded to each listener.
   */
  function emit(event) {
    if (!listeners[event]) return;
    var args = Array.prototype.slice.call(arguments, 1);
    // Copy array so removals during iteration are safe
    var entries = listeners[event].slice();
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      try {
        entry.fn.apply(null, args);
      } catch (err) {
        console.error('[EventBus] Error in listener for "' + event + '":', err);
      }
      if (entry.once) {
        off(event, entry.fn);
      }
    }
  }

  /**
   * Remove ALL listeners, optionally for a specific event only.
   * @param {string} [event] - If omitted, clears everything.
   */
  function clear(event) {
    if (event) {
      delete listeners[event];
    } else {
      listeners = {};
    }
  }

  /* ── Event Name Constants ── */
  var Events = {
    // Game Lifecycle
    GAME_INIT: 'game:init',
    GAME_READY: 'game:ready',
    GAME_PAUSE: 'game:pause',
    GAME_RESUME: 'game:resume',
    GAME_SAVE: 'game:save',
    GAME_LOAD: 'game:load',
    GAME_RESET: 'game:reset',
    GAME_TICK: 'game:tick',
    GAME_DAY_CHANGE: 'game:dayChange',
    GAME_PHASE_CHANGE: 'game:phaseChange',

    // Pigeon Actions
    PIGEON_FEED: 'pigeon:feed',
    PIGEON_TRAIN: 'pigeon:train',
    PIGEON_HEAL: 'pigeon:heal',
    PIGEON_LEVEL_UP: 'pigeon:levelUp',
    PIGEON_TRICK_LEARNED: 'pigeon:trickLearned',
    PIGEON_STAGE_CHANGE: 'pigeon:stageChange',
    PIGEON_SICK: 'pigeon:sick',
    PIGEON_RECOVERED: 'pigeon:recovered',
    PIGEON_DIED: 'pigeon:died',
    PIGEON_RENAME: 'pigeon:rename',
    PIGEON_RELEASE: 'pigeon:release',
    PIGEON_SELECTED: 'pigeon:selected',

    // Flight
    FLIGHT_START: 'flight:start',
    FLIGHT_END: 'flight:end',
    FLIGHT_TRICK: 'flight:trick',
    FLIGHT_THREAT: 'flight:threat',
    FLIGHT_LAND: 'flight:land',

    // Breeding
    BREEDING_START: 'breeding:start',
    BREEDING_COMPLETE: 'breeding:complete',
    EGG_LAID: 'breeding:eggLaid',
    EGG_HATCHED: 'breeding:eggHatched',
    MUTATION_OCCURRED: 'breeding:mutation',

    // Economy
    CURRENCY_CHANGED: 'economy:currencyChanged',
    ITEM_PURCHASED: 'economy:itemPurchased',
    ITEM_SOLD: 'economy:itemSold',
    MARKET_REFRESH: 'economy:marketRefresh',

    // Quests
    QUEST_STARTED: 'quest:started',
    QUEST_PROGRESS: 'quest:progress',
    QUEST_COMPLETED: 'quest:completed',
    QUEST_REWARD_CLAIMED: 'quest:rewardClaimed',
    QUEST_EXPIRED: 'quest:expired',

    // Competitions
    COMPETITION_ENTER: 'competition:enter',
    COMPETITION_START: 'competition:start',
    COMPETITION_RESULT: 'competition:result',
    COMPETITION_REWARD: 'competition:reward',

    // UI
    UI_SCREEN_CHANGE: 'ui:screenChange',
    UI_MODAL_OPEN: 'ui:modalOpen',
    UI_MODAL_CLOSE: 'ui:modalClose',
    UI_TOAST: 'ui:toast',
    UI_TUTORIAL_STEP: 'ui:tutorialStep',
    UI_THEME_CHANGE: 'ui:themeChange',

    // System
    LANGUAGE_CHANGED: 'system:languageChanged',
    AUDIO_TOGGLE: 'system:audioToggle',
    OFFLINE_PROGRESS: 'system:offlineProgress',
    SETTINGS_CHANGED: 'system:settingsChanged',
    ACHIEVEMENT_UNLOCKED: 'system:achievementUnlocked',
    NOTIFICATION: 'system:notification',

    // Coop
    COOP_UPGRADED: 'coop:upgraded',
    COOP_CLEANED: 'coop:cleaned',
    COOP_FEED_ALL: 'coop:feedAll',

    // Threats
    THREAT_APPEARED: 'threat:appeared',
    THREAT_RESOLVED: 'threat:resolved',
    THREAT_DAMAGE: 'threat:damage'
  };

  /* ── Public API ── */
  window.EventBus = {
    on: on,
    off: off,
    emit: emit,
    once: once,
    clear: clear,
    Events: Events
  };
})();
