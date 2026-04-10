/**
 * App Reducer de CapiChef
 *
 * Gestiona el estado persistente de la aplicación:
 * perfil del jugador, configuración, historial de partidas.
 *
 * Separado del gameReducer para que el estado persistente
 * no se resetee al reiniciar una partida.
 *
 * Todas las funciones son puras. La persistencia en localStorage
 * se maneja en storageService y useEffects de App.jsx.
 */

/**
 * Configuración por defecto del juego.
 * @type {{ difficulty: string, mathFocus: string, textLarge: boolean, highContrast: boolean, reducedAnimations: boolean }}
 */
export const DEFAULT_CONFIG = {
  difficulty: 'easy',
  mathOps: ['addition', 'subtraction', 'multiplication'],
  mathMaxValue: 20,
  mathMaxTable: 10,
  mathTimerSeconds: 30,
  hideIngredientNames: false,
  textLarge: false,
  highContrast: false,
  reducedAnimations: false,
};

/**
 * Perfil por defecto del jugador.
 * @type {object}
 */
const DEFAULT_PROFILE = {
  name: '',
  selectedSkin: 'classic',
  unlockedSkins: ['classic', 'elegant', 'mexican', 'japanese'],
  unlockedAchievements: [],
  stats: {
    bestLevel: 0,
    totalCoins: 0,
    totalDishes: 0,
    totalMathCorrect: 0,
    totalMathTotal: 0,
    bestComboEver: 0,
    gamesPlayed: 0,
  },
};

/**
 * Estado inicial de la aplicación.
 * @type {{ profile: object, config: object, history: Array, isFirstLaunch: boolean }}
 */
export const initialAppState = {
  profile: { ...DEFAULT_PROFILE, unlockedSkins: [...DEFAULT_PROFILE.unlockedSkins] },
  config: { ...DEFAULT_CONFIG },
  history: [],
  isFirstLaunch: true,
};

/**
 * Reducer de estado persistente de la aplicación.
 *
 * Acciones soportadas:
 * - COMPLETE_ONBOARDING: payload: playerName → set profile.name, isFirstLaunch=false
 * - UPDATE_CONFIG: payload: GameConfig → replace config
 * - RESET_CONFIG: → reset config to DEFAULT_CONFIG
 * - CHANGE_SKIN: payload: SkinId → set profile.selectedSkin
 * - UNLOCK_ACHIEVEMENT: payload: AchievementId → add to unlockedAchievements if not present
 * - UNLOCK_SKIN: payload: SkinId → add to unlockedSkins if not present
 * - UPDATE_STATS: payload: Partial<stats> → merge into profile.stats, taking max for bestLevel/bestComboEver
 * - ADD_HISTORY_ENTRY: payload: GameHistoryEntry → prepend to history, keep max 5
 * - LOAD_PERSISTED_STATE: payload: AppState → replace entire state
 *
 * @param {object} state - Estado actual de la app
 * @param {{ type: string, payload?: any }} action - Acción despachada
 * @returns {object} Nuevo estado
 */
export function appReducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_ONBOARDING': {
      const playerName = action.payload;
      return {
        ...state,
        isFirstLaunch: false,
        profile: {
          ...state.profile,
          name: playerName,
        },
      };
    }

    case 'UPDATE_CONFIG': {
      return {
        ...state,
        config: { ...action.payload },
      };
    }

    case 'RESET_CONFIG': {
      return {
        ...state,
        config: { ...DEFAULT_CONFIG },
      };
    }

    case 'CHANGE_SKIN': {
      return {
        ...state,
        profile: {
          ...state.profile,
          selectedSkin: action.payload,
        },
      };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const achievementId = action.payload;
      if (state.profile.unlockedAchievements.includes(achievementId)) {
        return state;
      }
      return {
        ...state,
        profile: {
          ...state.profile,
          unlockedAchievements: [...state.profile.unlockedAchievements, achievementId],
        },
      };
    }

    case 'UNLOCK_SKIN': {
      const skinId = action.payload;
      if (state.profile.unlockedSkins.includes(skinId)) {
        return state;
      }
      return {
        ...state,
        profile: {
          ...state.profile,
          unlockedSkins: [...state.profile.unlockedSkins, skinId],
        },
      };
    }

    case 'UPDATE_STATS': {
      const partialStats = action.payload;
      const currentStats = state.profile.stats;

      // For bestLevel and bestComboEver, take the max of current and incoming
      const mergedStats = { ...currentStats };

      for (const [key, value] of Object.entries(partialStats)) {
        if (key === 'bestLevel' || key === 'bestComboEver') {
          mergedStats[key] = Math.max(currentStats[key] || 0, value);
        } else {
          mergedStats[key] = value;
        }
      }

      return {
        ...state,
        profile: {
          ...state.profile,
          stats: mergedStats,
        },
      };
    }

    case 'ADD_HISTORY_ENTRY': {
      const newEntry = action.payload;
      const updatedHistory = [newEntry, ...state.history].slice(0, 10);
      return {
        ...state,
        history: updatedHistory,
      };
    }

    case 'LOAD_PERSISTED_STATE': {
      return { ...action.payload };
    }

    default:
      return state;
  }
}
