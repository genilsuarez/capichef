/**
 * Constantes globales del juego CapiChef.
 *
 * Valores inmutables que definen las reglas base del juego:
 * vidas, errores, combo, temas visuales y timer.
 *
 * @module gameConstants
 */

/** Vidas al iniciar una nueva partida */
export const INITIAL_LIVES = 3;

/** Máximo de vidas que el jugador puede tener */
export const MAX_LIVES = 3;

/**
 * Umbral de errores antes de perder vida, según dificultad.
 * @type {Readonly<{ easy: number, normal: number, hard: number }>}
 */
export const ERROR_THRESHOLD_BY_DIFFICULTY = Object.freeze({
  easy: 4,
  normal: 3,
  hard: 2,
});

/**
 * Hitos de combo que disparan mensajes especiales.
 * Cada entrada tiene el combo requerido, el emoji y el mensaje.
 * @type {ReadonlyArray<{ combo: number, emoji: string, message: string }>}
 */
export const COMBO_MILESTONES = Object.freeze([
  { combo: 3, emoji: '🔥', message: '¡Combo x3!' },
  { combo: 6, emoji: '⚡', message: '¡Imparable!' },
  { combo: 10, emoji: '👑', message: '¡Leyenda!' },
]);

/**
 * Multiplicadores de combo según la racha actual.
 * @type {ReadonlyArray<{ minCombo: number, maxCombo: number, multiplier: number }>}
 */
export const COMBO_MULTIPLIERS = Object.freeze([
  { minCombo: 0, maxCombo: 1, multiplier: 1.0 },
  { minCombo: 2, maxCombo: 3, multiplier: 1.5 },
  { minCombo: 4, maxCombo: 5, multiplier: 2.0 },
  { minCombo: 6, maxCombo: Infinity, multiplier: 3.0 },
]);

/**
 * Umbrales de nivel para cambio de tema visual.
 * @type {ReadonlyArray<{ maxLevel: number, theme: string }>}
 */
export const THEME_THRESHOLDS = Object.freeze([
  { maxLevel: 5, theme: 'day' },
  { maxLevel: 10, theme: 'night' },
  { maxLevel: 15, theme: 'underwater' },
  { maxLevel: Infinity, theme: 'space' },
]);

/** Intervalo del timer en milisegundos (100ms = décimas de segundo) */
export const TIMER_INTERVAL_MS = 100;

/** Monedas base por nivel: 10 × nivel */
export const COINS_BASE_MULTIPLIER = 10;

/** Bonus de velocidad: 50% de monedas base si tiempo usado < 50% del total */
export const SPEED_BONUS_RATE = 0.5;

/** Bonus perfecto: 20% de monedas base si 0 errores */
export const PERFECT_BONUS_RATE = 0.2;

/** Bonus por respuesta matemática correcta: 5 × nivel */
export const MATH_BONUS_MULTIPLIER = 5;

/** Cada cuántos niveles se recupera 1 vida */
export const LIFE_RECOVERY_INTERVAL = 5;

/** Debounce visual de ingredientes en ms */
export const INGREDIENT_DEBOUNCE_MS = 200;

/** Timer del desafío matemático en segundos (modo normal) */
export const MATH_TIMER_SECONDS = 20;

/** Timer del desafío matemático en modo speedrun */
export const MATH_TIMER_SPEEDRUN_SECONDS = 15;

/** Segundos antes de mostrar botón "Continuar" en desafío matemático */
export const MATH_SKIP_DELAY_SECONDS = 5;

/** Penalización en segundos por error/timeout en modo speedrun */
export const SPEEDRUN_PENALTY_SECONDS = 3;

/** Tiempo mínimo de un nivel en segundos */
export const MIN_LEVEL_TIME_SECONDS = 5;

/** Ajuste de timer por dificultad en segundos */
export const DIFFICULTY_TIMER_ADJUSTMENT = Object.freeze({
  easy: 5,
  normal: 0,
  hard: -2,
});

/** Tiempo fijo para niveles 6+ en segundos */
export const RANDOM_RECIPE_TIME_SECONDS = 10;

/** Número de ingredientes en el panel */
export const PANEL_INGREDIENT_COUNT = 10;
