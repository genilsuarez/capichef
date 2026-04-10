/**
 * useTimer — Encapsulates the 100ms game timer interval.
 *
 * Dispatches TIMER_TICK every 100ms while screen === 'playing' and
 * timeRemaining > 0. Dispatches TIME_UP when the timer reaches 0.
 * Automatically pauses when screen !== 'playing' and cleans up on unmount.
 *
 * @module useTimer
 */
import { useEffect, useRef } from 'react';

/**
 * Hook que gestiona el timer del juego.
 *
 * @param {object} gameState - Estado actual del juego (necesita screen y timeRemaining)
 * @param {Function} dispatch - Función dispatch del gameReducer
 * @param {object} [options]
 * @param {() => void} [options.onExpire] - Callback opcional cuando el timer llega a 0
 */
export function useTimer(gameState, dispatch, options = {}) {
  const { onExpire } = options;
  const onExpireRef = useRef(onExpire);

  // Keep the callback ref fresh without re-running the effect
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Interval: tick every 100ms while playing
  useEffect(() => {
    if (gameState.screen !== 'playing') return;
    if (gameState.timeRemaining <= 0) return;

    const intervalId = setInterval(() => {
      dispatch({ type: 'TIMER_TICK' });
    }, 100);

    return () => clearInterval(intervalId);
  }, [gameState.screen, gameState.timeRemaining, dispatch]);

  // Detect expiry
  useEffect(() => {
    if (gameState.screen === 'playing' && gameState.timeRemaining <= 0) {
      dispatch({ type: 'TIME_UP' });
      if (onExpireRef.current) {
        onExpireRef.current();
      }
    }
  }, [gameState.screen, gameState.timeRemaining, dispatch]);
}
