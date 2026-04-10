/**
 * Configuration module for CapiChef.
 *
 * Higher-level API over storageService for managing game configuration.
 * Handles defaults, loading, saving, and resetting config,
 * plus difficulty-derived helpers (max errors, math timer).
 *
 * @module config
 */

import { loadConfig as storageLoadConfig, saveConfig as storageSaveConfig } from '../services/storageService.js';
import { DEFAULT_CONFIG } from './appReducer.js';
import { ERROR_THRESHOLD_BY_DIFFICULTY, MATH_TIMER_SECONDS, MATH_TIMER_SPEEDRUN_SECONDS } from '../constants/gameConstants.js';

// Versión del esquema de config — incrementar cuando cambien los defaults
const CONFIG_VERSION = 2;

/**
 * Load game configuration from localStorage, falling back to DEFAULT_CONFIG.
 * Si la versión guardada es anterior, se aplican los nuevos defaults sobre lo guardado.
 */
export function loadConfig() {
  const stored = storageLoadConfig();
  if (stored && typeof stored === 'object') {
    // Si la versión es vieja o no existe, resetear a defaults (preservando cambios explícitos del usuario)
    if (!stored._version || stored._version < CONFIG_VERSION) {
      const migrated = { ...DEFAULT_CONFIG, ...stored, _version: CONFIG_VERSION };
      // Para campos que cambiaron de default, solo aplicar el nuevo default si el usuario
      // nunca lo cambió explícitamente (no podemos saberlo, así que reseteamos a defaults)
      migrated.difficulty = DEFAULT_CONFIG.difficulty;
      migrated.mathTimerSeconds = DEFAULT_CONFIG.mathTimerSeconds;
      storageSaveConfig(migrated);
      return migrated;
    }
    return { ...DEFAULT_CONFIG, ...stored };
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Save game configuration to localStorage via storageService.
 *
 * @param {{ difficulty: string, mathFocus: string, textLarge: boolean, highContrast: boolean, reducedAnimations: boolean }} config
 */
export function saveConfig(config) {
  storageSaveConfig(config);
}

/**
 * Reset configuration to DEFAULT_CONFIG, persist it, and return the defaults.
 *
 * @returns {{ difficulty: string, mathFocus: string, textLarge: boolean, highContrast: boolean, reducedAnimations: boolean }}
 */
export function resetConfig() {
  const defaults = { ...DEFAULT_CONFIG };
  storageSaveConfig(defaults);
  return defaults;
}

/**
 * Get the maximum number of errors allowed before losing a life,
 * based on the selected difficulty.
 *
 * @param {'easy' | 'normal' | 'hard'} difficulty
 * @returns {number} 4 for easy, 3 for normal, 2 for hard
 */
export function getMaxErrors(difficulty) {
  return ERROR_THRESHOLD_BY_DIFFICULTY[difficulty] ?? ERROR_THRESHOLD_BY_DIFFICULTY.normal;
}

/**
 * Get the math challenge timer duration in seconds for the given game mode.
 *
 * @param {'classic' | 'practice' | 'speedrun'} gameMode
 * @returns {number} 10 for normal modes, 7 for speedrun
 */
export function getMathTimerSeconds(gameMode) {
  return gameMode === 'speedrun' ? MATH_TIMER_SPEEDRUN_SECONDS : MATH_TIMER_SECONDS;
}
