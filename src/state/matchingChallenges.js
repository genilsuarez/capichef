/**
 * Generador de desafíos de pares matemáticos para CapiChef.
 * Crea conjuntos de operaciones de multiplicación con sus resultados para unir.
 */
import { shuffleArray } from './recipes.js';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Genera un desafío de pares: 4 multiplicaciones a unir con su resultado.
 * @param {number} level - Nivel actual (escala el rango de operandos)
 * @param {object} [config={}]
 * @param {number} [config.mathMaxTable=10]
 * @returns {{ pairs: Array, shuffledAnswers: number[] }}
 */
export function generateMatchingChallenge(level, config = {}) {
  const mathMaxTable = config.mathMaxTable ?? 10;
  const count = 4;
  const maxA = Math.min(2 + Math.floor(level / 2), mathMaxTable);

  const pairs = [];
  const usedResults = new Set();
  let attempts = 0;

  while (pairs.length < count && attempts < 300) {
    attempts++;
    const a = randomInt(1, maxA);
    const b = randomInt(1, mathMaxTable);
    const result = a * b;

    if (!usedResults.has(result)) {
      usedResults.add(result);
      pairs.push({
        id: pairs.length,
        operand1: a,
        operand2: b,
        operation: `${a} × ${b}`,
        result,
      });
    }
  }

  const shuffledAnswers = shuffleArray(pairs.map(p => p.result));
  return { pairs, shuffledAnswers };
}
