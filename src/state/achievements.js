/**
 * Evaluación de logros de CapiChef.
 *
 * Importa las definiciones de logros desde constants/achievementDefinitions.js
 * y evalúa las condiciones de desbloqueo contra el estado actual del juego
 * y el perfil del jugador.
 *
 * @module achievements
 */

import { ACHIEVEMENT_DEFINITIONS } from '../constants/achievementDefinitions.js';

/**
 * Mapa de condiciones de evaluación por achievement ID.
 * Cada función recibe (gameState, profile) y retorna true si la condición se cumple.
 *
 * @type {Record<string, (gameState: object, profile: object) => boolean>}
 */
const ACHIEVEMENT_CONDITIONS = {
  /** Completar tu primer nivel — dishesCompleted >= 1 */
  first_dish: (gs) => gs.dishesCompleted >= 1,

  /** Completar un nivel sin errores (en pantalla levelComplete) */
  perfectionist: (gs) => gs.errorsInCurrentDish === 0 && gs.screen === 'levelComplete',

  /** Alcanzar combo x3 */
  combo_3: (gs) => gs.combo >= 3,

  /** Alcanzar combo x6 */
  combo_6: (gs) => gs.combo >= 6,

  /** Alcanzar combo x10 */
  combo_10: (gs) => gs.combo >= 10,

  /** Responder 5 desafíos matemáticos correctamente en una partida */
  math_5: (gs) => gs.mathChallengesCorrect >= 5,

  /** Responder 10 desafíos matemáticos correctamente en una partida */
  math_10: (gs) => gs.mathChallengesCorrect >= 10,

  /** Llegar al nivel 6 */
  night_cook: (gs) => gs.level >= 6,

  /** Llegar al nivel 11 */
  sea_chef: (gs) => gs.level >= 11,

  /** Llegar al nivel 16 */
  space_chef: (gs) => gs.level >= 16,

  /** Acumular 1000 monedas en total histórico */
  millionaire: (_gs, profile) => profile.stats.totalCoins >= 1000,

  /** Completar 50 platos en total histórico */
  master_chef: (_gs, profile) => profile.stats.totalDishes >= 50,
};

/**
 * Evalúa todos los logros y retorna los IDs de los recién desbloqueados.
 *
 * Compara las condiciones de cada logro contra el estado actual del juego
 * y el perfil del jugador. Solo retorna logros que no estén ya en
 * `profile.unlockedAchievements`.
 *
 * @param {object} gameState - Estado actual del juego (gameReducer)
 * @param {object} profile - Perfil del jugador (appState.profile)
 * @returns {string[]} Array de achievement IDs recién desbloqueados
 */
export function evaluateAchievements(gameState, profile) {
  const unlocked = profile.unlockedAchievements || [];
  const newlyUnlocked = [];

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    // Skip already unlocked
    if (unlocked.includes(def.id)) continue;

    const condition = ACHIEVEMENT_CONDITIONS[def.id];
    if (condition && condition(gameState, profile)) {
      newlyUnlocked.push(def.id);
    }
  }

  return newlyUnlocked;
}
