/**
 * Storage Service for CapiChef
 *
 * Único módulo que accede a localStorage directamente.
 * Todas las funciones usan try/catch y nunca lanzan excepciones.
 * Retornan null/undefined en caso de error.
 *
 * Claves de localStorage:
 * - capichef_config: GameConfig
 * - capichef_profile: PlayerProfile
 * - capichef_history: GameHistoryEntry[] (máx 5)
 * - capichef_session: { highScore, bestLevel } — persiste entre recargas
 * - capichef_schema_version: number
 */

const SCHEMA_VERSION = 1;

const KEYS = {
  config: 'capichef_config',
  profile: 'capichef_profile',
  history: 'capichef_history',
  session: 'capichef_session',
  schemaVersion: 'capichef_schema_version',
};

/**
 * Safely parse JSON from localStorage.
 * @param {string} key - localStorage key
 * @returns {any|null} Parsed value or null on error
 */
function safeLoad(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // silent
    }
    return null;
  }
}

/**
 * Safely write JSON to localStorage.
 * @param {string} key - localStorage key
 * @param {any} value - Value to serialize
 */
function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silent — localStorage may be full or disabled
  }
}

/**
 * Load game configuration from localStorage.
 * @returns {object|null} GameConfig or null if not found/error
 */
export function loadConfig() {
  return safeLoad(KEYS.config);
}

/**
 * Save game configuration to localStorage.
 * @param {object} config - GameConfig to persist
 */
export function saveConfig(config) {
  safeSave(KEYS.config, config);
}

/**
 * Load player profile from localStorage.
 * @returns {object|null} PlayerProfile or null if not found/error
 */
export function loadProfile() {
  return safeLoad(KEYS.profile);
}

/**
 * Save player profile to localStorage.
 * @param {object} profile - PlayerProfile to persist
 */
export function saveProfile(profile) {
  safeSave(KEYS.profile, profile);
}

/**
 * Load game history from localStorage.
 * @returns {Array} Array of GameHistoryEntry (empty array if not found/error)
 */
export function loadHistory() {
  const data = safeLoad(KEYS.history);
  return Array.isArray(data) ? data : [];
}

/**
 * Save game history to localStorage.
 * @param {Array} history - Array of GameHistoryEntry
 */
export function saveHistory(history) {
  safeSave(KEYS.history, history);
}

/**
 * Add a single history entry, keeping max 10 entries (most recent first).
 * @param {object} entry - GameHistoryEntry to add
 */
export function addHistoryEntry(entry) {
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, 10);
  saveHistory(updated);
}

/**
 * Load the stored schema version.
 * @returns {number} Schema version (0 if not found)
 */
export function loadSchemaVersion() {
  const version = safeLoad(KEYS.schemaVersion);
  return typeof version === 'number' ? version : 0;
}

/**
 * Load session data (highScore, bestLevel) from localStorage.
 * @returns {{ highScore: number, bestLevel: number }}
 */
export function loadSession() {
  const data = safeLoad(KEYS.session);
  return {
    highScore: (data && typeof data.highScore === 'number') ? data.highScore : 0,
    bestLevel: (data && typeof data.bestLevel === 'number') ? data.bestLevel : 0,
  };
}

/**
 * Save session data (highScore, bestLevel) to localStorage.
 * @param {{ highScore: number, bestLevel: number }} session
 */
export function saveSession(session) {
  safeSave(KEYS.session, session);
}

/**
 * Clear all CapiChef data from localStorage.
 */
export function clearAll() {
  try {
    Object.values(KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch {
    // silent
  }
}

/**
 * Run automatic migrations if the stored schema version is behind SCHEMA_VERSION.
 * Currently SCHEMA_VERSION=1, so this initializes the version if missing.
 * Future migrations can be added as version checks.
 */
export function migrateIfNeeded() {
  try {
    const storedVersion = loadSchemaVersion();

    if (storedVersion >= SCHEMA_VERSION) return;

    // Migration from 0 → 1: just set the version marker
    // (initial schema, no data transformations needed)

    safeSave(KEYS.schemaVersion, SCHEMA_VERSION);
  } catch {
    // If migration fails, log and continue — game works without persistence
    console.warn('[CapiChef] Schema migration failed, continuing with defaults.');
  }
}
