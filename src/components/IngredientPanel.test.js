import { describe, it, expect } from 'vitest';
import { INGREDIENT_POOL } from '../state/recipes.js';

/**
 * Unit tests for IngredientPanel helper logic.
 * Component rendering tests will be added in task 20 when @testing-library/react is available.
 */

// Replicate the lookup map used in the component
const EMOJI_TO_NAME = new Map(
  INGREDIENT_POOL.map((item) => [item.emoji, item.name])
);

function getIngredientName(emoji) {
  return EMOJI_TO_NAME.get(emoji) || emoji;
}

describe('IngredientPanel — getIngredientName', () => {
  it('returns the correct name for each ingredient emoji', () => {
    expect(getIngredientName('🍅')).toBe('Tomate');
    expect(getIngredientName('🧅')).toBe('Cebolla');
    expect(getIngredientName('🥩')).toBe('Carne');
    expect(getIngredientName('🧀')).toBe('Queso');
    expect(getIngredientName('🍗')).toBe('Pollo');
  });

  it('returns the emoji itself for unknown ingredients', () => {
    expect(getIngredientName('🍕')).toBe('🍕');
    // 🌽 is now in the pool, so use a truly unknown emoji
    expect(getIngredientName('🎸')).toBe('🎸');
  });

  it('maps all pool ingredients', () => {
    for (const { emoji, name } of INGREDIENT_POOL) {
      expect(getIngredientName(emoji)).toBe(name);
    }
  });
});

describe('IngredientPanel — aria-label format', () => {
  it('produces correct aria-label string for each ingredient', () => {
    for (const { emoji, name } of INGREDIENT_POOL) {
      const label = `Ingrediente: ${getIngredientName(emoji)}`;
      expect(label).toBe(`Ingrediente: ${name}`);
    }
  });
});
