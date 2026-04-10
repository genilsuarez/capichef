/**
 * Analytics Service for CapiChef (Stub)
 *
 * Stub de tracking de eventos. Puede implementarse con
 * un servicio real de analytics en el futuro.
 * Nunca lanza excepciones ni bloquea.
 *
 * Eventos soportados:
 * - game_start
 * - level_complete
 * - game_over
 * - achievement_unlocked
 * - math_answered
 */

/**
 * Track an analytics event.
 * @param {string} eventName - Name of the event (e.g. 'game_start', 'level_complete')
 * @param {Record<string, unknown>} [data] - Optional event data
 */
export function trackEvent(eventName, data) {
  try {
    // Stub: log to console in development only
    if (import.meta.env?.DEV) {
      console.debug(`[CapiChef Analytics] ${eventName}`, data || '');
    }
  } catch {
    // silent — analytics should never break the app
  }
}
