/**
 * Utilidades de timer para CapiChef.
 *
 * Funciones puras para cálculo de color del timer y formateo de tiempo.
 * No importa desde src/state ni src/components.
 */

/**
 * Retorna el color hexadecimal del timer según el porcentaje de tiempo restante.
 *
 * - Verde (#22c55e) si queda más del 50% del tiempo
 * - Amarillo (#eab308) si queda entre 25% y 50% (inclusive)
 * - Rojo (#ef4444) si queda menos del 25%
 *
 * @param {number} remaining - Tiempo restante (décimas de segundo)
 * @param {number} total - Tiempo total (décimas de segundo)
 * @returns {string} Color hexadecimal del timer
 * @example
 * getTimerColor(80, 100) // '#22c55e' (80% restante → verde)
 * getTimerColor(50, 100) // '#eab308' (50% restante → amarillo)
 * getTimerColor(20, 100) // '#ef4444' (20% restante → rojo)
 */
export function getTimerColor(remaining, total) {
  if (total <= 0) return '#ef4444';

  const ratio = remaining / total;

  if (ratio > 0.5) return '#22c55e';
  if (ratio >= 0.25) return '#eab308';
  return '#ef4444';
}

/**
 * Formatea décimas de segundo a un string legible con un decimal.
 *
 * @param {number} deciseconds - Tiempo en décimas de segundo
 * @returns {string} Tiempo formateado (ej: "12.5s")
 * @example
 * formatTime(125) // '12.5s'
 * formatTime(0)   // '0.0s'
 * formatTime(10)  // '1.0s'
 */
export function formatTime(deciseconds) {
  const seconds = Math.max(0, deciseconds) / 10;
  return `${seconds.toFixed(1)}s`;
}
