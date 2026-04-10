/**
 * useAchievements — Evaluates achievements after each gameState change.
 *
 * Imports evaluateAchievements from state/achievements.js and dispatches
 * UNLOCK_ACHIEVEMENT to the appReducer when new achievements are detected.
 *
 * @module useAchievements
 */
import { useEffect, useRef } from 'react';
import { evaluateAchievements } from '../state/achievements.js';

/**
 * Hook que evalúa logros tras cada cambio de gameState y despacha
 * UNLOCK_ACHIEVEMENT al appReducer si hay logros nuevos.
 *
 * @param {object} gameState - Estado actual del juego (gameReducer)
 * @param {object} appState - Estado persistente de la app (appReducer)
 * @param {Function} appDispatch - Dispatch del appReducer
 */
export function useAchievements(gameState, appState, appDispatch) {
  // Track the previous screen to only evaluate on meaningful transitions
  const prevScreen = useRef(gameState.screen);

  useEffect(() => {
    // Evaluate achievements on screen transitions that matter:
    // levelComplete, gameOver, mathChallenge (after answering)
    const meaningfulScreens = ['levelComplete', 'gameOver', 'mathChallenge', 'playing'];
    const screenChanged = gameState.screen !== prevScreen.current;
    prevScreen.current = gameState.screen;

    if (!screenChanged && !meaningfulScreens.includes(gameState.screen)) {
      return;
    }

    const newAchievements = evaluateAchievements(gameState, appState.profile);

    for (const achievementId of newAchievements) {
      appDispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId });
    }
  }, [
    gameState.screen,
    gameState.level,
    gameState.combo,
    gameState.dishesCompleted,
    gameState.mathChallengesCorrect,
    gameState.coins,
    appState.profile,
    appDispatch,
  ]);
}
