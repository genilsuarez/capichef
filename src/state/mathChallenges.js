/**
 * Sistema de desafíos matemáticos de CapiChef
 *
 * Genera desafíos de sumas, restas y multiplicaciones con dificultad
 * escalada por nivel. Incluye emojis temáticos de cocina y narrativa.
 *
 * Todas las funciones son puras y exportadas con named exports.
 */

import { INGREDIENT_POOL, shuffleArray } from './recipes.js';

/**
 * Genera un entero aleatorio entre min y max (ambos inclusivos).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Retorna el nombre narrativo de cocina para una operación matemática.
 * @param {'+' | '-' | '×'} operation
 * @returns {string}
 */
export function getMathNarrative(operation) {
  switch (operation) {
    case '+':
      return '¡Añadir ingredientes!';
    case '-':
      return '¡Usar ingredientes!';
    case '×':
      return '¡Hacer porciones!';
    default:
      return '¡Añadir ingredientes!';
  }
}

/**
 * Genera 2 opciones incorrectas cercanas al resultado correcto.
 * - Para resultados >= 100: las opciones comparten la última cifra con la correcta,
 *   haciendo imposible eliminar por unidades. Offset en decenas (±10, ±20... ±50).
 * - Para resultados < 100: offset proporcional a la magnitud.
 *
 * @param {number} correctAnswer - La respuesta correcta del desafío
 * @returns {number[]} Array de 2 opciones incorrectas
 */
export function generateWrongOptions(correctAnswer) {
  const options = new Set();
  let attempts = 0;
  const maxAttempts = 200;

  if (correctAnswer >= 100) {
    // Opciones que comparten la última cifra — solo varían en decenas/centenas
    const lastDigit = correctAnswer % 10;
    const offsets = [-50, -40, -30, -20, 20, 30, 40, 50];
    // Shuffle offsets para variedad
    const shuffled = offsets.sort(() => Math.random() - 0.5);

    for (const offset of shuffled) {
      if (options.size >= 2) break;
      const candidate = correctAnswer + offset;
      // Ajustar para que la última cifra coincida
      const adjustedLastDigit = candidate % 10;
      const diff = lastDigit - adjustedLastDigit;
      const adjusted = candidate + diff;
      if (adjusted > 0 && adjusted !== correctAnswer && !options.has(adjusted)) {
        options.add(adjusted);
      }
    }

    // Fallback si no se llenó
    let fallback = 10;
    while (options.size < 2 && fallback <= 200) {
      const candidate = correctAnswer + fallback;
      const adj = candidate - (candidate % 10) + lastDigit;
      if (adj > 0 && adj !== correctAnswer && !options.has(adj)) options.add(adj);
      fallback += 10;
    }
  } else {
    // Resultados < 100: offset proporcional
    const maxOffset = correctAnswer >= 20 ? 15 : 5;
    const minOffset = correctAnswer >= 20 ? 3 : 1;

    while (options.size < 2 && attempts < maxAttempts) {
      const offset = randomInt(minOffset, maxOffset) * (Math.random() < 0.5 ? -1 : 1);
      const candidate = correctAnswer + offset;
      if (candidate >= 0 && candidate !== correctAnswer && !options.has(candidate)) {
        options.add(candidate);
      }
      attempts++;
    }

    // Fallback
    let fallback = minOffset;
    while (options.size < 2) {
      const candidate = correctAnswer + fallback;
      if (candidate >= 0 && candidate !== correctAnswer && !options.has(candidate)) options.add(candidate);
      fallback++;
    }
  }

  return [...options];
}


/**
 * Genera una explicación simple de la operación matemática para el capibara.
 * @param {{ operand1: number, operand2: number, operation: '+' | '-' | '×', correctAnswer: number }} challenge
 * @returns {string}
 */
export function generateMathExplanation(challenge) {
  const { operand1, operand2, operation, correctAnswer } = challenge;

  switch (operation) {
    case '+':
      return `¡${operand1} + ${operand2} = ${correctAnswer}! Contemos juntos 🦫`;
    case '-':
      return `¡${operand1} - ${operand2} = ${correctAnswer}! Restamos y queda ${correctAnswer} 🦫`;
    case '×':
      return `¡${operand1} × ${operand2} = ${correctAnswer}! Son ${correctAnswer} porciones 🦫`;
    default:
      return `¡La respuesta es ${correctAnswer}! 🦫`;
  }
}

/**
 * Selecciona dos emojis aleatorios del pool de ingredientes.
 * @returns {{ emoji1: string, emoji2: string }}
 */
function pickCookingEmojis() {
  const emojis = INGREDIENT_POOL.map((i) => i.emoji);
  const shuffled = shuffleArray(emojis);
  return {
    emoji1: shuffled[0],
    emoji2: shuffled[1],
  };
}

/**
 * Genera un desafío de suma para niveles 1-2.
 * Operandos entre 1 y 10.
 * @returns {{ operand1: number, operand2: number, operation: '+' | '-' | '×', correctAnswer: number }}
 */
function generateAddition(minOp, maxOp) {
  const operand1 = randomInt(minOp, maxOp);
  const operand2 = randomInt(minOp, maxOp);
  return {
    operand1,
    operand2,
    operation: '+',
    correctAnswer: operand1 + operand2,
  };
}

/**
 * Genera un desafío de resta. Garantiza resultado ≥ 0.
 * @param {number} minOp
 * @param {number} maxOp
 * @returns {{ operand1: number, operand2: number, operation: '-', correctAnswer: number }}
 */
function generateSubtraction(minOp, maxOp) {
  let a = randomInt(minOp, maxOp);
  let b = randomInt(minOp, maxOp);
  // Garantizar resultado ≥ 0
  if (a < b) {
    [a, b] = [b, a];
  }
  return {
    operand1: a,
    operand2: b,
    operation: '-',
    correctAnswer: a - b,
  };
}

/**
 * Genera un desafío de multiplicación.
 * @param {number} minOp
 * @param {number} maxOp
 * @returns {{ operand1: number, operand2: number, operation: '×', correctAnswer: number }}
 */
function generateMultiplication(minOp, maxOp) {
  const operand1 = randomInt(minOp, maxOp);
  const operand2 = randomInt(minOp, maxOp);
  return {
    operand1,
    operand2,
    operation: '×',
    correctAnswer: operand1 * operand2,
  };
}

/**
 * Genera un desafío según las operaciones seleccionadas y los límites configurados.
 * @param {string[]} mathOps - Array de operaciones activas: 'addition' | 'subtraction' | 'multiplication'
 * @param {number} mathMaxValue - Valor máximo para sumas y restas
 * @param {number} mathMaxTable - Tabla máxima para multiplicaciones
 * @returns {{ operand1: number, operand2: number, operation: string, correctAnswer: number }}
 */
function generateByOps(mathOps, mathMaxValue, mathMaxTable) {
  const ops = mathOps && mathOps.length > 0 ? mathOps : ['addition'];
  const pick = ops[randomInt(0, ops.length - 1)];
  if (pick === 'addition') return generateAddition(1, mathMaxValue);
  if (pick === 'subtraction') return generateSubtraction(1, mathMaxValue);
  return generateMultiplication(1, mathMaxTable);
}

// ── Modo adolescente ──────────────────────────────────────────────────────────

/**
 * Suma de 3 cifras: ambos operandos entre 100 y 999, resultado ≤ 1999.
 */
function generateTeenAddition() {
  const a = randomInt(100, 999);
  const b = randomInt(100, 999);
  return { operand1: a, operand2: b, operation: '+', correctAnswer: a + b };
}

/**
 * Resta de 3 cifras: resultado siempre ≥ 0.
 */
function generateTeenSubtraction() {
  let a = randomInt(100, 999);
  let b = randomInt(100, 999);
  if (a < b) [a, b] = [b, a];
  return { operand1: a, operand2: b, operation: '-', correctAnswer: a - b };
}

/**
 * Multiplicación que garantiza resultado > 100.
 * Operandos: uno entre 10-50, otro entre 3-20.
 */
function generateTeenMultiplication() {
  let a, b, result;
  do {
    a = randomInt(10, 50);
    b = randomInt(3, 20);
    result = a * b;
  } while (result <= 100);
  return { operand1: a, operand2: b, operation: '×', correctAnswer: result };
}

/**
 * Genera un desafío teen según las operaciones activas.
 */
function generateTeenByOps(mathOps) {
  const ops = mathOps && mathOps.length > 0 ? mathOps : ['addition'];
  const pick = ops[randomInt(0, ops.length - 1)];
  if (pick === 'addition') return generateTeenAddition();
  if (pick === 'subtraction') return generateTeenSubtraction();
  return generateTeenMultiplication();
}

/**
 * Genera un desafío matemático completo escalado por nivel.
 * Usa mathOps (array de operaciones activas), mathMaxValue, mathMaxTable y mathLevel.
 *
 * @param {number} level - Nivel actual del juego (1-based)
 * @param {string[]} [mathOps] - Operaciones activas: ['addition','subtraction','multiplication']
 * @param {number} [mathMaxValue=20] - Valor máximo para sumas y restas (modo kids)
 * @param {number} [mathMaxTable=10] - Tabla máxima para multiplicaciones (modo kids)
 * @param {'kids'|'teen'} [mathLevel='kids'] - Perfil de dificultad matemática
 * @returns {import('./recipes.js').MathChallenge}
 */
export function generateMathChallenge(level, mathOps, mathMaxValue = 20, mathMaxTable = 10, mathLevel = 'kids') {
  let base;

  if (mathLevel === 'teen') {
    base = generateTeenByOps(mathOps);
  } else if (mathOps && mathOps.length > 0) {
    base = generateByOps(mathOps, mathMaxValue, mathMaxTable);
  } else if (level <= 2) {
    base = generateAddition(1, Math.min(mathMaxValue, 10));
  } else if (level <= 4) {
    base = generateSubtraction(1, mathMaxValue);
  } else if (level <= 6) {
    base = generateMultiplication(1, mathMaxTable);
  } else {
    base = generateByOps(['addition', 'subtraction', 'multiplication'], mathMaxValue, mathMaxTable);
  }

  const wrongOptions = generateWrongOptions(base.correctAnswer);
  const allOptions = shuffleArray([base.correctAnswer, ...wrongOptions]);
  const { emoji1, emoji2 } = pickCookingEmojis();
  const narrative = getMathNarrative(base.operation);

  return {
    operand1: base.operand1,
    operand2: base.operand2,
    operation: base.operation,
    correctAnswer: base.correctAnswer,
    options: allOptions,
    emoji1,
    emoji2,
    narrative,
    operationName: narrative,
  };
}
