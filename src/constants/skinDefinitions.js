/**
 * Definiciones de las 6 skins del capibara en CapiChef.
 *
 * Cada skin tiene un id, emoji, nombre y condición de desbloqueo.
 * Las primeras 4 están disponibles desde el inicio; las últimas 2
 * requieren desbloqueo por progresión.
 *
 * @module skinDefinitions
 */

/**
 * @typedef {Object} SkinDefinition
 * @property {string} id - Identificador único de la skin
 * @property {string} emoji - Emoji representativo de la skin
 * @property {string} name - Nombre visible de la skin
 * @property {string} unlockCondition - Condición legible de desbloqueo
 * @property {boolean} isLockedByDefault - Si requiere desbloqueo
 */

/**
 * Array inmutable con las 12 skins disponibles.
 *
 * Condiciones de desbloqueo:
 * - Las primeras 4 están disponibles desde el inicio
 * - Las siguientes 8 requieren progresión creciente
 *
 * @type {ReadonlyArray<SkinDefinition>}
 */
export const SKIN_DEFINITIONS = Object.freeze([
  // — Skins base (desbloqueadas desde el inicio) —
  {
    id: 'classic',
    emoji: '🦫',
    name: 'Chef Clásico',
    unlockCondition: 'Disponible desde el inicio',
    isLockedByDefault: false,
  },
  {
    id: 'elegant',
    emoji: '🦫🎩',
    name: 'Chef Elegante',
    unlockCondition: 'Disponible desde el inicio',
    isLockedByDefault: false,
  },

  // — Skins de progresión (requieren desbloqueo) —
  {
    id: 'mexican',
    emoji: '🦫🌮',
    name: 'Chef Mexicano',
    unlockCondition: 'Completar 1 plato',
    isLockedByDefault: true,
  },
  {
    id: 'japanese',
    emoji: '🦫🍣',
    name: 'Chef Japonés',
    unlockCondition: 'Jugar 2 partidas',
    isLockedByDefault: true,
  },
  {
    id: 'pirate',
    emoji: '🦫🏴‍☠️',
    name: 'Chef Pirata',
    unlockCondition: 'Completar 5 platos',
    isLockedByDefault: true,
  },
  {
    id: 'cowboy',
    emoji: '🦫🤠',
    name: 'Chef Vaquero',
    unlockCondition: 'Jugar 5 partidas',
    isLockedByDefault: true,
  },
  {
    id: 'wizard',
    emoji: '🦫🧙',
    name: 'Chef Mago',
    unlockCondition: 'Acertar 10 matemáticas',
    isLockedByDefault: true,
  },
  {
    id: 'space',
    emoji: '🦫🚀',
    name: 'Chef Espacial',
    unlockCondition: 'Llegar al nivel 10',
    isLockedByDefault: true,
  },
  {
    id: 'ninja',
    emoji: '🦫🥷',
    name: 'Chef Ninja',
    unlockCondition: 'Alcanzar combo x15',
    isLockedByDefault: true,
  },
  {
    id: 'viking',
    emoji: '🦫⚔️',
    name: 'Chef Vikingo',
    unlockCondition: 'Llegar al nivel 20',
    isLockedByDefault: true,
  },
  {
    id: 'scientist',
    emoji: '🦫🔬',
    name: 'Chef Científico',
    unlockCondition: '80% precisión en matemáticas (mín. 20)',
    isLockedByDefault: true,
  },
  {
    id: 'legendary',
    emoji: '🦫👑',
    name: 'Chef Legendario',
    unlockCondition: 'Ganar 500 monedas en total',
    isLockedByDefault: true,
  },
]);
