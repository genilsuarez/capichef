/**
 * Game Reducer de CapiChef
 *
 * Gestiona el estado volátil de la partida en curso:
 * nivel, vidas, timer, ingredientes, combo, monedas, desafíos matemáticos.
 *
 * Todas las funciones son puras. Los efectos secundarios se manejan en hooks y useEffects.
 */

import { FIXED_RECIPES, generateRandomRecipe, generateDistractors, shuffleArray } from './recipes.js';
import { generateMathChallenge } from './mathChallenges.js';
import { applyDifficultyToRecipe } from '../utils/difficultyUtils.js';
import { ERROR_THRESHOLD_BY_DIFFICULTY, SPEEDRUN_PENALTY_SECONDS, MIN_LEVEL_TIME_SECONDS } from '../constants/gameConstants.js';

// ---------------------------------------------------------------------------
// Speech bubble phrase pools (Req 18.3)
// ---------------------------------------------------------------------------

/** Frases al inicio de nivel / inicio de partida */
export const SPEECH_LEVEL_START = [
  '¡Esta receta es mi favorita!',
  '¡Manos a la obra!',
  '¡Vamos a cocinar!',
];

/** Frases al cometer un error */
export const SPEECH_ERROR = [
  '¡Oops, casi!',
  '¡Tú puedes!',
  '¡Inténtalo de nuevo!',
];

/** Frases al acertar matemáticas */
export const SPEECH_MATH_CORRECT = [
  '¡Eres un genio!',
  '¡Matemáticas al poder!',
  '¡Cerebro de chef!',
];

/**
 * Selecciona una frase aleatoria de un pool.
 * @param {string[]} pool - Array de frases
 * @returns {string}
 */
export function getRandomPhrase(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Retorna el multiplicador de combo según la racha actual.
 * @param {number} combo - Racha actual de niveles sin perder vida
 * @returns {number} Multiplicador: 0-1→1.0, 2-3→1.5, 4-5→2.0, 6+→3.0
 */
export function getComboMultiplier(combo) {
  if (combo <= 1) return 1.0;
  if (combo <= 3) return 1.5;
  if (combo <= 5) return 2.0;
  return 3.0;
}

/**
 * Calcula las monedas ganadas al completar un nivel.
 * @param {number} level - Nivel actual (1-based)
 * @param {number} timeUsed - Tiempo usado en décimas de segundo
 * @param {number} totalTime - Tiempo total del nivel en décimas de segundo
 * @param {number} errors - Errores cometidos en el plato
 * @param {number} combo - Racha actual de combo
 * @param {'classic' | 'practice' | 'speedrun'} [gameMode='classic'] - Modo de juego
 * @returns {{ base: number, speedBonus: number, perfectBonus: number, comboMultiplier: number, modeMultiplier: number, total: number }}
 */
export function calculateCoins(level, timeUsed, totalTime, errors, combo, gameMode = 'classic') {
  const base = 10 * level;
  const speedBonus = timeUsed < totalTime * 0.5 ? base * 0.5 : 0;
  const perfectBonus = errors === 0 ? base * 0.2 : 0;
  const comboMultiplier = getComboMultiplier(combo);
  const modeMultiplier = gameMode === 'speedrun' ? 2 : 1;
  const total = Math.floor((base + speedBonus + perfectBonus) * comboMultiplier * modeMultiplier);

  return { base, speedBonus, perfectBonus, comboMultiplier, modeMultiplier, total };
}

/**
 * Estado inicial del juego.
 * @type {import('../types').GameState}
 */
export const initialState = {
  screen: 'start',
  gameMode: 'classic',
  level: 1,
  lives: 3,
  maxErrors: 3,
  coins: 0,
  combo: 0,
  bestCombo: 0,
  highScore: 0,
  bestLevel: 0,
  dishesCompleted: 0,
  gameStartTime: null,
  currentRecipe: null,
  ingredientProgress: 0,
  errorsInCurrentDish: 0,
  consecutiveErrorsWithoutHit: 0,
  timeRemaining: 0,
  availableIngredients: [],
  newIngredientsThisSession: [],
  newIngredientsForLevel: [],
  timeBonusApplied: 0,
  consecutiveTimerDeaths: 0,
  capibaraState: 'idle',
  lastClickResult: null,
  lastClickedIngredient: null,
  coinsEarnedThisLevel: null,
  currentTheme: 'day',
  speechBubbleMessage: null,
  currentComboMilestone: null,
  timePenaltySeconds: 0,
  isFirstPlaythrough: true,
  mathChallengesCorrect: 0,
  mathChallengesTotal: 0,
  currentMathChallenge: null,
  lastMathCoins: 0,
  pendingAchievements: [],
  screenBeforePause: null,
  _config: null,
};

/**
 * Genera la receta para un nivel dado.
 * Niveles 1-5 usan recetas fijas, 6+ genera aleatoriamente.
 * @param {number} level
 * @param {{ name: string, ingredients: string[], time: number } | null} previousRecipe
 * @returns {{ name: string, ingredients: string[], time: number }}
 */
function getRecipeForLevel(level, previousRecipe) {
  if (level <= 5) {
    return FIXED_RECIPES[level - 1];
  }
  return generateRandomRecipe(level, previousRecipe);
}

/**
 * Prepara los ingredientes disponibles para el panel (receta + distractores, shuffled).
 * Garantiza que TODOS los ingredientes de la receta estén presentes.
 * @param {{ ingredients: string[] }} recipe
 * @returns {string[]}
 */
function prepareAvailableIngredients(recipe) {
  const distractorCount = Math.max(0, 10 - recipe.ingredients.length);
  const distractors = generateDistractors(recipe.ingredients, distractorCount);
  const combined = [...recipe.ingredients, ...distractors];
  // Validación defensiva: eliminar duplicados preservando orden
  const seen = new Set();
  const unique = combined.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
  return shuffleArray(unique);
}

/**
 * Calcula el tema visual según el nivel.
 * @param {number} level
 * @returns {'day' | 'night' | 'underwater' | 'space'}
 */
function getThemeForLevel(level) {
  if (level <= 5) return 'day';
  if (level <= 10) return 'night';
  if (level <= 15) return 'underwater';
  return 'space';
}

/**
 * Applies speedrun time reduction to a recipe: -3s (minimum 5s).
 * @param {{ name: string, ingredients: string[], time: number }} recipe
 * @returns {{ name: string, ingredients: string[], time: number }}
 */
function applySpeedrunTimeReduction(recipe) {
  return {
    ...recipe,
    time: Math.max(recipe.time - 3, MIN_LEVEL_TIME_SECONDS),
  };
}

/**
 * Resets the current level without losing a life (for practice/speedrun modes).
 * @param {object} state - Estado actual del juego
 * @returns {object} Nuevo estado
 */
function resetLevelWithoutLifeLoss(state) {
  return {
    ...state,
    errorsInCurrentDish: 0,
    consecutiveErrorsWithoutHit: 0,
    ingredientProgress: 0,
    timeRemaining: state.currentRecipe.time * 10,
    availableIngredients: prepareAvailableIngredients(state.currentRecipe),
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
  };
}

/**
 * Lógica compartida para perder una vida (TIME_UP o maxErrors errores).
 * In practice mode: no life loss, just reset level.
 * In speedrun mode: no life loss, add penalty time, reset level.
 * @param {object} state - Estado actual del juego
 * @returns {object} Nuevo estado
 */
function loseLife(state) {
  // Practice mode: never lose lives
  if (state.gameMode === 'practice') {
    return resetLevelWithoutLifeLoss(state);
  }

  // Speedrun mode: no life loss, add penalty time
  if (state.gameMode === 'speedrun') {
    return {
      ...resetLevelWithoutLifeLoss(state),
      timePenaltySeconds: state.timePenaltySeconds + SPEEDRUN_PENALTY_SECONDS,
    };
  }

  const newLives = state.lives - 1;

  if (newLives === 0) {
    return {
      ...state,
      lives: 0,
      screen: 'gameOver',
      capibaraState: 'gameover',
      highScore: Math.max(state.highScore, state.coins),
      bestLevel: Math.max(state.bestLevel, state.level),
      combo: 0,
      lastClickResult: null,
    };
  }

  // Reiniciar mismo nivel con misma receta
  return {
    ...state,
    lives: newLives,
    errorsInCurrentDish: 0,
    consecutiveErrorsWithoutHit: 0,
    ingredientProgress: 0,
    timeRemaining: state.currentRecipe.time * 10,
    availableIngredients: prepareAvailableIngredients(state.currentRecipe),
    combo: 0,
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
  };
}

/** Map theme keys to display names for unlock messages (Req 20.2) */
const THEME_DISPLAY_NAMES = {
  day: 'cocina de día',
  night: 'cocina nocturna',
  underwater: 'cocina submarina',
  space: 'cocina espacial',
};

/**
 * Computes which ingredients in the available panel are new (never seen this session).
 * Returns the updated newIngredientsThisSession array (with newly seen ones added)
 * and the list of ingredients that are new for badge display.
 * @param {string[]} availableIngredients
 * @param {string[]} previouslySeen
 * @returns {{ updatedSeen: string[], newOnes: string[] }}
 */
function trackNewIngredients(availableIngredients, previouslySeen) {
  const seenSet = new Set(previouslySeen);
  const newOnes = availableIngredients.filter((ing) => !seenSet.has(ing));
  const updatedSeen = [...previouslySeen, ...newOnes];
  return { updatedSeen, newOnes };
}

/**
 * Lógica compartida para avanzar al siguiente nivel.
 * Usada por NEXT_LEVEL, ANSWER_MATH y MATH_TIMEOUT.
 * @param {object} state - Estado actual del juego
 * @returns {object} Nuevo estado con el siguiente nivel preparado
 */
function advanceToNextLevel(state) {
  const nextLevel = state.level + 1;
  let recipe = getRecipeForLevel(nextLevel, state.currentRecipe);
  if (state._config) {
    recipe = applyDifficultyToRecipe(recipe, state._config);
  }
  // Speedrun mode: reduce recipe time by 3s (min 5s)
  if (state.gameMode === 'speedrun') {
    recipe = applySpeedrunTimeReduction(recipe);
  }

  // Adaptive time difficulty (Req 22.1):
  // If player lost life by timer in 2+ consecutive levels, add +2s (max +4s total)
  let newTimeBonusApplied = state.timeBonusApplied;
  if (state.consecutiveTimerDeaths >= 2 && newTimeBonusApplied < 4) {
    const bonusToAdd = Math.min(2, 4 - newTimeBonusApplied);
    recipe = { ...recipe, time: recipe.time + bonusToAdd };
    newTimeBonusApplied = newTimeBonusApplied + bonusToAdd;
  }

  const availableIngredients = prepareAvailableIngredients(recipe);

  // Recuperar vida en múltiplos de 5 si lives < 3
  let newLives = state.lives;
  if (nextLevel % 5 === 0 && newLives < 3) {
    newLives = newLives + 1;
  }

  // Track new ingredients this session (Req 20.3)
  const { updatedSeen, newOnes } = trackNewIngredients(availableIngredients, state.newIngredientsThisSession);

  // Theme unlock message for multiples of 5 (Req 20.2)
  const newTheme = getThemeForLevel(nextLevel);
  const prevTheme = getThemeForLevel(state.level);
  let speechMessage;
  if (nextLevel % 5 === 0) {
    const themeName = THEME_DISPLAY_NAMES[newTheme] || newTheme;
    speechMessage = `🌟 ¡Nivel ${nextLevel} desbloqueado! Entrando a la ${themeName}...`;
  } else {
    speechMessage = getRandomPhrase(SPEECH_LEVEL_START);
  }

  return {
    ...state,
    screen: 'playing',
    level: nextLevel,
    lives: newLives,
    currentRecipe: recipe,
    ingredientProgress: 0,
    errorsInCurrentDish: 0,
    consecutiveErrorsWithoutHit: 0,
    timeRemaining: recipe.time * 10,
    availableIngredients,
    newIngredientsThisSession: updatedSeen,
    newIngredientsForLevel: newOnes,
    timeBonusApplied: newTimeBonusApplied,
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
    currentMathChallenge: null,
    currentTheme: newTheme,
    currentComboMilestone: null,
    speechBubbleMessage: speechMessage,
  };
}

/**
 * Reducer principal del juego.
 * @param {object} state - Estado actual
 * @param {{ type: string, payload?: any }} action - Acción despachada
 * @returns {object} Nuevo estado
 */
export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      // payload can be a string (gameMode) or an object { mode, config }
      let gameMode = 'classic';
      let config = null;
      if (typeof action.payload === 'string') {
        gameMode = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        gameMode = action.payload.mode || 'classic';
        config = action.payload.config || null;
      }

      const maxErrors = config
        ? (ERROR_THRESHOLD_BY_DIFFICULTY[config.difficulty] ?? 3)
        : 3;

      let recipe = getRecipeForLevel(1, null);
      if (config) {
        recipe = applyDifficultyToRecipe(recipe, config);
      }
      // Speedrun mode: reduce recipe time by 3s (min 5s)
      if (gameMode === 'speedrun') {
        recipe = applySpeedrunTimeReduction(recipe);
      }
      const availableIngredients = prepareAvailableIngredients(recipe);

      // Track initial ingredients as "seen" this session (Req 20.3)
      // On level 1, all ingredients are new
      const initialSeen = [...availableIngredients];

      return {
        ...initialState,
        screen: 'playing',
        gameMode,
        level: 1,
        lives: 3,
        maxErrors,
        coins: 0,
        combo: 0,
        bestCombo: 0,
        highScore: state.highScore,
        bestLevel: state.bestLevel,
        dishesCompleted: 0,
        gameStartTime: Date.now(),
        currentRecipe: recipe,
        ingredientProgress: 0,
        errorsInCurrentDish: 0,
        consecutiveErrorsWithoutHit: 0,
        timeRemaining: recipe.time * 10,
        availableIngredients,
        newIngredientsThisSession: initialSeen,
        newIngredientsForLevel: initialSeen,
        timeBonusApplied: 0,
        consecutiveTimerDeaths: 0,
        capibaraState: 'idle',
        lastClickResult: null,
        lastClickedIngredient: null,
        coinsEarnedThisLevel: null,
        currentTheme: 'day',
        speechBubbleMessage: getRandomPhrase(SPEECH_LEVEL_START),
        currentComboMilestone: null,
        timePenaltySeconds: 0,
        isFirstPlaythrough: state.isFirstPlaythrough,
        mathChallengesCorrect: 0,
        mathChallengesTotal: 0,
        currentMathChallenge: null,
        pendingAchievements: [],
        screenBeforePause: null,
        _config: config,
      };
    }

    case 'CLICK_INGREDIENT': {
      if (state.screen !== 'playing' || !state.currentRecipe) return state;

      const clickedIngredient = action.payload;
      const expectedIngredient = state.currentRecipe.ingredients[state.ingredientProgress];
      const isCorrect = clickedIngredient === expectedIngredient;

      if (isCorrect) {
        const newProgress = state.ingredientProgress + 1;
        // Filtrar solo la primera ocurrencia del ingrediente clickeado
        let removed = false;
        const newAvailable = state.availableIngredients.filter((i) => {
          if (!removed && i === clickedIngredient) { removed = true; return false; }
          return true;
        });

        // Garantizar que todos los ingredientes pendientes estén en el panel
        const remainingRecipeIngredients = state.currentRecipe.ingredients.slice(newProgress);
        const missingIngredients = remainingRecipeIngredients.filter((ing) => !newAvailable.includes(ing));
        if (missingIngredients.length > 0) {
          newAvailable.push(...missingIngredients);
        }

        const isRecipeComplete = newProgress >= state.currentRecipe.ingredients.length;

        if (isRecipeComplete) {
          // Calcular monedas
          const totalTimeDeciseconds = state.currentRecipe.time * 10;
          const timeUsed = totalTimeDeciseconds - state.timeRemaining;
          const newCombo = state.combo + 1;
          const coinBreakdown = calculateCoins(
            state.level,
            timeUsed,
            totalTimeDeciseconds,
            state.errorsInCurrentDish,
            newCombo,
            state.gameMode
          );

          // Detectar milestone de combo
          let comboMilestone = null;
          if (newCombo === 3) comboMilestone = 3;
          else if (newCombo === 6) comboMilestone = 6;
          else if (newCombo === 10) comboMilestone = 10;

          return {
            ...state,
            screen: 'levelComplete',
            ingredientProgress: newProgress,
            availableIngredients: newAvailable,
            capibaraState: 'done',
            lastClickResult: 'correct',
            lastClickedIngredient: clickedIngredient,
            combo: newCombo,
            bestCombo: Math.max(state.bestCombo, newCombo),
            bestLevel: Math.max(state.bestLevel, state.level),
            coins: state.coins + coinBreakdown.total,
            coinsEarnedThisLevel: coinBreakdown,
            dishesCompleted: state.dishesCompleted + 1,
            currentComboMilestone: comboMilestone,
          };
        }

        // Ingrediente correcto pero receta no completa aún
        return {
          ...state,
          ingredientProgress: newProgress,
          availableIngredients: newAvailable,
          capibaraState: 'cooking',
          lastClickResult: 'correct',
          lastClickedIngredient: clickedIngredient,
          consecutiveErrorsWithoutHit: 0,
          consecutiveTimerDeaths: 0,
        };
      }

      // Ingrediente incorrecto
      const newErrors = state.errorsInCurrentDish + 1;
      const newConsecutiveErrors = state.consecutiveErrorsWithoutHit + 1;

      if (newErrors >= state.maxErrors) {
        // Practice mode: don't lose life, just keep errors at max
        if (state.gameMode === 'practice') {
          return {
            ...state,
            errorsInCurrentDish: newErrors,
            consecutiveErrorsWithoutHit: newConsecutiveErrors,
            capibaraState: 'error',
            lastClickResult: 'incorrect',
            lastClickedIngredient: clickedIngredient,
          };
        }

        // Speedrun mode: add penalty time instead of losing life
        if (state.gameMode === 'speedrun') {
          return {
            ...resetLevelWithoutLifeLoss({
              ...state,
              errorsInCurrentDish: newErrors,
              consecutiveErrorsWithoutHit: newConsecutiveErrors,
              lastClickResult: 'incorrect',
              lastClickedIngredient: clickedIngredient,
            }),
            timePenaltySeconds: state.timePenaltySeconds + SPEEDRUN_PENALTY_SECONDS,
          };
        }

        // Classic mode: lose life
        return loseLife({
          ...state,
          errorsInCurrentDish: newErrors,
          consecutiveErrorsWithoutHit: newConsecutiveErrors,
          lastClickResult: 'incorrect',
          lastClickedIngredient: clickedIngredient,
        });
      }

      return {
        ...state,
        errorsInCurrentDish: newErrors,
        consecutiveErrorsWithoutHit: newConsecutiveErrors,
        capibaraState: 'error',
        lastClickResult: 'incorrect',
        lastClickedIngredient: clickedIngredient,
        speechBubbleMessage: getRandomPhrase(SPEECH_ERROR),
      };
    }

    case 'TIMER_TICK': {
      if (state.screen !== 'playing') return state;
      // Practice mode: timer stays static (no countdown)
      if (state.gameMode === 'practice') return state;
      return {
        ...state,
        timeRemaining: state.timeRemaining - 1,
      };
    }

    case 'TIME_UP': {
      return loseLife({
        ...state,
        consecutiveTimerDeaths: state.consecutiveTimerDeaths + 1,
      });
    }

    case 'NEXT_LEVEL': {
      return advanceToNextLevel(state);
    }

    case 'SHOW_MATH': {
      const cfg = state._config || {};
      const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
      const mathMaxValue = cfg.mathMaxValue ?? 20;
      const mathMaxTable = cfg.mathMaxTable ?? 10;
      const challenge = generateMathChallenge(state.level, mathOps, mathMaxValue, mathMaxTable);
      return {
        ...state,
        screen: 'mathChallenge',
        currentMathChallenge: challenge,
        capibaraState: 'thinking',
        mathChallengesTotal: state.mathChallengesTotal + 1,
      };
    }

    case 'ANSWER_MATH': {
      const selectedAnswer = action.payload;
      const isCorrect = state.currentMathChallenge &&
        selectedAnswer === state.currentMathChallenge.correctAnswer;

      if (isCorrect) {
        const mathBonus = 5 * state.level;
        const stateWithBonus = {
          ...state,
          coins: state.coins + mathBonus,
          mathChallengesCorrect: state.mathChallengesCorrect + 1,
          lastMathCoins: mathBonus,
        };
        const nextState = advanceToNextLevel(stateWithBonus);
        return {
          ...nextState,
          speechBubbleMessage: getRandomPhrase(SPEECH_MATH_CORRECT),
        };
      }

      // Respuesta incorrecta — avanzar sin bonus
      return { ...advanceToNextLevel(state), lastMathCoins: 0 };
    }

    case 'MATH_TIMEOUT': {
      // Tratar como respuesta incorrecta — avanzar sin bonus
      return advanceToNextLevel(state);
    }

    case 'MATH_SKIP': {
      // Skip without penalty or bonus — advance to next level
      return advanceToNextLevel(state);
    }

    case 'PAUSE_GAME': {
      if (state.screen !== 'playing') return state;
      return {
        ...state,
        screen: 'paused',
        screenBeforePause: 'playing',
      };
    }

    case 'RESUME_GAME': {
      if (state.screen !== 'paused') return state;
      return {
        ...state,
        screen: state.screenBeforePause || 'playing',
        screenBeforePause: null,
      };
    }

    case 'EXIT_TO_MENU': {
      // Practice mode: don't update highScore
      const exitHighScore = state.gameMode === 'practice'
        ? state.highScore
        : Math.max(state.highScore, state.coins);
      const exitBestLevel = Math.max(state.bestLevel, state.level);
      return {
        ...initialState,
        screen: 'start',
        highScore: exitHighScore,
        bestLevel: exitBestLevel,
      };
    }

    case 'RESTART': {
      // Practice mode: don't update highScore
      const restartHighScore = state.gameMode === 'practice'
        ? state.highScore
        : Math.max(state.highScore, state.coins);
      const restartBestLevel = Math.max(state.bestLevel, state.level);
      return {
        ...initialState,
        screen: 'start',
        highScore: restartHighScore,
        bestLevel: restartBestLevel,
      };
    }

    case 'ADD_PENDING_ACHIEVEMENT': {
      return {
        ...state,
        pendingAchievements: [...state.pendingAchievements, action.payload],
      };
    }

    case 'DISMISS_ACHIEVEMENT': {
      return {
        ...state,
        pendingAchievements: state.pendingAchievements.slice(1),
      };
    }

    case 'SPEECH_BUBBLE_CLEAR': {
      return {
        ...state,
        speechBubbleMessage: null,
      };
    }

    case 'DISMISS_TUTORIAL': {
      return {
        ...state,
        isFirstPlaythrough: false,
      };
    }

    case 'RESET_TIMER': {
      if (!state.currentRecipe) return state;
      return {
        ...state,
        timeRemaining: state.currentRecipe.time * 10,
      };
    }

    case 'INIT_SESSION': {
      // Restaura highScore y bestLevel desde localStorage al montar la app
      return {
        ...state,
        highScore: Math.max(state.highScore, action.payload.highScore || 0),
        bestLevel: Math.max(state.bestLevel, action.payload.bestLevel || 0),
      };
    }

    default:
      return state;
  }
}
