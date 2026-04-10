/**
 * Utilidades matemáticas generales para CapiChef.
 *
 * Funciones puras de propósito general: clamp, random, shuffle.
 * No importa desde src/state ni src/components.
 */

/**
 * Restringe un valor numérico entre un mínimo y un máximo.
 *
 * @param {number} value - Valor a restringir
 * @param {number} min - Límite inferior (inclusive)
 * @param {number} max - Límite superior (inclusive)
 * @returns {number} Valor restringido al rango [min, max]
 * @example
 * clamp(5, 0, 10)   // 5
 * clamp(-3, 0, 10)  // 0
 * clamp(15, 0, 10)  // 10
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Genera un entero aleatorio entre min y max (ambos inclusivos).
 *
 * @param {number} min - Límite inferior (inclusive)
 * @param {number} max - Límite superior (inclusive)
 * @returns {number} Entero aleatorio en el rango [min, max]
 * @example
 * randomInt(1, 10) // un número entre 1 y 10
 * randomInt(0, 0)  // 0
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fisher-Yates shuffle. Retorna un nuevo array mezclado sin mutar el original.
 *
 * @template T
 * @param {T[]} arr - Array a mezclar
 * @returns {T[]} Nuevo array con los elementos en orden aleatorio
 * @example
 * shuffleArray([1, 2, 3, 4]) // [3, 1, 4, 2] (orden aleatorio)
 */
export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
