/**
 * Utilidades de dificultad para CapiChef.
 *
 * Funciones puras que ajustan recetas y desafíos matemáticos
 * según la configuración de dificultad del jugador.
 * No importa desde src/state ni src/components.
 */

import { clamp } from './mathUtils.js';

/**
 * Ajusta el timer de una receta según la dificultad configurada.
 *
 * - Fácil: +5 segundos al timer
 * - Normal: sin cambios
 * - Difícil: -2 segundos al timer (mínimo 5s)
 *
 * @param {{ name: string, ingredients: string[], time: number }} recipe - Receta original
 * @param {{ difficulty: 'easy' | 'normal' | 'hard' }} config - Configuración de dificultad
 * @returns {{ name: string, ingredients: string[], time: number }} Receta con timer ajustado
 * @example
 * applyDifficultyToRecipe({ name: 'Ensalada', ingredients: ['🍅'], time: 15 }, { difficulty: 'easy' })
 * // { name: 'Ensalada', ingredients: ['🍅'], time: 20 }
 */
export function applyDifficultyToRecipe(recipe, config) {
  if (!recipe || !config) return recipe;

  let timeAdjustment = 0;

  switch (config.difficulty) {
    case 'easy':
      timeAdjustment = 5;
      break;
    case 'hard':
      timeAdjustment = -2;
      break;
    case 'normal':
    default:
      timeAdjustment = 0;
      break;
  }

  const adjustedTime = clamp(recipe.time + timeAdjustment, 5, Infinity);

  return {
    ...recipe,
    time: adjustedTime,
  };
}

/**
 * Ajusta un desafío matemático según la configuración de dificultad.
 *
 * - Difícil: amplía el rango de opciones incorrectas (mayor dispersión)
 * - Fácil/Normal: retorna el desafío sin cambios
 *
 * @param {{ operand1: number, operand2: number, operation: string, correctAnswer: number, options: number[], emoji1: string, emoji2: string, narrative: string, operationName: string }} challenge - Desafío original
 * @param {{ difficulty: 'easy' | 'normal' | 'hard' }} config - Configuración de dificultad
 * @returns {{ operand1: number, operand2: number, operation: string, correctAnswer: number, options: number[], emoji1: string, emoji2: string, narrative: string, operationName: string }} Desafío ajustado
 * @example
 * applyDifficultyToMath(challenge, { difficulty: 'hard' })
 * // challenge con opciones incorrectas más dispersas
 */
export function applyDifficultyToMath(challenge, config) {
  if (!challenge || !config) return challenge;

  // En dificultad difícil, las opciones incorrectas se dispersan más
  // haciendo más difícil adivinar la respuesta correcta
  if (config.difficulty === 'hard') {
    const { correctAnswer, options } = challenge;
    const adjustedOptions = options.map((opt) => {
      if (opt === correctAnswer) return opt;
      // Ampliar la distancia de las opciones incorrectas
      const diff = opt - correctAnswer;
      const amplified = correctAnswer + diff * 2;
      return Math.max(0, amplified);
    });

    return {
      ...challenge,
      options: adjustedOptions,
    };
  }

  return { ...challenge };
}
