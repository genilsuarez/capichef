import { describe, it, expect } from 'vitest';
import {
  INGREDIENT_POOL,
  FIXED_RECIPES,
  shuffleArray,
  generateRandomRecipe,
  generateDistractors,
} from './recipes.js';

describe('INGREDIENT_POOL', () => {
  it('contains exactly 16 ingredients', () => {
    expect(INGREDIENT_POOL).toHaveLength(16);
  });

  it('each ingredient has emoji and name', () => {
    for (const ing of INGREDIENT_POOL) {
      expect(typeof ing.emoji).toBe('string');
      expect(typeof ing.name).toBe('string');
      expect(ing.emoji.length).toBeGreaterThan(0);
      expect(ing.name.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate emojis', () => {
    const emojis = INGREDIENT_POOL.map((i) => i.emoji);
    expect(new Set(emojis).size).toBe(16);
  });
});

describe('FIXED_RECIPES', () => {
  it('contains exactly 5 recipes', () => {
    expect(FIXED_RECIPES).toHaveLength(5);
  });

  it('level 1: Ensalada Simple — 3 ingredients, 15s', () => {
    const r = FIXED_RECIPES[0];
    expect(r.name).toBe('Ensalada Simple');
    expect(r.ingredients).toEqual(['🥬', '🍅', '🥑']);
    expect(r.time).toBe(15);
  });

  it('level 2: Arroz con Pollo — 4 ingredients, 14s', () => {
    const r = FIXED_RECIPES[1];
    expect(r.name).toBe('Arroz con Pollo');
    expect(r.ingredients).toEqual(['🍚', '🍗', '🧅', '🧄']);
    expect(r.time).toBe(14);
  });

  it('level 3: Pasta Capibara — 5 ingredients, 13s', () => {
    const r = FIXED_RECIPES[2];
    expect(r.name).toBe('Pasta Capibara');
    expect(r.ingredients).toEqual(['🍝', '🍅', '🧀', '🧄', '🌶️']);
    expect(r.time).toBe(13);
  });

  it('level 4: Sushi Roll — 5 ingredients, 12s', () => {
    const r = FIXED_RECIPES[3];
    expect(r.name).toBe('Sushi Roll');
    expect(r.ingredients).toEqual(['🍚', '🐟', '🥑', '🧅', '🍋']);
    expect(r.time).toBe(12);
  });

  it('level 5: CapiBurger Deluxe — 6 ingredients, 11s', () => {
    const r = FIXED_RECIPES[4];
    expect(r.name).toBe('CapiBurger Deluxe');
    expect(r.ingredients).toEqual(['🥖', '🥩', '🧀', '🥬', '🍅', '🧅']);
    expect(r.time).toBe(11);
  });

  it('all recipe ingredients come from the pool', () => {
    const poolEmojis = new Set(INGREDIENT_POOL.map((i) => i.emoji));
    for (const recipe of FIXED_RECIPES) {
      for (const ing of recipe.ingredients) {
        expect(poolEmojis.has(ing)).toBe(true);
      }
    }
  });
});

describe('shuffleArray', () => {
  it('returns a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result).toHaveLength(original.length);
    expect(result.sort()).toEqual(original.sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  it('returns empty array for empty input', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });
});

describe('generateRandomRecipe', () => {
  it('generates recipe with 5-7 ingredients for level 6+', () => {
    for (let i = 0; i < 20; i++) {
      const recipe = generateRandomRecipe(6, null);
      expect(recipe.ingredients.length).toBeGreaterThanOrEqual(5);
      expect(recipe.ingredients.length).toBeLessThanOrEqual(7);
    }
  });

  it('always has time = 10', () => {
    const recipe = generateRandomRecipe(8, null);
    expect(recipe.time).toBe(10);
  });

  it('name follows "Especial del Chef #[level]" format', () => {
    const recipe = generateRandomRecipe(7, null);
    expect(recipe.name).toBe('Especial del Chef #7');
  });

  it('ingredients are unique (no duplicates)', () => {
    for (let i = 0; i < 20; i++) {
      const recipe = generateRandomRecipe(10, null);
      const unique = new Set(recipe.ingredients);
      expect(unique.size).toBe(recipe.ingredients.length);
    }
  });

  it('all ingredients come from the pool', () => {
    const poolEmojis = new Set(INGREDIENT_POOL.map((i) => i.emoji));
    for (let i = 0; i < 20; i++) {
      const recipe = generateRandomRecipe(6, null);
      for (const ing of recipe.ingredients) {
        expect(poolEmojis.has(ing)).toBe(true);
      }
    }
  });

  it('does not repeat same ingredients as previous recipe', () => {
    const prev = {
      name: 'Prev',
      ingredients: ['🍅', '🧅', '🥩', '🧀', '🍳'],
      time: 10,
    };
    for (let i = 0; i < 30; i++) {
      const recipe = generateRandomRecipe(6, prev);
      const prevSet = new Set(prev.ingredients);
      const isSame =
        recipe.ingredients.length === prev.ingredients.length &&
        recipe.ingredients.every((ing) => prevSet.has(ing));
      expect(isSame).toBe(false);
    }
  });
});

describe('generateDistractors', () => {
  it('returns the requested number of distractors', () => {
    const recipe = ['🥬', '🍅', '🥑'];
    const distractors = generateDistractors(recipe, 7);
    expect(distractors).toHaveLength(7);
  });

  it('distractors do not include recipe ingredients', () => {
    const recipe = ['🥬', '🍅', '🥑'];
    const recipeSet = new Set(recipe);
    const distractors = generateDistractors(recipe, 7);
    for (const d of distractors) {
      expect(recipeSet.has(d)).toBe(false);
    }
  });

  it('distractors come from the pool', () => {
    const poolEmojis = new Set(INGREDIENT_POOL.map((i) => i.emoji));
    const recipe = ['🍚', '🍗', '🧅', '🧄'];
    const distractors = generateDistractors(recipe, 6);
    for (const d of distractors) {
      expect(poolEmojis.has(d)).toBe(true);
    }
  });

  it('recipe + distractors = 10 for all fixed recipes', () => {
    for (const recipe of FIXED_RECIPES) {
      const count = 10 - recipe.ingredients.length;
      const distractors = generateDistractors(recipe.ingredients, count);
      const total = [...recipe.ingredients, ...distractors];
      expect(total).toHaveLength(10);
      expect(new Set(total).size).toBe(10);
    }
  });
});
