import { describe, it, expect, beforeEach } from 'vitest';
import {
  initialState,
  gameReducer,
  calculateCoins,
  getComboMultiplier,
} from './gameReducer.js';

describe('getComboMultiplier', () => {
  it('returns 1.0 for combo 0', () => {
    expect(getComboMultiplier(0)).toBe(1.0);
  });

  it('returns 1.0 for combo 1', () => {
    expect(getComboMultiplier(1)).toBe(1.0);
  });

  it('returns 1.5 for combo 2', () => {
    expect(getComboMultiplier(2)).toBe(1.5);
  });

  it('returns 1.5 for combo 3', () => {
    expect(getComboMultiplier(3)).toBe(1.5);
  });

  it('returns 2.0 for combo 4', () => {
    expect(getComboMultiplier(4)).toBe(2.0);
  });

  it('returns 2.0 for combo 5', () => {
    expect(getComboMultiplier(5)).toBe(2.0);
  });

  it('returns 3.0 for combo 6', () => {
    expect(getComboMultiplier(6)).toBe(3.0);
  });

  it('returns 3.0 for combo 10', () => {
    expect(getComboMultiplier(10)).toBe(3.0);
  });
});

describe('calculateCoins', () => {
  it('calculates base coins as 10 * level', () => {
    const result = calculateCoins(3, 100, 150, 1, 0);
    expect(result.base).toBe(30);
  });

  it('gives speed bonus when time used < 50% of total', () => {
    const result = calculateCoins(2, 40, 140, 0, 0);
    expect(result.speedBonus).toBe(10); // base=20, 50% = 10
  });

  it('gives no speed bonus when time used >= 50% of total', () => {
    const result = calculateCoins(2, 70, 140, 0, 0);
    expect(result.speedBonus).toBe(0);
  });

  it('gives perfect bonus when errors === 0', () => {
    const result = calculateCoins(5, 100, 150, 0, 0);
    expect(result.perfectBonus).toBe(10); // base=50, 20% = 10
  });

  it('gives no perfect bonus when errors > 0', () => {
    const result = calculateCoins(5, 100, 150, 1, 0);
    expect(result.perfectBonus).toBe(0);
  });

  it('applies combo multiplier to total', () => {
    // level=1, fast, perfect, combo=2 → base=10, speed=5, perfect=2, mult=1.5
    const result = calculateCoins(1, 10, 150, 0, 2);
    expect(result.comboMultiplier).toBe(1.5);
    expect(result.total).toBe(Math.floor((10 + 5 + 2) * 1.5));
  });

  it('floors the total', () => {
    // level=1, no speed, no perfect, combo=2 → base=10, mult=1.5 → 15
    const result = calculateCoins(1, 100, 150, 1, 2);
    expect(result.total).toBe(Math.floor(10 * 1.5));
  });

  it('applies x2 mode multiplier for speedrun', () => {
    const classic = calculateCoins(1, 100, 150, 1, 0, 'classic');
    const speedrun = calculateCoins(1, 100, 150, 1, 0, 'speedrun');
    expect(speedrun.modeMultiplier).toBe(2);
    expect(speedrun.total).toBe(classic.total * 2);
  });
});

describe('initialState', () => {
  it('has all required fields', () => {
    expect(initialState.screen).toBe('start');
    expect(initialState.gameMode).toBe('classic');
    expect(initialState.level).toBe(1);
    expect(initialState.lives).toBe(3);
    expect(initialState.maxErrors).toBe(3);
    expect(initialState.coins).toBe(0);
    expect(initialState.combo).toBe(0);
    expect(initialState.bestCombo).toBe(0);
    expect(initialState.highScore).toBe(0);
    expect(initialState.dishesCompleted).toBe(0);
    expect(initialState.gameStartTime).toBeNull();
    expect(initialState.currentRecipe).toBeNull();
    expect(initialState.ingredientProgress).toBe(0);
    expect(initialState.errorsInCurrentDish).toBe(0);
    expect(initialState.consecutiveErrorsWithoutHit).toBe(0);
    expect(initialState.timeRemaining).toBe(0);
    expect(initialState.availableIngredients).toEqual([]);
    expect(initialState.newIngredientsThisSession).toEqual([]);
    expect(initialState.timeBonusApplied).toBe(0);
    expect(initialState.consecutiveTimerDeaths).toBe(0);
    expect(initialState.capibaraState).toBe('idle');
    expect(initialState.lastClickResult).toBeNull();
    expect(initialState.lastClickedIngredient).toBeNull();
    expect(initialState.coinsEarnedThisLevel).toBeNull();
    expect(initialState.currentTheme).toBe('day');
    expect(initialState.speechBubbleMessage).toBeNull();
    expect(initialState.currentComboMilestone).toBeNull();
    expect(initialState.timePenaltySeconds).toBe(0);
    expect(initialState.isFirstPlaythrough).toBe(true);
    expect(initialState.mathChallengesCorrect).toBe(0);
    expect(initialState.mathChallengesTotal).toBe(0);
    expect(initialState.currentMathChallenge).toBeNull();
    expect(initialState.pendingAchievements).toEqual([]);
    expect(initialState.screenBeforePause).toBeNull();
  });
});

describe('gameReducer', () => {
  describe('START_GAME', () => {
    it('resets state and starts playing at level 1', () => {
      const state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      expect(state.screen).toBe('playing');
      expect(state.level).toBe(1);
      expect(state.lives).toBe(3);
      expect(state.coins).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.gameMode).toBe('classic');
      expect(state.currentRecipe).not.toBeNull();
      expect(state.currentRecipe.name).toBe('Ensalada Simple');
      expect(state.availableIngredients).toHaveLength(10);
      expect(state.timeRemaining).toBe(150); // 15s * 10
      expect(state.capibaraState).toBe('idle');
    });

    it('preserves highScore from previous state', () => {
      const prevState = { ...initialState, highScore: 500 };
      const state = gameReducer(prevState, { type: 'START_GAME', payload: 'classic' });
      expect(state.highScore).toBe(500);
    });
  });

  describe('CLICK_INGREDIENT', () => {
    let playingState;

    beforeEach(() => {
      playingState = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    });

    it('advances progress on correct ingredient', () => {
      const expected = playingState.currentRecipe.ingredients[0];
      const state = gameReducer(playingState, { type: 'CLICK_INGREDIENT', payload: expected });
      expect(state.ingredientProgress).toBe(1);
      expect(state.capibaraState).toBe('cooking');
      expect(state.lastClickResult).toBe('correct');
      // Ingrediente queda en el panel pero marcado como usado
      expect(state.availableIngredients).toContain(expected);
      expect(state.usedIngredients).toContain(expected);
      expect(state.consecutiveErrorsWithoutHit).toBe(0);
    });

    it('increments errors on incorrect ingredient', () => {
      const expected = playingState.currentRecipe.ingredients[0];
      // Pick a distractor
      const wrong = playingState.availableIngredients.find((i) => i !== expected);
      const state = gameReducer(playingState, { type: 'CLICK_INGREDIENT', payload: wrong });
      expect(state.errorsInCurrentDish).toBe(1);
      expect(state.ingredientProgress).toBe(0);
      expect(state.capibaraState).toBe('error');
      expect(state.lastClickResult).toBe('incorrect');
    });

    it('treats correct ingredient out of order as incorrect', () => {
      // The second ingredient clicked first should be treated as incorrect
      const secondIngredient = playingState.currentRecipe.ingredients[1];
      const state = gameReducer(playingState, { type: 'CLICK_INGREDIENT', payload: secondIngredient });
      expect(state.errorsInCurrentDish).toBe(1);
      expect(state.ingredientProgress).toBe(0);
      expect(state.capibaraState).toBe('error');
    });

    it('completes recipe when all ingredients are clicked in order', () => {
      let state = playingState;
      for (const ingredient of state.currentRecipe.ingredients) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: ingredient });
      }
      expect(state.screen).toBe('levelComplete');
      expect(state.capibaraState).toBe('done');
      expect(state.combo).toBe(1);
      expect(state.dishesCompleted).toBe(1);
      expect(state.coinsEarnedThisLevel).not.toBeNull();
      expect(state.coinsEarnedThisLevel.total).toBeGreaterThan(0);
    });

    it('loses life after maxErrors incorrect clicks', () => {
      let state = playingState;
      const wrong = state.availableIngredients.find(
        (i) => !state.currentRecipe.ingredients.includes(i)
      );
      for (let i = 0; i < 3; i++) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: wrong });
      }
      expect(state.lives).toBe(2);
      expect(state.errorsInCurrentDish).toBe(0);
      expect(state.ingredientProgress).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.timeRemaining).toBe(150); // reset to full
    });

    it('game over when last life is lost from errors', () => {
      let state = { ...playingState, lives: 1 };
      const wrong = state.availableIngredients.find(
        (i) => !state.currentRecipe.ingredients.includes(i)
      );
      for (let i = 0; i < 3; i++) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: wrong });
      }
      expect(state.screen).toBe('gameOver');
      expect(state.lives).toBe(0);
      expect(state.capibaraState).toBe('gameover');
    });

    it('ignores clicks when not playing', () => {
      const startState = { ...initialState, screen: 'start' };
      const state = gameReducer(startState, { type: 'CLICK_INGREDIENT', payload: '🍅' });
      expect(state).toBe(startState);
    });
  });

  describe('TIMER_TICK', () => {
    it('decrements timeRemaining by 1 when playing', () => {
      const state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      const ticked = gameReducer(state, { type: 'TIMER_TICK' });
      expect(ticked.timeRemaining).toBe(state.timeRemaining - 1);
    });

    it('does not decrement when not playing', () => {
      const state = { ...initialState, screen: 'levelComplete', timeRemaining: 100 };
      const ticked = gameReducer(state, { type: 'TIMER_TICK' });
      expect(ticked.timeRemaining).toBe(100);
    });
  });

  describe('TIME_UP', () => {
    it('loses a life and resets the level', () => {
      const state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      const result = gameReducer(state, { type: 'TIME_UP' });
      expect(result.lives).toBe(2);
      expect(result.errorsInCurrentDish).toBe(0);
      expect(result.timeRemaining).toBe(150);
      expect(result.combo).toBe(0);
    });

    it('triggers game over when last life is lost', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, lives: 1 };
      const result = gameReducer(state, { type: 'TIME_UP' });
      expect(result.screen).toBe('gameOver');
      expect(result.lives).toBe(0);
    });
  });

  describe('NEXT_LEVEL', () => {
    it('advances to the next level with a new recipe', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      const result = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(result.level).toBe(2);
      expect(result.screen).toBe('playing');
      expect(result.currentRecipe.name).toBe('Arroz con Pollo');
      expect(result.ingredientProgress).toBe(0);
      expect(result.errorsInCurrentDish).toBe(0);
      expect(result.availableIngredients).toHaveLength(10);
    });

    it('recovers a life at level multiples of 5 when lives < 3', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, level: 4, lives: 2 };
      const result = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(result.level).toBe(5);
      expect(result.lives).toBe(3);
    });

    it('does not exceed 3 lives on recovery', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, level: 4, lives: 3 };
      const result = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(result.level).toBe(5);
      expect(result.lives).toBe(3);
    });
  });

  describe('SHOW_MATH', () => {
    it('generates a math challenge and changes screen', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      const result = gameReducer(state, { type: 'SHOW_MATH' });
      expect(result.screen).toBe('mathChallenge');
      expect(result.capibaraState).toBe('thinking');
      expect(result.currentMathChallenge).not.toBeNull();
      expect(result.currentMathChallenge.options).toHaveLength(3);
      expect(result.mathChallengesTotal).toBe(1);
    });
  });

  describe('ANSWER_MATH', () => {
    it('adds bonus coins for correct answer and advances level', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'SHOW_MATH' });
      const correctAnswer = state.currentMathChallenge.correctAnswer;
      const coinsBefore = state.coins;
      const result = gameReducer(state, { type: 'ANSWER_MATH', payload: correctAnswer });
      expect(result.coins).toBe(coinsBefore + 5 * state.level);
      expect(result.mathChallengesCorrect).toBe(1);
      expect(result.screen).toBe('playing');
      expect(result.level).toBe(2);
    });

    it('advances level without bonus for incorrect answer', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'SHOW_MATH' });
      const coinsBefore = state.coins;
      const result = gameReducer(state, { type: 'ANSWER_MATH', payload: -999 });
      expect(result.coins).toBe(coinsBefore);
      expect(result.mathChallengesCorrect).toBe(0);
      expect(result.screen).toBe('playing');
      expect(result.level).toBe(2);
    });
  });

  describe('MATH_TIMEOUT', () => {
    it('advances level without bonus', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'SHOW_MATH' });
      const coinsBefore = state.coins;
      const result = gameReducer(state, { type: 'MATH_TIMEOUT' });
      expect(result.coins).toBe(coinsBefore);
      expect(result.screen).toBe('playing');
      expect(result.level).toBe(2);
    });
  });

  describe('PAUSE_GAME / RESUME_GAME', () => {
    it('pauses and resumes correctly', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      const paused = gameReducer(state, { type: 'PAUSE_GAME' });
      expect(paused.screen).toBe('paused');
      expect(paused.screenBeforePause).toBe('playing');

      const resumed = gameReducer(paused, { type: 'RESUME_GAME' });
      expect(resumed.screen).toBe('playing');
      expect(resumed.screenBeforePause).toBeNull();
    });

    it('ignores PAUSE_GAME when not playing', () => {
      const state = { ...initialState, screen: 'start' };
      const result = gameReducer(state, { type: 'PAUSE_GAME' });
      expect(result.screen).toBe('start');
    });
  });

  describe('EXIT_TO_MENU', () => {
    it('returns to start screen preserving highScore', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, coins: 200, highScore: 100 };
      const result = gameReducer(state, { type: 'EXIT_TO_MENU' });
      expect(result.screen).toBe('start');
      expect(result.highScore).toBe(200);
    });
  });

  describe('RESTART', () => {
    it('returns to start screen preserving highScore', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, coins: 300, highScore: 150 };
      const result = gameReducer(state, { type: 'RESTART' });
      expect(result.screen).toBe('start');
      expect(result.highScore).toBe(300);
    });
  });

  describe('DISMISS_ACHIEVEMENT', () => {
    it('removes first achievement from pending list', () => {
      const state = { ...initialState, pendingAchievements: ['a', 'b', 'c'] };
      const result = gameReducer(state, { type: 'DISMISS_ACHIEVEMENT' });
      expect(result.pendingAchievements).toEqual(['b', 'c']);
    });
  });

  describe('SPEECH_BUBBLE_CLEAR', () => {
    it('clears speech bubble message', () => {
      const state = { ...initialState, speechBubbleMessage: 'Hello!' };
      const result = gameReducer(state, { type: 'SPEECH_BUBBLE_CLEAR' });
      expect(result.speechBubbleMessage).toBeNull();
    });
  });

  describe('Practice mode rules', () => {
    let practiceState;

    beforeEach(() => {
      practiceState = gameReducer(initialState, { type: 'START_GAME', payload: 'practice' });
    });

    it('sets gameMode to practice', () => {
      expect(practiceState.gameMode).toBe('practice');
    });

    it('TIMER_TICK does not decrement timeRemaining', () => {
      const ticked = gameReducer(practiceState, { type: 'TIMER_TICK' });
      expect(ticked.timeRemaining).toBe(practiceState.timeRemaining);
    });

    it('TIME_UP does not lose a life', () => {
      const result = gameReducer(practiceState, { type: 'TIME_UP' });
      expect(result.lives).toBe(3);
      expect(result.errorsInCurrentDish).toBe(0);
      expect(result.ingredientProgress).toBe(0);
    });

    it('maxErrors incorrect clicks do not lose a life', () => {
      let state = practiceState;
      const wrong = state.availableIngredients.find(
        (i) => !state.currentRecipe.ingredients.includes(i)
      );
      for (let i = 0; i < 3; i++) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: wrong });
      }
      expect(state.lives).toBe(3);
      expect(state.screen).toBe('playing');
      expect(state.errorsInCurrentDish).toBe(3);
    });

    it('RESTART does not update highScore', () => {
      const stateWithCoins = { ...practiceState, coins: 500, highScore: 100 };
      const result = gameReducer(stateWithCoins, { type: 'RESTART' });
      expect(result.highScore).toBe(100);
    });

    it('EXIT_TO_MENU does not update highScore', () => {
      const stateWithCoins = { ...practiceState, coins: 500, highScore: 100 };
      const result = gameReducer(stateWithCoins, { type: 'EXIT_TO_MENU' });
      expect(result.highScore).toBe(100);
    });

    it('math challenges still appear (SHOW_MATH works)', () => {
      const result = gameReducer(practiceState, { type: 'SHOW_MATH' });
      expect(result.screen).toBe('mathChallenge');
      expect(result.currentMathChallenge).not.toBeNull();
    });
  });

  describe('Speedrun mode rules', () => {
    let speedrunState;

    beforeEach(() => {
      speedrunState = gameReducer(initialState, { type: 'START_GAME', payload: 'speedrun' });
    });

    it('sets gameMode to speedrun', () => {
      expect(speedrunState.gameMode).toBe('speedrun');
    });

    it('reduces recipe time by 3s (min 5s) on START_GAME', () => {
      // Level 1 Ensalada Simple has 15s base → 15-3 = 12s
      expect(speedrunState.currentRecipe.time).toBe(12);
      expect(speedrunState.timeRemaining).toBe(120);
    });

    it('TIME_UP adds penalty time instead of losing life', () => {
      const result = gameReducer(speedrunState, { type: 'TIME_UP' });
      expect(result.lives).toBe(3);
      expect(result.timePenaltySeconds).toBe(3);
      expect(result.errorsInCurrentDish).toBe(0);
    });

    it('maxErrors incorrect clicks add penalty time instead of losing life', () => {
      let state = speedrunState;
      const wrong = state.availableIngredients.find(
        (i) => !state.currentRecipe.ingredients.includes(i)
      );
      for (let i = 0; i < 3; i++) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: wrong });
      }
      expect(state.lives).toBe(3);
      expect(state.timePenaltySeconds).toBe(3);
      expect(state.errorsInCurrentDish).toBe(0);
    });

    it('penalty time accumulates across multiple events', () => {
      let state = speedrunState;
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.timePenaltySeconds).toBe(3);
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.timePenaltySeconds).toBe(6);
    });

    it('coins are multiplied by 2 when completing a level', () => {
      let state = speedrunState;
      for (const ingredient of state.currentRecipe.ingredients) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: ingredient });
      }
      expect(state.coinsEarnedThisLevel.modeMultiplier).toBe(2);
      // base = 10*1 = 10, with x2 mode multiplier the total should be doubled
      expect(state.coinsEarnedThisLevel.total).toBeGreaterThanOrEqual(20);
    });

    it('NEXT_LEVEL reduces recipe time by 3s', () => {
      const result = gameReducer(speedrunState, { type: 'NEXT_LEVEL' });
      // Level 2 Arroz con Pollo has 14s base → 14-3 = 11s
      expect(result.currentRecipe.time).toBe(11);
    });

    it('timer still decrements in speedrun mode', () => {
      const ticked = gameReducer(speedrunState, { type: 'TIMER_TICK' });
      expect(ticked.timeRemaining).toBe(speedrunState.timeRemaining - 1);
    });
  });

  describe('Adaptive time difficulty (Req 22.1)', () => {
    it('increments consecutiveTimerDeaths on TIME_UP', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      expect(state.consecutiveTimerDeaths).toBe(0);
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.consecutiveTimerDeaths).toBe(1);
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.consecutiveTimerDeaths).toBe(2);
    });

    it('resets consecutiveTimerDeaths on correct ingredient click', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'TIME_UP' });
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.consecutiveTimerDeaths).toBe(2);
      const expected = state.currentRecipe.ingredients[0];
      state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: expected });
      expect(state.consecutiveTimerDeaths).toBe(0);
    });

    it('adds +2s to next level recipe time after 2 consecutive timer deaths', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      // Lose life by timer twice
      state = gameReducer(state, { type: 'TIME_UP' });
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.consecutiveTimerDeaths).toBe(2);
      expect(state.timeBonusApplied).toBe(0);
      // Advance to next level
      const result = gameReducer(state, { type: 'NEXT_LEVEL' });
      // Level 2 Arroz con Pollo has 14s base → 14+2 = 16s
      expect(result.currentRecipe.time).toBe(16);
      expect(result.timeBonusApplied).toBe(2);
    });

    it('caps total time bonus at +4s', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      // First round: 2 timer deaths → +2s
      state = gameReducer(state, { type: 'TIME_UP' });
      state = gameReducer(state, { type: 'TIME_UP' });
      state = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(state.timeBonusApplied).toBe(2);
      // Second round: 2 more timer deaths → +2s (total +4s)
      state = { ...state, consecutiveTimerDeaths: 2 };
      state = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(state.timeBonusApplied).toBe(4);
      // Third round: 2 more timer deaths → should NOT add more (already at +4s)
      state = { ...state, consecutiveTimerDeaths: 2 };
      const prevTime = state.currentRecipe.time;
      state = gameReducer(state, { type: 'NEXT_LEVEL' });
      expect(state.timeBonusApplied).toBe(4);
    });

    it('does not apply time bonus when consecutiveTimerDeaths < 2', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.consecutiveTimerDeaths).toBe(1);
      const result = gameReducer(state, { type: 'NEXT_LEVEL' });
      // Level 2 Arroz con Pollo has 14s base, no bonus
      expect(result.currentRecipe.time).toBe(14);
      expect(result.timeBonusApplied).toBe(0);
    });
  });

  describe('MATH_SKIP (Req 22.2)', () => {
    it('advances to next level without bonus', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'SHOW_MATH' });
      const coinsBefore = state.coins;
      const result = gameReducer(state, { type: 'MATH_SKIP' });
      expect(result.coins).toBe(coinsBefore);
      expect(result.screen).toBe('playing');
      expect(result.level).toBe(2);
    });

    it('does not increment mathChallengesCorrect', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = gameReducer(state, { type: 'SHOW_MATH' });
      const result = gameReducer(state, { type: 'MATH_SKIP' });
      expect(result.mathChallengesCorrect).toBe(0);
    });
  });

  describe('bestLevel tracking (Req 22.3)', () => {
    it('initialState has bestLevel 0', () => {
      expect(initialState.bestLevel).toBe(0);
    });

    it('updates bestLevel when completing a level', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      for (const ingredient of state.currentRecipe.ingredients) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: ingredient });
      }
      expect(state.bestLevel).toBe(1);
    });

    it('preserves bestLevel on RESTART', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      // Complete level 1
      for (const ingredient of state.currentRecipe.ingredients) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: ingredient });
      }
      state = gameReducer(state, { type: 'RESTART' });
      expect(state.bestLevel).toBe(1);
    });

    it('preserves bestLevel on EXIT_TO_MENU', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      for (const ingredient of state.currentRecipe.ingredients) {
        state = gameReducer(state, { type: 'CLICK_INGREDIENT', payload: ingredient });
      }
      state = gameReducer(state, { type: 'EXIT_TO_MENU' });
      expect(state.bestLevel).toBe(1);
    });

    it('preserves bestLevel on START_GAME', () => {
      let state = { ...initialState, bestLevel: 5 };
      state = gameReducer(state, { type: 'START_GAME', payload: 'classic' });
      expect(state.bestLevel).toBe(5);
    });

    it('updates bestLevel on game over', () => {
      let state = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
      state = { ...state, lives: 1, level: 7 };
      state = gameReducer(state, { type: 'TIME_UP' });
      expect(state.screen).toBe('gameOver');
      expect(state.bestLevel).toBe(7);
    });
  });
});
