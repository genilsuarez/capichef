/**
 * Constantes para el sistema de desafíos matemáticos de CapiChef.
 *
 * Define rangos de operandos por nivel, emojis de cocina disponibles
 * para los enunciados y plantillas narrativas temáticas.
 *
 * @module mathConstants
 */

/**
 * Rangos de operandos por nivel y tipo de operación.
 *
 * - Niveles 1-2: sumas simples (1-10)
 * - Niveles 3-4: restas simples (1-20, resultado ≥ 0)
 * - Niveles 5-6: multiplicaciones simples (1-10)
 * - Niveles 7+: mezcla aleatoria con rangos ampliados
 *
 * @type {ReadonlyArray<{ minLevel: number, maxLevel: number, operations: ReadonlyArray<{ type: string, minOperand: number, maxOperand: number }> }>}
 */
export const OPERAND_RANGES_BY_LEVEL = Object.freeze([
  {
    minLevel: 1,
    maxLevel: 2,
    operations: Object.freeze([
      { type: '+', minOperand: 1, maxOperand: 10 },
    ]),
  },
  {
    minLevel: 3,
    maxLevel: 4,
    operations: Object.freeze([
      { type: '-', minOperand: 1, maxOperand: 20 },
    ]),
  },
  {
    minLevel: 5,
    maxLevel: 6,
    operations: Object.freeze([
      { type: '×', minOperand: 1, maxOperand: 10 },
    ]),
  },
  {
    minLevel: 7,
    maxLevel: Infinity,
    operations: Object.freeze([
      { type: '+', minOperand: 1, maxOperand: 10 },
      { type: '-', minOperand: 1, maxOperand: 20 },
      { type: '×', minOperand: 1, maxOperand: 12 },
    ]),
  },
]);

/**
 * Emojis de cocina disponibles para usar en enunciados matemáticos.
 * Se seleccionan aleatoriamente para dar variedad visual.
 * @type {ReadonlyArray<string>}
 */
export const COOKING_EMOJIS = Object.freeze([
  '🍅', '🧅', '🥩', '🧀', '🍳', '🥬', '🌶️', '🍚',
  '🐟', '🥖', '🍝', '🥑', '🍋', '🧄', '🥕', '🍗',
]);

/**
 * Plantillas narrativas de cocina para cada tipo de operación.
 * Se usan para presentar los desafíos como "misiones de cocina".
 * @type {Readonly<{ '+': ReadonlyArray<string>, '-': ReadonlyArray<string>, '×': ReadonlyArray<string> }>}
 */
export const MATH_NARRATIVES = Object.freeze({
  '+': Object.freeze([
    'Tienes {e1}{a} y añades {e2}{b} más. ¿Cuántos hay en total?',
    '¡El capibara tiene {e1}{a} y le traen {e2}{b} más!',
    'En la cocina hay {e1}{a}. Llegan {e2}{b} más. ¿Cuántos hay?',
  ]),
  '-': Object.freeze([
    'Tienes {e1}{a} y usas {e2}{b}. ¿Cuántos quedan?',
    '¡El capibara tenía {e1}{a} y usó {e2}{b} para cocinar!',
    'Había {e1}{a} en la cocina. Se usaron {e2}{b}. ¿Cuántos quedan?',
  ]),
  '×': Object.freeze([
    'Necesitas {a} porciones de {e1}. Cada porción lleva {b}. ¿Cuántos en total?',
    '¡El capibara prepara {a} platos con {e1}{b} cada uno!',
    'Hay {a} mesas y cada una necesita {e1}{b}. ¿Cuántos en total?',
  ]),
});

/**
 * Nombres de operaciones en contexto de cocina.
 * @type {Readonly<{ '+': string, '-': string, '×': string }>}
 */
export const OPERATION_NAMES = Object.freeze({
  '+': '¡Añadir ingredientes!',
  '-': '¡Usar ingredientes!',
  '×': '¡Hacer porciones!',
});

/** Rango de desviación para opciones incorrectas (±1 a ±5) */
export const WRONG_OPTION_MIN_OFFSET = 1;
export const WRONG_OPTION_MAX_OFFSET = 5;

/** Número de opciones de respuesta (1 correcta + 2 incorrectas) */
export const MATH_OPTIONS_COUNT = 3;
