import { describe, it, expect } from 'vitest';
import { appReducer, initialAppState, DEFAULT_CONFIG } from './appReducer.js';

describe('appReducer', () => {
  describe('initialAppState', () => {
    it('has correct default structure', () => {
      expect(initialAppState.isFirstLaunch).toBe(true);
      expect(initialAppState.profile.name).toBe('');
      expect(initialAppState.profile.selectedSkin).toBe('classic');
      expect(initialAppState.profile.unlockedSkins).toEqual(['classic', 'elegant', 'mexican', 'japanese']);
      expect(initialAppState.profile.unlockedAchievements).toEqual([]);
      expect(initialAppState.profile.stats.bestLevel).toBe(0);
      expect(initialAppState.profile.stats.totalCoins).toBe(0);
      expect(initialAppState.config).toEqual(DEFAULT_CONFIG);
      expect(initialAppState.history).toEqual([]);
    });
  });

  describe('COMPLETE_ONBOARDING', () => {
    it('sets player name and isFirstLaunch to false', () => {
      const result = appReducer(initialAppState, {
        type: 'COMPLETE_ONBOARDING',
        payload: 'CapiPlayer',
      });
      expect(result.profile.name).toBe('CapiPlayer');
      expect(result.isFirstLaunch).toBe(false);
    });
  });

  describe('UPDATE_CONFIG', () => {
    it('replaces config entirely', () => {
      const newConfig = { ...DEFAULT_CONFIG, difficulty: 'hard', mathFocus: 'addition' };
      const result = appReducer(initialAppState, {
        type: 'UPDATE_CONFIG',
        payload: newConfig,
      });
      expect(result.config.difficulty).toBe('hard');
      expect(result.config.mathFocus).toBe('addition');
    });
  });

  describe('RESET_CONFIG', () => {
    it('resets config to DEFAULT_CONFIG', () => {
      const modified = {
        ...initialAppState,
        config: { ...DEFAULT_CONFIG, difficulty: 'easy', textLarge: true },
      };
      const result = appReducer(modified, { type: 'RESET_CONFIG' });
      expect(result.config).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('CHANGE_SKIN', () => {
    it('sets selectedSkin on profile', () => {
      const result = appReducer(initialAppState, {
        type: 'CHANGE_SKIN',
        payload: 'elegant',
      });
      expect(result.profile.selectedSkin).toBe('elegant');
    });
  });

  describe('UNLOCK_ACHIEVEMENT', () => {
    it('adds achievement if not already present', () => {
      const result = appReducer(initialAppState, {
        type: 'UNLOCK_ACHIEVEMENT',
        payload: 'first_dish',
      });
      expect(result.profile.unlockedAchievements).toContain('first_dish');
    });

    it('does not duplicate an already unlocked achievement', () => {
      const stateWithAchievement = {
        ...initialAppState,
        profile: {
          ...initialAppState.profile,
          unlockedAchievements: ['first_dish'],
        },
      };
      const result = appReducer(stateWithAchievement, {
        type: 'UNLOCK_ACHIEVEMENT',
        payload: 'first_dish',
      });
      expect(result.profile.unlockedAchievements).toEqual(['first_dish']);
      // Should return same state reference when no change
      expect(result).toBe(stateWithAchievement);
    });
  });

  describe('UNLOCK_SKIN', () => {
    it('adds skin if not already present', () => {
      const result = appReducer(initialAppState, {
        type: 'UNLOCK_SKIN',
        payload: 'space',
      });
      expect(result.profile.unlockedSkins).toContain('space');
      expect(result.profile.unlockedSkins).toContain('classic');
    });

    it('does not duplicate an already unlocked skin', () => {
      const result = appReducer(initialAppState, {
        type: 'UNLOCK_SKIN',
        payload: 'classic',
      });
      expect(result.profile.unlockedSkins).toEqual(['classic', 'elegant', 'mexican', 'japanese']);
      expect(result).toBe(initialAppState);
    });
  });

  describe('UPDATE_STATS', () => {
    it('merges partial stats into profile', () => {
      const result = appReducer(initialAppState, {
        type: 'UPDATE_STATS',
        payload: { totalCoins: 500, gamesPlayed: 3 },
      });
      expect(result.profile.stats.totalCoins).toBe(500);
      expect(result.profile.stats.gamesPlayed).toBe(3);
      expect(result.profile.stats.bestLevel).toBe(0); // unchanged
    });

    it('takes max for bestLevel', () => {
      const stateWithStats = {
        ...initialAppState,
        profile: {
          ...initialAppState.profile,
          stats: { ...initialAppState.profile.stats, bestLevel: 10 },
        },
      };
      const result = appReducer(stateWithStats, {
        type: 'UPDATE_STATS',
        payload: { bestLevel: 5 },
      });
      expect(result.profile.stats.bestLevel).toBe(10); // keeps higher
    });

    it('takes max for bestComboEver', () => {
      const stateWithStats = {
        ...initialAppState,
        profile: {
          ...initialAppState.profile,
          stats: { ...initialAppState.profile.stats, bestComboEver: 3 },
        },
      };
      const result = appReducer(stateWithStats, {
        type: 'UPDATE_STATS',
        payload: { bestComboEver: 8 },
      });
      expect(result.profile.stats.bestComboEver).toBe(8); // takes new higher
    });
  });

  describe('ADD_HISTORY_ENTRY', () => {
    it('prepends entry to history', () => {
      const entry = { id: '2024-01-01', date: '01/01/2024', mode: 'classic', levelReached: 5, coinsEarned: 200, mathAccuracy: 80, bestCombo: 3, dishesCompleted: 4, durationSeconds: 120 };
      const result = appReducer(initialAppState, {
        type: 'ADD_HISTORY_ENTRY',
        payload: entry,
      });
      expect(result.history).toHaveLength(1);
      expect(result.history[0]).toEqual(entry);
    });

    it('keeps max 5 entries, dropping oldest', () => {
      const entries = Array.from({ length: 5 }, (_, i) => ({
        id: `entry-${i}`, date: `date-${i}`, mode: 'classic', levelReached: i + 1,
        coinsEarned: 100, mathAccuracy: 50, bestCombo: 1, dishesCompleted: i, durationSeconds: 60,
      }));
      const stateWith5 = { ...initialAppState, history: entries };
      const newEntry = { id: 'entry-new', date: 'date-new', mode: 'classic', levelReached: 10, coinsEarned: 500, mathAccuracy: 90, bestCombo: 5, dishesCompleted: 9, durationSeconds: 300 };

      const result = appReducer(stateWith5, {
        type: 'ADD_HISTORY_ENTRY',
        payload: newEntry,
      });
      expect(result.history).toHaveLength(5);
      expect(result.history[0]).toEqual(newEntry);
      // Oldest entry (entry-4) should be dropped
      expect(result.history.map((e) => e.id)).not.toContain('entry-4');
    });
  });

  describe('LOAD_PERSISTED_STATE', () => {
    it('replaces entire state', () => {
      const persistedState = {
        profile: { ...initialAppState.profile, name: 'Saved' },
        config: { ...DEFAULT_CONFIG, difficulty: 'easy' },
        history: [{ id: 'x' }],
        isFirstLaunch: false,
      };
      const result = appReducer(initialAppState, {
        type: 'LOAD_PERSISTED_STATE',
        payload: persistedState,
      });
      expect(result.profile.name).toBe('Saved');
      expect(result.config.difficulty).toBe('easy');
      expect(result.history).toHaveLength(1);
      expect(result.isFirstLaunch).toBe(false);
    });
  });

  describe('unknown action', () => {
    it('returns current state for unknown action type', () => {
      const result = appReducer(initialAppState, { type: 'UNKNOWN_ACTION' });
      expect(result).toBe(initialAppState);
    });
  });
});
