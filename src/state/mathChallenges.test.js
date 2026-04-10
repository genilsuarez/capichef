import { describe, it, expect } from 'vitest';
import {
  generateMathChallenge,
  generateWrongOptions,
  generateMathExplanation,
  getMathNarrative,
} from './mathChallenges.js';
import { INGREDIENT_POOL } from './recipes.js';

describe('getMathNarrative', () => {
  it('returns cooking narrative for addition', () => {
    expect(getMathNarrative('+')).toBe('¡Añadir ingredientes!');
  });

  it('returns cooking narrative for subtraction', () => {
    expect(getMathNarrative('-')).toBe('¡Usar ingredientes!');
  });

  it('returns cooking narrative for multiplication', () => {
    expect(getMathNarrative('×')).toBe('¡Hacer porciones!');
  });
});

describe('generateWrongOptions', () => {
  it('returns exactly 2 options', () => {
    expect(generateWrongOptions(10)).toHaveLength(2);
  });

  it('no option equals the correct answer', () => {
    for (let i = 0; i < 30; i++) {
      const correct = Math.floor(Math.random() * 100);
      const options = generateWrongOptions(correct);
      for (const opt of options) {
        expect(opt).not.toBe(correct);
      }
    }
  });

  it('all options are non-negative', () => {
    // Test with small correct answers where negatives could appear
    for (const correct of [0, 1, 2, 3]) {
      for (let i = 0; i < 20; i++) {
        const options = generateWrongOptions(correct);
        for (const opt of options) {
          expect(opt).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('no duplicate options', () => {
    for (let i = 0; i < 30; i++) {
      const correct = Math.floor(Math.random() * 50);
      const options = generateWrongOptions(correct);
      expect(new Set(options).size).toBe(2);
    }
  });

  it('options are close to correct answer (within ±5 or reasonable fallback)', () => {
    for (let i = 0; i < 30; i++) {
      const correct = 10 + Math.floor(Math.random() * 40);
      const options = generateWrongOptions(correct);
      for (const opt of options) {
        expect(Math.abs(opt - correct)).toBeLessThanOrEqual(5);
      }
    }
  });
});

describe('generateMathExplanation', () => {
  it('generates explanation for addition', () => {
    const explanation = generateMathExplanation({
      operand1: 3, operand2: 4, operation: '+', correctAnswer: 7,
    });
    expect(explanation).toContain('3 + 4 = 7');
    expect(explanation).toContain('🦫');
  });

  it('generates explanation for subtraction', () => {
    const explanation = generateMathExplanation({
      operand1: 10, operand2: 3, operation: '-', correctAnswer: 7,
    });
    expect(explanation).toContain('10 - 3 = 7');
  });

  it('generates explanation for multiplication', () => {
    const explanation = generateMathExplanation({
      operand1: 5, operand2: 3, operation: '×', correctAnswer: 15,
    });
    expect(explanation).toContain('5 × 3 = 15');
  });
});

describe('generateMathChallenge', () => {
  const poolEmojis = new Set(INGREDIENT_POOL.map((i) => i.emoji));

  it('returns a complete MathChallenge object', () => {
    const challenge = generateMathChallenge(1);
    expect(challenge).toHaveProperty('operand1');
    expect(challenge).toHaveProperty('operand2');
    expect(challenge).toHaveProperty('operation');
    expect(challenge).toHaveProperty('correctAnswer');
    expect(challenge).toHaveProperty('options');
    expect(challenge).toHaveProperty('emoji1');
    expect(challenge).toHaveProperty('emoji2');
    expect(challenge).toHaveProperty('narrative');
    expect(challenge).toHaveProperty('operationName');
  });

  it('has exactly 3 options with no duplicates', () => {
    for (let i = 0; i < 30; i++) {
      const level = 1 + Math.floor(Math.random() * 10);
      const challenge = generateMathChallenge(level);
      expect(challenge.options).toHaveLength(3);
      expect(new Set(challenge.options).size).toBe(3);
    }
  });

  it('options include the correct answer', () => {
    for (let i = 0; i < 30; i++) {
      const level = 1 + Math.floor(Math.random() * 10);
      const challenge = generateMathChallenge(level);
      expect(challenge.options).toContain(challenge.correctAnswer);
    }
  });

  it('all options are non-negative', () => {
    for (let i = 0; i < 50; i++) {
      const level = 1 + Math.floor(Math.random() * 10);
      const challenge = generateMathChallenge(level);
      for (const opt of challenge.options) {
        expect(opt).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('correctAnswer matches the operation applied to operands', () => {
    for (let i = 0; i < 50; i++) {
      const level = 1 + Math.floor(Math.random() * 10);
      const challenge = generateMathChallenge(level);
      let expected;
      switch (challenge.operation) {
        case '+': expected = challenge.operand1 + challenge.operand2; break;
        case '-': expected = challenge.operand1 - challenge.operand2; break;
        case '×': expected = challenge.operand1 * challenge.operand2; break;
      }
      expect(challenge.correctAnswer).toBe(expected);
    }
  });

  it('uses cooking emojis from the ingredient pool', () => {
    for (let i = 0; i < 20; i++) {
      const challenge = generateMathChallenge(1 + Math.floor(Math.random() * 10));
      expect(poolEmojis.has(challenge.emoji1)).toBe(true);
      expect(poolEmojis.has(challenge.emoji2)).toBe(true);
    }
  });

  it('includes a cooking narrative', () => {
    const challenge = generateMathChallenge(1);
    expect(typeof challenge.narrative).toBe('string');
    expect(challenge.narrative.length).toBeGreaterThan(0);
    expect(challenge.operationName).toBe(challenge.narrative);
  });

  // Difficulty scaling tests
  describe('difficulty scaling', () => {
    it('levels 1-2: generates addition with operands 1-10', () => {
      for (let i = 0; i < 30; i++) {
        const level = Math.random() < 0.5 ? 1 : 2;
        const challenge = generateMathChallenge(level);
        expect(challenge.operation).toBe('+');
        expect(challenge.operand1).toBeGreaterThanOrEqual(1);
        expect(challenge.operand1).toBeLessThanOrEqual(10);
        expect(challenge.operand2).toBeGreaterThanOrEqual(1);
        expect(challenge.operand2).toBeLessThanOrEqual(10);
      }
    });

    it('levels 3-4: generates subtraction with operands 1-20, result >= 0', () => {
      for (let i = 0; i < 30; i++) {
        const level = Math.random() < 0.5 ? 3 : 4;
        const challenge = generateMathChallenge(level);
        expect(challenge.operation).toBe('-');
        expect(challenge.operand1).toBeGreaterThanOrEqual(1);
        expect(challenge.operand1).toBeLessThanOrEqual(20);
        expect(challenge.operand2).toBeGreaterThanOrEqual(1);
        expect(challenge.operand2).toBeLessThanOrEqual(20);
        expect(challenge.correctAnswer).toBeGreaterThanOrEqual(0);
      }
    });

    it('levels 5-6: generates multiplication with operands 1-10', () => {
      for (let i = 0; i < 30; i++) {
        const level = Math.random() < 0.5 ? 5 : 6;
        const challenge = generateMathChallenge(level);
        expect(challenge.operation).toBe('×');
        expect(challenge.operand1).toBeGreaterThanOrEqual(1);
        expect(challenge.operand1).toBeLessThanOrEqual(10);
        expect(challenge.operand2).toBeGreaterThanOrEqual(1);
        expect(challenge.operand2).toBeLessThanOrEqual(10);
      }
    });

    it('levels 7+: generates mixed operations with appropriate ranges', () => {
      const operations = new Set();
      for (let i = 0; i < 100; i++) {
        const level = 7 + Math.floor(Math.random() * 5);
        const challenge = generateMathChallenge(level);
        operations.add(challenge.operation);

        if (challenge.operation === '+' || challenge.operation === '-') {
          expect(challenge.operand1).toBeGreaterThanOrEqual(1);
          expect(challenge.operand1).toBeLessThanOrEqual(50);
          expect(challenge.operand2).toBeGreaterThanOrEqual(1);
          expect(challenge.operand2).toBeLessThanOrEqual(50);
        } else {
          expect(challenge.operand1).toBeGreaterThanOrEqual(1);
          expect(challenge.operand1).toBeLessThanOrEqual(12);
          expect(challenge.operand2).toBeGreaterThanOrEqual(1);
          expect(challenge.operand2).toBeLessThanOrEqual(12);
        }

        if (challenge.operation === '-') {
          expect(challenge.correctAnswer).toBeGreaterThanOrEqual(0);
        }
      }
      // Should have generated all 3 operation types over 100 iterations
      expect(operations.size).toBe(3);
    });
  });
});
