import { describe, it, expect } from 'vitest';
import { clamp, randomInt, shuffleArray } from './mathUtils.js';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns min when value equals min', () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it('returns max when value equals max', () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
    expect(clamp(-15, -10, -1)).toBe(-10);
    expect(clamp(0, -10, -1)).toBe(-1);
  });
});

describe('randomInt', () => {
  it('returns a value within the specified range', () => {
    for (let i = 0; i < 100; i++) {
      const result = randomInt(1, 10);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    }
  });

  it('returns the only value when min equals max', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('always returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const result = randomInt(0, 100);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

describe('shuffleArray', () => {
  it('returns a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffleArray(original);
    expect(result).toHaveLength(original.length);
    expect([...result].sort()).toEqual([...original].sort());
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
