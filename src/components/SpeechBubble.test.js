import { describe, it, expect } from 'vitest';
import {
  gameReducer,
  initialState,
  SPEECH_LEVEL_START,
  SPEECH_ERROR,
  SPEECH_MATH_CORRECT,
  getRandomPhrase,
} from '../state/gameReducer.js';

describe('getRandomPhrase', () => {
  it('returns a string from the given pool', () => {
    const pool = ['a', 'b', 'c'];
    const result = getRandomPhrase(pool);
    expect(pool).toContain(result);
  });

  it('returns the only element from a single-element pool', () => {
    expect(getRandomPhrase(['solo'])).toBe('solo');
  });
});

describe('Speech bubble phrase pools', () => {
  it('SPEECH_LEVEL_START has at least 3 phrases', () => {
    expect(SPEECH_LEVEL_START.length).toBeGreaterThanOrEqual(3);
  });

  it('SPEECH_ERROR has at least 3 phrases', () => {
    expect(SPEECH_ERROR.length).toBeGreaterThanOrEqual(3);
  });

  it('SPEECH_MATH_CORRECT has at least 3 phrases', () => {
    expect(SPEECH_MATH_CORRECT.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Speech bubble in gameReducer', () => {
  it('START_GAME sets a level-start speech bubble', () => {
    const result = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    expect(result.speechBubbleMessage).not.toBeNull();
    expect(SPEECH_LEVEL_START).toContain(result.speechBubbleMessage);
  });

  it('CLICK_INGREDIENT incorrect sets an error speech bubble', () => {
    // Set up a playing state with a recipe
    const playing = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    // Click a wrong ingredient (use one that's not the expected one)
    const expected = playing.currentRecipe.ingredients[0];
    const wrong = playing.availableIngredients.find((i) => i !== expected);
    if (!wrong) return; // safety — shouldn't happen with 10 ingredients

    const result = gameReducer(playing, { type: 'CLICK_INGREDIENT', payload: wrong });
    expect(result.speechBubbleMessage).not.toBeNull();
    expect(SPEECH_ERROR).toContain(result.speechBubbleMessage);
  });

  it('ANSWER_MATH correct sets a math-correct speech bubble', () => {
    // Set up a state in mathChallenge screen
    const playing = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    // Force into levelComplete then SHOW_MATH
    const withMath = gameReducer({
      ...playing,
      screen: 'levelComplete',
    }, { type: 'SHOW_MATH' });

    expect(withMath.currentMathChallenge).not.toBeNull();
    const correctAnswer = withMath.currentMathChallenge.correctAnswer;

    const result = gameReducer(withMath, { type: 'ANSWER_MATH', payload: correctAnswer });
    expect(result.speechBubbleMessage).not.toBeNull();
    expect(SPEECH_MATH_CORRECT).toContain(result.speechBubbleMessage);
  });

  it('SPEECH_BUBBLE_CLEAR clears the speech bubble', () => {
    const playing = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    expect(playing.speechBubbleMessage).not.toBeNull();

    const cleared = gameReducer(playing, { type: 'SPEECH_BUBBLE_CLEAR' });
    expect(cleared.speechBubbleMessage).toBeNull();
  });

  it('advanceToNextLevel (via NEXT_LEVEL) sets a level-start speech bubble', () => {
    const playing = gameReducer(initialState, { type: 'START_GAME', payload: 'classic' });
    const next = gameReducer(playing, { type: 'NEXT_LEVEL' });
    expect(next.speechBubbleMessage).not.toBeNull();
    expect(SPEECH_LEVEL_START).toContain(next.speechBubbleMessage);
  });
});
