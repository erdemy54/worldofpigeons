/**
 * World of Pigeon's - Save Manager
 * Persists game state to localStorage with versioning.
 * Uses window.SaveManager global.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'wop_savegame';
  var SAVE_VERSION = 1;

  /**
   * Serialize and save the current game state.
   * @param {Object} state - The complete game state object.
   * @returns {boolean} true on success, false on failure.
   */
  function save(state) {
    try {
      var wrapper = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        data: state
      };
      var json = JSON.stringify(wrapper);
      localStorage.setItem(STORAGE_KEY, json);

      // Emit event if EventBus available
      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.GAME_SAVE) || 'game:save',
          { timestamp: wrapper.timestamp }
        );
      }

      return true;
    } catch (err) {
      console.error('[SaveManager] Save failed:', err);
      return false;
    }
  }

  /**
   * Load and deserialize the saved game state.
   * Returns null if no save exists or data is corrupt.
   * @returns {Object|null} The saved game state data, or null.
   */
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      var wrapper = JSON.parse(raw);

      // Version check & migration
      if (!wrapper || typeof wrapper.version !== 'number') {
        console.warn('[SaveManager] Invalid save format, discarding.');
        return null;
      }

      if (wrapper.version < SAVE_VERSION) {
        wrapper = migrate(wrapper);
      }

      // Emit event if EventBus available
      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.GAME_LOAD) || 'game:load',
          { timestamp: wrapper.timestamp, version: wrapper.version }
        );
      }

      return wrapper.data;
    } catch (err) {
      console.error('[SaveManager] Load failed:', err);
      return null;
    }
  }

  /**
   * Delete the saved game from storage.
   * @returns {boolean} true on success.
   */
  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);

      if (window.EventBus && window.EventBus.emit) {
        window.EventBus.emit(
          (window.EventBus.Events && window.EventBus.Events.GAME_RESET) || 'game:reset'
        );
      }

      return true;
    } catch (err) {
      console.error('[SaveManager] Reset failed:', err);
      return false;
    }
  }

  /**
   * Check whether a save game exists.
   * @returns {boolean}
   */
  function exists() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (err) {
      return false;
    }
  }

  /**
   * Get metadata about the current save without loading full state.
   * @returns {{version: number, timestamp: number, date: string}|null}
   */
  function getMeta() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var wrapper = JSON.parse(raw);
      return {
        version: wrapper.version,
        timestamp: wrapper.timestamp,
        date: new Date(wrapper.timestamp).toLocaleString()
      };
    } catch (err) {
      return null;
    }
  }

  /**
   * Export the raw save string (for backup / sharing).
   * @returns {string|null}
   */
  function exportSave() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return btoa(raw);
    } catch (err) {
      console.error('[SaveManager] Export failed:', err);
      return null;
    }
  }

  /**
   * Import a previously exported save string.
   * @param {string} encoded - Base64 encoded save string.
   * @returns {boolean} true on success.
   */
  function importSave(encoded) {
    try {
      var raw = atob(encoded);
      var wrapper = JSON.parse(raw); // validate JSON
      if (!wrapper || typeof wrapper.version !== 'number' || !wrapper.data) {
        console.warn('[SaveManager] Import data invalid.');
        return false;
      }
      localStorage.setItem(STORAGE_KEY, raw);
      return true;
    } catch (err) {
      console.error('[SaveManager] Import failed:', err);
      return false;
    }
  }

  /**
   * Migrate a save from an older version to the current version.
   * Add migration steps here as the save format evolves.
   * @param {Object} wrapper - The save wrapper with version, timestamp, data.
   * @returns {Object} Migrated wrapper at current SAVE_VERSION.
   */
  function migrate(wrapper) {
    var ver = wrapper.version;

    // Example migration pattern (no migrations needed yet for v1):
    // if (ver < 2) {
    //   wrapper.data.newField = defaultValue;
    //   ver = 2;
    // }

    wrapper.version = SAVE_VERSION;
    console.log('[SaveManager] Migrated save from v' + ver + ' to v' + SAVE_VERSION);
    return wrapper;
  }

  /**
   * Get the current save version.
   * @returns {number}
   */
  function getVersion() {
    return SAVE_VERSION;
  }

  /* ── Public API ── */
  window.SaveManager = {
    save: save,
    load: load,
    reset: reset,
    exists: exists,
    getMeta: getMeta,
    exportSave: exportSave,
    importSave: importSave,
    getVersion: getVersion
  };
})();
