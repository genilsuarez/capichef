import { describe, it, expect } from 'vitest';
import { applyDifficultyToRecipe, applyDifficultyToMath } from './difficultyUtils.js';

describe('applyDifficultyToRecipe', () => {
  const baseRecipe = { name: 'Ensalada Simple', ingredients: ['🥬', '🍅', '🥑'], time: 15 };

  it('adds 5 seconds on easy difficulty', () => {
    const result = applyDifficultyToRecipe(baseRecipe, { difficulty: 'easy' });
    expect(result.time).toBe(20);
    expect(result.name).toBe('Ensalada Simple');
    expect(result.ingredients).toEqual(['🥬', '🍅', '🥑']);
  });

  it('keeps time unchanged on normal difficulty', () => {
    const result = applyDifficultyToRecipe(baseRecipe, { difficulty: 'normal' });
    expect(result.time).toBe(15);
  });

  it('subtracts 2 seconds on hard difficulty', () => {
    const result = applyDifficultyToRecipe(baseRecipe, { difficulty: 'hard' });
    expect(result.time).toBe(13);
  });

  it('clamps minimum time to 5 seconds on hard', () => {
    const shortRecipe = { name: 'Quick', ingredients: ['🍅'], time: 6 };
    const result = applyDifficultyToRecipe(shortRecipe, { difficulty: 'hard' });
    expect(result.time).toBe(5);
  });

  it('does not mutate the original recipe', () => {
    const original = { name: 'Test', ingredients: ['🍅'], time: 10 };
    applyDifficultyToRecipe(original, { difficulty: 'easy' });
    expect(original.time).toBe(10);
  });

  it('returns recipe as-is when recipe is null', () => {
    expect(applyDifficultyToRecipe(null, { difficulty: 'easy' })).toBeNull();
  });

  it('returns recipe as-is when config is null', () => {
    expect(applyDifficultyToRecipe(baseRecipe, null)).toBe(baseRecipe);
  });
});

describe('applyDifficultyToMath', () => {
  const baseChallenge = {
    operand1: 7,
    operand2: 5,
    operation: '+',
    correctAnswer: 12,
    options: [10, 12, 14, 9],
    emoji1: '🍅',
    emoji2: '🧀',
    narrative: '¡Añadir ingredientes!',
    operationName: '¡Añadir ingredientes!',
  };

  it('returns challenge unchanged on normal difficulty', () => {
    const result = applyDifficultyToMath(baseChallenge, { difficulty: 'normal' });
    expect(result.options).toEqual(baseChallenge.options);
    expect(result.correctAnswer).toBe(12);
  });

  it('returns challenge unchanged on easy difficulty', () => {
    const result = applyDifficultyToMath(baseChallenge, { difficulty: 'easy' });
    expect(result.options).toEqual(baseChallenge.options);
  });

  it('amplifies wrong options on hard difficulty', () => {
    const result = applyDifficultyToMath(baseChallenge, { difficulty: 'hard' });
    expect(result.correctAnswer).toBe(12);
    expect(result.options).toContain(12);
    // Wrong options should be further from correct answer
    const wrongOptions = result.options.filter((o) => o !== 12);
    expect(wrongOptions).toHaveLength(3);
    wrongOptions.forEach((opt) => expect(opt).toBeGreaterThanOrEqual(0));
  });

  it('does not mutate the original challenge', () => {
    const original = { ...baseChallenge, options: [...baseChallenge.options] };
    applyDifficultyToMath(original, { difficulty: 'hard' });
    expect(original.options).toEqual(baseChallenge.options);
  });

  it('returns challenge as-is when challenge is null', () => {
    expect(applyDifficultyToMath(null, { difficulty: 'hard' })).toBeNull();
  });

  it('returns challenge as-is when config is null', () => {
    expect(applyDifficultyToMath(baseChallenge, null)).toBe(baseChallenge);
  });
});
