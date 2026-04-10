/**
 * Definiciones de los 12 logros desbloqueables de CapiChef.
 *
 * Cada logro tiene un id único, nombre, emoji, descripción y
 * la condición legible de desbloqueo. La evaluación real se
 * implementa en src/state/achievements.js.
 *
 * @module achievementDefinitions
 */

/**
 * @typedef {Object} AchievementDefinition
 * @property {string} id - Identificador único del logro
 * @property {string} name - Nombre visible del logro
 * @property {string} emoji - Emoji representativo
 * @property {string} description - Descripción corta del logro
 * @property {string} unlockCondition - Condición legible de desbloqueo
 */

/**
 * Array inmutable con los 12 logros del juego.
 * @type {ReadonlyArray<AchievementDefinition>}
 */
export const ACHIEVEMENT_DEFINITIONS = Object.freeze([
  {
    id: 'first_dish',
    name: 'Primer Plato',
    emoji: '🍽️',
    description: 'Completaste tu primer nivel',
    unlockCondition: 'Completar tu primer nivel',
  },
  {
    id: 'perfectionist',
    name: 'Perfeccionista',
    emoji: '⭐',
    description: 'Completaste un nivel sin errores',
    unlockCondition: 'Completar un nivel con 0 errores',
  },
  {
    id: 'combo_3',
    name: 'En Racha',
    emoji: '🔥',
    description: 'Alcanzaste combo x3',
    unlockCondition: 'Alcanzar combo x3',
  },
  {
    id: 'combo_6',
    name: 'Imparable',
    emoji: '⚡',
    description: 'Alcanzaste combo x6',
    unlockCondition: 'Alcanzar combo x6',
  },
  {
    id: 'combo_10',
    name: 'Leyenda',
    emoji: '👑',
    description: 'Alcanzaste combo x10',
    unlockCondition: 'Alcanzar combo x10',
  },
  {
    id: 'math_5',
    name: 'Matemático',
    emoji: '🧠',
    description: 'Respondiste 5 desafíos correctamente en una partida',
    unlockCondition: 'Responder 5 desafíos matemáticos correctamente en una partida',
  },
  {
    id: 'math_10',
    name: 'Genio',
    emoji: '🎓',
    description: 'Respondiste 10 desafíos correctamente en una partida',
    unlockCondition: 'Responder 10 desafíos matemáticos correctamente en una partida',
  },
  {
    id: 'night_cook',
    name: 'Cocinero Nocturno',
    emoji: '🌙',
    description: 'Llegaste al nivel 6',
    unlockCondition: 'Llegar al nivel 6',
  },
  {
    id: 'sea_chef',
    name: 'Chef del Mar',
    emoji: '🌊',
    description: 'Llegaste al nivel 11',
    unlockCondition: 'Llegar al nivel 11',
  },
  {
    id: 'space_chef',
    name: 'Chef Espacial',
    emoji: '🚀',
    description: 'Llegaste al nivel 16',
    unlockCondition: 'Llegar al nivel 16',
  },
  {
    id: 'millionaire',
    name: 'Millonario',
    emoji: '💰',
    description: 'Acumulaste 1000 monedas en total histórico',
    unlockCondition: 'Acumular 1000 monedas en total histórico',
  },
  {
    id: 'master_chef',
    name: 'Maestro Chef',
    emoji: '🏆',
    description: 'Completaste 50 platos en total histórico',
    unlockCondition: 'Completar 50 platos en total histórico',
  },
]);
