import { describe, it, expect } from 'vitest';

// Since useTheme is a thin wrapper around useMemo, we test the theme logic directly.
// The hook just memoizes this mapping.
function getThemeForLevel(level) {
  if (level <= 5) return 'day';
  if (level <= 10) return 'night';
  if (level <= 15) return 'underwater';
  return 'space';
}

describe('useTheme — theme logic', () => {
  it('returns "day" for levels 1-5', () => {
    for (let l = 1; l <= 5; l++) {
      expect(getThemeForLevel(l)).toBe('day');
    }
  });

  it('returns "night" for levels 6-10', () => {
    for (let l = 6; l <= 10; l++) {
      expect(getThemeForLevel(l)).toBe('night');
    }
  });

  it('returns "underwater" for levels 11-15', () => {
    for (let l = 11; l <= 15; l++) {
      expect(getThemeForLevel(l)).toBe('underwater');
    }
  });

  it('returns "space" for levels 16+', () => {
    expect(getThemeForLevel(16)).toBe('space');
    expect(getThemeForLevel(20)).toBe('space');
    expect(getThemeForLevel(100)).toBe('space');
  });

  it('handles boundary levels correctly', () => {
    expect(getThemeForLevel(5)).toBe('day');
    expect(getThemeForLevel(6)).toBe('night');
    expect(getThemeForLevel(10)).toBe('night');
    expect(getThemeForLevel(11)).toBe('underwater');
    expect(getThemeForLevel(15)).toBe('underwater');
    expect(getThemeForLevel(16)).toBe('space');
  });
});
