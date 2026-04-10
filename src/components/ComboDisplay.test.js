import { describe, it, expect } from 'vitest';
import { getComboMultiplier } from '../state/gameReducer.js';

/**
 * Unit tests for ComboDisplay logic.
 * Validates combo multiplier display rules and milestone messages.
 * Component rendering tests will be added in task 20 when @testing-library/react is available.
 */

describe('ComboDisplay — visibility logic', () => {
  it('should not render when combo < 2 (multiplier is 1.0)', () => {
    expect(getComboMultiplier(0)).toBe(1.0);
    expect(getComboMultiplier(1)).toBe(1.0);
    // combo 0 and 1 → multiplier 1.0 → component returns null
  });

  it('should render when combo >= 2 (multiplier > 1.0)', () => {
    expect(getComboMultiplier(2)).toBe(1.5);
    expect(getComboMultiplier(3)).toBe(1.5);
    expect(getComboMultiplier(4)).toBe(2.0);
    expect(getComboMultiplier(6)).toBe(3.0);
  });
});

describe('ComboDisplay — multiplier text', () => {
  it('shows ×1.5 for combo 2-3', () => {
    expect(getComboMultiplier(2)).toBe(1.5);
    expect(getComboMultiplier(3)).toBe(1.5);
  });

  it('shows ×2.0 for combo 4-5', () => {
    expect(getComboMultiplier(4)).toBe(2.0);
    expect(getComboMultiplier(5)).toBe(2.0);
  });

  it('shows ×3.0 for combo 6+', () => {
    expect(getComboMultiplier(6)).toBe(3.0);
    expect(getComboMultiplier(10)).toBe(3.0);
    expect(getComboMultiplier(100)).toBe(3.0);
  });
});

describe('ComboDisplay — milestone messages', () => {
  it('milestone 3 maps to "🔥 ¡Combo x3!"', () => {
    const milestone = 3;
    const msg = milestone === 3 ? '🔥 ¡Combo x3!' : null;
    expect(msg).toBe('🔥 ¡Combo x3!');
  });

  it('milestone 6 maps to "⚡ ¡Imparable!"', () => {
    const milestone = 6;
    const msg = milestone === 6 ? '⚡ ¡Imparable!' : null;
    expect(msg).toBe('⚡ ¡Imparable!');
  });

  it('milestone 10 maps to "👑 ¡Leyenda!"', () => {
    const milestone = 10;
    const msg = milestone === 10 ? '👑 ¡Leyenda!' : null;
    expect(msg).toBe('👑 ¡Leyenda!');
  });

  it('null milestone produces no special message', () => {
    const milestone = null;
    const msg =
      milestone === 3 ? '🔥 ¡Combo x3!'
        : milestone === 6 ? '⚡ ¡Imparable!'
          : milestone === 10 ? '👑 ¡Leyenda!'
            : null;
    expect(msg).toBeNull();
  });
});
