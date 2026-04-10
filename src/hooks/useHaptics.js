/**
 * useHaptics — Wrapper around the Vibration API with predefined patterns.
 *
 * Provides haptic feedback for game events. Gracefully degrades when
 * navigator.vibrate is not available (desktop browsers, restricted contexts).
 *
 * Patterns:
 *   correct:     50ms single pulse
 *   error:       [100, 50, 100] double pulse
 *   loseLife:    300ms long pulse
 *   achievement: [50, 50, 50, 50, 200] celebration pattern
 *
 * @module useHaptics
 */
import { useEffect, useRef, useCallback } from 'react';

/** @type {Record<string, number | number[]>} */
const PATTERNS = {
  correct: 50,
  error: [100, 50, 100],
  loseLife: 300,
  achievement: [50, 50, 50, 50, 200],
};

/**
 * Safely calls navigator.vibrate if available.
 * @param {number | number[]} pattern
 */
function vibrate(pattern) {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently ignore — API may throw in restricted contexts
  }
}

/**
 * Hook que observa cambios en gameState y dispara vibración háptica.
 *
 * @param {object} gameState - Estado actual del juego
 */
export function useHaptics(gameState) {
  const prevClickResult = useRef(null);
  const prevLives = useRef(gameState.lives);
  const prevAchievementsLen = useRef(
    gameState.pendingAchievements ? gameState.pendingAchievements.length : 0,
  );

  useEffect(() => {
    // Correct / incorrect ingredient click
    if (gameState.lastClickResult && gameState.lastClickResult !== prevClickResult.current) {
      if (gameState.lastClickResult === 'correct') {
        vibrate(PATTERNS.correct);
      } else if (gameState.lastClickResult === 'incorrect') {
        vibrate(PATTERNS.error);
      }
    }
    prevClickResult.current = gameState.lastClickResult;

    // Lost a life
    if (gameState.lives < prevLives.current) {
      vibrate(PATTERNS.loseLife);
    }
    prevLives.current = gameState.lives;

    // New achievement unlocked
    const currentAchLen = gameState.pendingAchievements
      ? gameState.pendingAchievements.length
      : 0;
    if (currentAchLen > prevAchievementsLen.current) {
      vibrate(PATTERNS.achievement);
    }
    prevAchievementsLen.current = currentAchLen;
  }, [
    gameState.lastClickResult,
    gameState.lives,
    gameState.pendingAchievements,
  ]);
}

/**
 * Returns individual vibration functions for imperative use.
 *
 * @returns {{ vibrateCorrect: () => void, vibrateError: () => void, vibrateLoseLife: () => void, vibrateAchievement: () => void }}
 */
export function useHapticActions() {
  const vibrateCorrect = useCallback(() => vibrate(PATTERNS.correct), []);
  const vibrateError = useCallback(() => vibrate(PATTERNS.error), []);
  const vibrateLoseLife = useCallback(() => vibrate(PATTERNS.loseLife), []);
  const vibrateAchievement = useCallback(() => vibrate(PATTERNS.achievement), []);

  return { vibrateCorrect, vibrateError, vibrateLoseLife, vibrateAchievement };
}
