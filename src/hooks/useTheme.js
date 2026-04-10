/**
 * useTheme — Computes the visual theme based on the current level.
 *
 * Levels 1-5: 'day', 6-10: 'night', 11-15: 'underwater', 16+: 'space'.
 *
 * @module useTheme
 */
import { useMemo } from 'react';

/**
 * Calcula el tema visual según el nivel actual.
 *
 * @param {number} level - Nivel actual (1-based)
 * @returns {'day' | 'night' | 'underwater' | 'space'} Tema visual
 */
export function useTheme(level) {
  return useMemo(() => {
    if (level <= 5) return 'day';
    if (level <= 10) return 'night';
    if (level <= 15) return 'underwater';
    return 'space';
  }, [level]);
}
