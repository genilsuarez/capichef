/**
 * Clipboard Service for CapiChef
 *
 * Genera texto de compartir y copia al portapapeles.
 * Usa Clipboard API con fallback graceful.
 * Nunca lanza excepciones.
 */

/**
 * Generate the share text for a completed game.
 * @param {number} level - Level reached
 * @param {number} coins - Total coins earned
 * @param {number} mathAccuracy - Math accuracy percentage (0-100)
 * @returns {string} Formatted share text
 */
export function generateShareText(level, coins, mathAccuracy) {
  return `¡Jugué CapiChef! 🦫👨‍🍳 Llegué al nivel ${level}, gané ${coins} monedas y respondí ${mathAccuracy}% de las matemáticas. ¿Puedes superarme?`;
}

/**
 * Copy text to the clipboard using the Clipboard API.
 * Falls back gracefully if the API is not available.
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} true if copied successfully, false otherwise
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
