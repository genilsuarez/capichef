import { describe, it, expect } from 'vitest';
import { evaluateAchievements } from './achievements.js';

/**
 * Helper: builds a minimal gameState with overrides.
 */
function makeGameState(overrides = {}) {
  return {
    screen: 'playing',
    level: 1,
    lives: 3,
    coins: 0,
    combo: 0,
    dishesCompleted: 0,
    errorsInCurrentDish: 0,
    mathChallengesCorrect: 0,
    ...overrides,
  };
}

/**
 * Helper: builds a minimal profile with overrides.
 */
function makeProfile(overrides = {}) {
  return {
    unlockedAchievements: [],
    stats: { totalCoins: 0, totalDishes: 0 },
    ...overrides,
  };
}

describe('evaluateAchievements', () => {
  it('returns empty array when no conditions are met', () => {
    const result = evaluateAchievements(makeGameState(), makeProfile());
    expect(result).toEqual([]);
  });

  it('unlocks first_dish when dishesCompleted >= 1', () => {
    const result = evaluateAchievements(
      makeGameState({ dishesCompleted: 1 }),
      makeProfile()
    );
    expect(result).toContain('first_dish');
  });

  it('unlocks perfectionist when errorsInCurrentDish === 0 and screen is levelComplete', () => {
    const result = evaluateAchievements(
      makeGameState({ errorsInCurrentDish: 0, screen: 'levelComplete' }),
      makeProfile()
    );
    expect(result).toContain('perfectionist');
  });

  it('does NOT unlock perfectionist when screen is not levelComplete', () => {
    const result = evaluateAchievements(
      makeGameState({ errorsInCurrentDish: 0, screen: 'playing' }),
      makeProfile()
    );
    expect(result).not.toContain('perfectionist');
  });

  it('unlocks combo achievements at thresholds 3, 6, 10', () => {
    const r3 = evaluateAchievements(makeGameState({ combo: 3 }), makeProfile());
    expect(r3).toContain('combo_3');
    expect(r3).not.toContain('combo_6');

    const r6 = evaluateAchievements(makeGameState({ combo: 6 }), makeProfile());
    expect(r6).toContain('combo_3');
    expect(r6).toContain('combo_6');
    expect(r6).not.toContain('combo_10');

    const r10 = evaluateAchievements(makeGameState({ combo: 10 }), makeProfile());
    expect(r10).toContain('combo_10');
  });

  it('unlocks math_5 and math_10 at correct thresholds', () => {
    const r5 = evaluateAchievements(makeGameState({ mathChallengesCorrect: 5 }), makeProfile());
    expect(r5).toContain('math_5');
    expect(r5).not.toContain('math_10');

    const r10 = evaluateAchievements(makeGameState({ mathChallengesCorrect: 10 }), makeProfile());
    expect(r10).toContain('math_5');
    expect(r10).toContain('math_10');
  });

  it('unlocks level-based achievements at correct levels', () => {
    expect(evaluateAchievements(makeGameState({ level: 6 }), makeProfile())).toContain('night_cook');
    expect(evaluateAchievements(makeGameState({ level: 11 }), makeProfile())).toContain('sea_chef');
    expect(evaluateAchievements(makeGameState({ level: 16 }), makeProfile())).toContain('space_chef');
    expect(evaluateAchievements(makeGameState({ level: 5 }), makeProfile())).not.toContain('night_cook');
  });

  it('unlocks millionaire from profile historical totalCoins', () => {
    const result = evaluateAchievements(
      makeGameState(),
      makeProfile({ stats: { totalCoins: 1000, totalDishes: 0 } })
    );
    expect(result).toContain('millionaire');
  });

  it('unlocks master_chef from profile historical totalDishes', () => {
    const result = evaluateAchievements(
      makeGameState(),
      makeProfile({ stats: { totalCoins: 0, totalDishes: 50 } })
    );
    expect(result).toContain('master_chef');
  });

  it('does NOT return already unlocked achievements', () => {
    const result = evaluateAchievements(
      makeGameState({ dishesCompleted: 5, combo: 10 }),
      makeProfile({ unlockedAchievements: ['first_dish', 'combo_3', 'combo_10'] })
    );
    expect(result).not.toContain('first_dish');
    expect(result).not.toContain('combo_3');
    expect(result).not.toContain('combo_10');
    // combo_6 should still be returned since combo >= 6
    expect(result).toContain('combo_6');
  });

  it('returns multiple newly unlocked achievements at once', () => {
    const result = evaluateAchievements(
      makeGameState({ dishesCompleted: 1, combo: 3, level: 6, screen: 'levelComplete', errorsInCurrentDish: 0 }),
      makeProfile()
    );
    expect(result).toContain('first_dish');
    expect(result).toContain('perfectionist');
    expect(result).toContain('combo_3');
    expect(result).toContain('night_cook');
  });
});
