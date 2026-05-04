/**
 * Game Reducer de CapiChef
 *
 * Gestiona el estado volátil de la partida en curso:
 * nivel, vidas, timer, ingredientes, combo, monedas, desafíos matemáticos y de pares.
 *
 * Todas las funciones son puras. Los efectos secundarios se manejan en hooks y useEffects.
 */

import { FIXED_RECIPES, generateRandomRecipe, generateDistractors, shuffleArray } from './recipes.js';
import { generateMathChallenge } from './mathChallenges.js';
import { generateMatchingChallenge } from './matchingChallenges.js';
import { applyDifficultyToRecipe } from '../utils/difficultyUtils.js';
import { ERROR_THRESHOLD_BY_DIFFICULTY, SPEEDRUN_PENALTY_SECONDS, MIN_LEVEL_TIME_SECONDS } from '../constants/gameConstants.js';

// ---------------------------------------------------------------------------
// Speech bubble phrase pools (Req 18.3)
// ---------------------------------------------------------------------------

export const SPEECH_LEVEL_START = [
  '¡Esta receta es mi favorita!',
  '¡Manos a la obra!',
  '¡Vamos a cocinar!',
];

export const SPEECH_ERROR = [
  '¡Oops, casi!',
  '¡Tú puedes!',
  '¡Inténtalo de nuevo!',
];

export const SPEECH_MATH_CORRECT = [
  '¡Eres un genio!',
  '¡Matemáticas al poder!',
  '¡Cerebro de chef!',
];

export const SPEECH_MATCHING_DONE = [
  '¡Pares perfectos!',
  '¡Eres un chef matemático!',
  '¡Todos los pares encontrados!',
];

export function getRandomPhrase(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getComboMultiplier(combo) {
  if (combo <= 1) return 1.0;
  if (combo <= 3) return 1.5;
  if (combo <= 5) return 2.0;
  return 3.0;
}

export function calculateCoins(level, timeUsed, totalTime, errors, combo, gameMode = 'classic') {
  const base = 10 * level;
  const speedBonus = timeUsed < totalTime * 0.5 ? base * 0.5 : 0;
  const perfectBonus = errors === 0 ? base * 0.2 : 0;
  const comboMultiplier = getComboMultiplier(combo);
  const modeMultiplier = gameMode === 'speedrun' ? 2 : 1;
  const total = Math.floor((base + speedBonus + perfectBonus) * comboMultiplier * modeMultiplier);
  return { base, speedBonus, perfectBonus, comboMultiplier, modeMultiplier, total };
}

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
  usedIngredients: [],
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
  currentMatchingChallenge: null,
  matchingChallengesCompleted: 0,
  lastMathCoins: 0,
  pendingAchievements: [],
  screenBeforePause: null,
  _config: null,
};

function getRecipeForLevel(level, previousRecipe) {
  if (level <= 5) return FIXED_RECIPES[level - 1];
  return generateRandomRecipe(level, previousRecipe);
}

function prepareAvailableIngredients(recipe) {
  const distractorCount = Math.max(0, 10 - recipe.ingredients.length);
  const distractors = generateDistractors(recipe.ingredients, distractorCount);
  const combined = [...recipe.ingredients, ...distractors];
  const seen = new Set();
  const unique = combined.filter((item) => {
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
  return shuffleArray(unique);
}

function getThemeForLevel(level) {
  if (level <= 5) return 'day';
  if (level <= 10) return 'night';
  if (level <= 15) return 'underwater';
  return 'space';
}

function applySpeedrunTimeReduction(recipe) {
  return { ...recipe, time: Math.max(recipe.time - 3, MIN_LEVEL_TIME_SECONDS) };
}

function resetLevelWithoutLifeLoss(state) {
  return {
    ...state,
    errorsInCurrentDish: 0,
    consecutiveErrorsWithoutHit: 0,
    ingredientProgress: 0,
    usedIngredients: [],
    timeRemaining: state.currentRecipe.time * 10,
    availableIngredients: prepareAvailableIngredients(state.currentRecipe),
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
  };
}

function loseLife(state) {
  if (state.gameMode === 'practice') return resetLevelWithoutLifeLoss(state);

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

  return {
    ...state,
    lives: newLives,
    errorsInCurrentDish: 0,
    consecutiveErrorsWithoutHit: 0,
    ingredientProgress: 0,
    usedIngredients: [],
    timeRemaining: state.currentRecipe.time * 10,
    availableIngredients: prepareAvailableIngredients(state.currentRecipe),
    combo: 0,
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
  };
}

const THEME_DISPLAY_NAMES = {
  day: 'cocina de día',
  night: 'cocina nocturna',
  underwater: 'cocina submarina',
  space: 'cocina espacial',
};

function trackNewIngredients(availableIngredients, previouslySeen) {
  const seenSet = new Set(previouslySeen);
  const newOnes = availableIngredients.filter((ing) => !seenSet.has(ing));
  const updatedSeen = [...previouslySeen, ...newOnes];
  return { updatedSeen, newOnes };
}

function advanceToNextLevel(state) {
  const nextLevel = state.level + 1;
  let recipe = getRecipeForLevel(nextLevel, state.currentRecipe);
  if (state._config) recipe = applyDifficultyToRecipe(recipe, state._config);
  if (state.gameMode === 'speedrun') recipe = applySpeedrunTimeReduction(recipe);

  let newTimeBonusApplied = state.timeBonusApplied;
  if (state.consecutiveTimerDeaths >= 2 && newTimeBonusApplied < 4) {
    const bonusToAdd = Math.min(2, 4 - newTimeBonusApplied);
    recipe = { ...recipe, time: recipe.time + bonusToAdd };
    newTimeBonusApplied += bonusToAdd;
  }

  const availableIngredients = prepareAvailableIngredients(recipe);
  let newLives = state.lives;
  if (nextLevel % 5 === 0 && newLives < 3) newLives += 1;

  const { updatedSeen, newOnes } = trackNewIngredients(availableIngredients, state.newIngredientsThisSession);

  const newTheme = getThemeForLevel(nextLevel);
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
    usedIngredients: [],
    newIngredientsThisSession: updatedSeen,
    newIngredientsForLevel: newOnes,
    timeBonusApplied: newTimeBonusApplied,
    capibaraState: 'idle',
    lastClickResult: null,
    lastClickedIngredient: null,
    coinsEarnedThisLevel: null,
    currentMathChallenge: null,
    currentMatchingChallenge: null,
    currentTheme: newTheme,
    currentComboMilestone: null,
    speechBubbleMessage: speechMessage,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      let gameMode = 'classic';
      let config = null;
      if (typeof action.payload === 'string') {
        gameMode = action.payload;
      } else if (action.payload && typeof action.payload === 'object') {
        gameMode = action.payload.mode || 'classic';
        config = action.payload.config || null;
      }

      const maxErrors = config ? (ERROR_THRESHOLD_BY_DIFFICULTY[config.difficulty] ?? 3) : 3;

      let recipe = getRecipeForLevel(1, null);
      if (config) recipe = applyDifficultyToRecipe(recipe, config);
      if (gameMode === 'speedrun') recipe = applySpeedrunTimeReduction(recipe);
      const availableIngredients = prepareAvailableIngredients(recipe);
      const initialSeen = [...availableIngredients];

      // practice_math: loop de desafíos sin recetas
      if (gameMode === 'practice_math') {
        const cfg = config || {};
        const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
        const challenge = generateMathChallenge(1, mathOps, cfg.mathMaxValue ?? 20, cfg.mathMaxTable ?? 10, cfg.mathLevel ?? 'kids');
        return {
          ...initialState,
          screen: 'mathChallenge',
          gameMode,
          level: 1,
          lives: 3,
          maxErrors,
          coins: 0,
          highScore: state.highScore,
          bestLevel: state.bestLevel,
          gameStartTime: Date.now(),
          currentRecipe: recipe,
          availableIngredients,
          newIngredientsThisSession: initialSeen,
          newIngredientsForLevel: initialSeen,
          currentMathChallenge: challenge,
          mathChallengesTotal: 1,
          capibaraState: 'thinking',
          isFirstPlaythrough: state.isFirstPlaythrough,
          _config: config,
        };
      }

      // practice_matching: loop de desafíos de pares sin recetas
      if (gameMode === 'practice_matching') {
        const cfg = config || {};
        const challenge = generateMatchingChallenge(1, cfg);
        return {
          ...initialState,
          screen: 'matchingChallenge',
          gameMode,
          level: 1,
          lives: 3,
          maxErrors,
          coins: 0,
          highScore: state.highScore,
          bestLevel: state.bestLevel,
          gameStartTime: Date.now(),
          currentRecipe: recipe,
          availableIngredients,
          newIngredientsThisSession: initialSeen,
          newIngredientsForLevel: initialSeen,
          currentMatchingChallenge: challenge,
          matchingChallengesCompleted: 0,
          capibaraState: 'thinking',
          isFirstPlaythrough: state.isFirstPlaythrough,
          _config: config,
        };
      }

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
        currentMatchingChallenge: null,
        matchingChallengesCompleted: 0,
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
        const newUsed = [...(state.usedIngredients || []), clickedIngredient];
        const isRecipeComplete = newProgress >= state.currentRecipe.ingredients.length;

        if (isRecipeComplete) {
          const totalTimeDeciseconds = state.currentRecipe.time * 10;
          const timeUsed = totalTimeDeciseconds - state.timeRemaining;
          const newCombo = state.combo + 1;
          const coinBreakdown = calculateCoins(
            state.level, timeUsed, totalTimeDeciseconds,
            state.errorsInCurrentDish, newCombo, state.gameMode
          );

          let comboMilestone = null;
          if (newCombo === 3) comboMilestone = 3;
          else if (newCombo === 6) comboMilestone = 6;
          else if (newCombo === 10) comboMilestone = 10;

          return {
            ...state,
            screen: 'levelComplete',
            ingredientProgress: newProgress,
            usedIngredients: newUsed,
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

        return {
          ...state,
          ingredientProgress: newProgress,
          usedIngredients: newUsed,
          capibaraState: 'cooking',
          lastClickResult: 'correct',
          lastClickedIngredient: clickedIngredient,
          consecutiveErrorsWithoutHit: 0,
          consecutiveTimerDeaths: 0,
        };
      }

      const newErrors = state.errorsInCurrentDish + 1;
      const newConsecutiveErrors = state.consecutiveErrorsWithoutHit + 1;

      if (newErrors >= state.maxErrors) {
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
      if (state.gameMode === 'practice') return state;
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    }

    case 'TIME_UP': {
      return loseLife({ ...state, consecutiveTimerDeaths: state.consecutiveTimerDeaths + 1 });
    }

    case 'NEXT_LEVEL': {
      return advanceToNextLevel(state);
    }

    case 'SHOW_MATH': {
      // Practice (recipe) mode: skip all challenges, go straight to next level
      if (state.gameMode === 'practice') {
        return advanceToNextLevel(state);
      }

      const cfg = state._config || {};

      // Interleave: odd dishesCompleted → math, even → matching pairs
      // dishesCompleted=1 (1st dish) → math; dishesCompleted=2 → matching; etc.
      if (state.dishesCompleted % 2 === 0) {
        const matchChallenge = generateMatchingChallenge(state.level, cfg);
        return {
          ...state,
          screen: 'matchingChallenge',
          currentMatchingChallenge: matchChallenge,
          capibaraState: 'thinking',
        };
      }

      // Math challenge
      const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
      const challenge = generateMathChallenge(
        state.level, mathOps, cfg.mathMaxValue ?? 20, cfg.mathMaxTable ?? 10, cfg.mathLevel ?? 'kids'
      );
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

      if (state.gameMode === 'practice_math') {
        const cfg = state._config || {};
        const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
        const nextChallenge = generateMathChallenge(
          state.level, mathOps, cfg.mathMaxValue ?? 20, cfg.mathMaxTable ?? 10, cfg.mathLevel ?? 'kids'
        );
        const mathBonus = isCorrect ? 5 * state.level : 0;
        return {
          ...state,
          screen: 'mathChallenge',
          currentMathChallenge: nextChallenge,
          capibaraState: 'thinking',
          coins: state.coins + mathBonus,
          mathChallengesCorrect: state.mathChallengesCorrect + (isCorrect ? 1 : 0),
          mathChallengesTotal: state.mathChallengesTotal + 1,
          lastMathCoins: mathBonus,
          speechBubbleMessage: isCorrect ? getRandomPhrase(SPEECH_MATH_CORRECT) : null,
        };
      }

      if (isCorrect) {
        const mathBonus = 5 * state.level;
        return {
          ...advanceToNextLevel({ ...state, coins: state.coins + mathBonus, mathChallengesCorrect: state.mathChallengesCorrect + 1, lastMathCoins: mathBonus }),
          speechBubbleMessage: getRandomPhrase(SPEECH_MATH_CORRECT),
        };
      }
      return { ...advanceToNextLevel(state), lastMathCoins: 0 };
    }

    case 'COMPLETE_MATCHING': {
      // practice_matching: loop infinito de pares, nivel sube para mayor dificultad
      if (state.gameMode === 'practice_matching') {
        const cfg = state._config || {};
        const newLevel = state.level + 1;
        const nextChallenge = generateMatchingChallenge(newLevel, cfg);
        return {
          ...state,
          screen: 'matchingChallenge',
          level: newLevel,
          currentMatchingChallenge: nextChallenge,
          matchingChallengesCompleted: state.matchingChallengesCompleted + 1,
          capibaraState: 'thinking',
          speechBubbleMessage: getRandomPhrase(SPEECH_MATCHING_DONE),
        };
      }
      // Classic/speedrun: avanzar al siguiente nivel
      return {
        ...advanceToNextLevel(state),
        matchingChallengesCompleted: state.matchingChallengesCompleted + 1,
        speechBubbleMessage: getRandomPhrase(SPEECH_MATCHING_DONE),
      };
    }

    case 'MATH_TIMEOUT': {
      if (state.gameMode === 'practice_math') {
        const cfg = state._config || {};
        const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
        const nextChallenge = generateMathChallenge(state.level, mathOps, cfg.mathMaxValue ?? 20, cfg.mathMaxTable ?? 10, cfg.mathLevel ?? 'kids');
        return {
          ...state,
          screen: 'mathChallenge',
          currentMathChallenge: nextChallenge,
          capibaraState: 'thinking',
          mathChallengesTotal: state.mathChallengesTotal + 1,
          lastMathCoins: 0,
        };
      }
      return advanceToNextLevel(state);
    }

    case 'MATH_SKIP': {
      if (state.gameMode === 'practice_math') {
        const cfg = state._config || {};
        const mathOps = cfg.mathOps && cfg.mathOps.length > 0 ? cfg.mathOps : undefined;
        const nextChallenge = generateMathChallenge(state.level, mathOps, cfg.mathMaxValue ?? 20, cfg.mathMaxTable ?? 10, cfg.mathLevel ?? 'kids');
        return {
          ...state,
          screen: 'mathChallenge',
          currentMathChallenge: nextChallenge,
          capibaraState: 'thinking',
          mathChallengesTotal: state.mathChallengesTotal + 1,
        };
      }
      return advanceToNextLevel(state);
    }

    case 'PAUSE_GAME': {
      if (state.screen !== 'playing') return state;
      return { ...state, screen: 'paused', screenBeforePause: 'playing' };
    }

    case 'RESUME_GAME': {
      if (state.screen !== 'paused') return state;
      return { ...state, screen: state.screenBeforePause || 'playing', screenBeforePause: null };
    }

    case 'EXIT_TO_MENU': {
      const exitHighScore = state.gameMode === 'practice'
        ? state.highScore
        : Math.max(state.highScore, state.coins);
      return {
        ...initialState,
        screen: 'start',
        highScore: exitHighScore,
        bestLevel: Math.max(state.bestLevel, state.level),
      };
    }

    case 'RESTART': {
      const restartHighScore = state.gameMode === 'practice'
        ? state.highScore
        : Math.max(state.highScore, state.coins);
      return {
        ...initialState,
        screen: 'start',
        highScore: restartHighScore,
        bestLevel: Math.max(state.bestLevel, state.level),
      };
    }

    case 'ADD_PENDING_ACHIEVEMENT': {
      return { ...state, pendingAchievements: [...state.pendingAchievements, action.payload] };
    }

    case 'DISMISS_ACHIEVEMENT': {
      return { ...state, pendingAchievements: state.pendingAchievements.slice(1) };
    }

    case 'SPEECH_BUBBLE_CLEAR': {
      return { ...state, speechBubbleMessage: null };
    }

    case 'DISMISS_TUTORIAL': {
      return { ...state, isFirstPlaythrough: false };
    }

    case 'RESET_TIMER': {
      if (!state.currentRecipe) return state;
      return { ...state, timeRemaining: state.currentRecipe.time * 10 };
    }

    case 'INIT_SESSION': {
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
