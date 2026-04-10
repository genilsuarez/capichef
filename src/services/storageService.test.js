// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadConfig,
  saveConfig,
  loadProfile,
  saveProfile,
  loadHistory,
  saveHistory,
  addHistoryEntry,
  loadSchemaVersion,
  clearAll,
  migrateIfNeeded,
} from './storageService.js';

describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadConfig / saveConfig', () => {
    it('returns null when no config stored', () => {
      expect(loadConfig()).toBeNull();
    });

    it('saves and loads config', () => {
      const config = { difficulty: 'easy', mathFocus: 'all', textLarge: false, highContrast: false, reducedAnimations: false };
      saveConfig(config);
      expect(loadConfig()).toEqual(config);
    });
  });

  describe('loadProfile / saveProfile', () => {
    it('returns null when no profile stored', () => {
      expect(loadProfile()).toBeNull();
    });

    it('saves and loads profile', () => {
      const profile = { name: 'Capi', selectedSkin: 'classic', unlockedSkins: ['classic'], unlockedAchievements: [], stats: {} };
      saveProfile(profile);
      expect(loadProfile()).toEqual(profile);
    });
  });

  describe('loadHistory / saveHistory', () => {
    it('returns empty array when no history stored', () => {
      expect(loadHistory()).toEqual([]);
    });

    it('saves and loads history', () => {
      const history = [{ id: '1', levelReached: 5 }];
      saveHistory(history);
      expect(loadHistory()).toEqual(history);
    });

    it('returns empty array for corrupted data', () => {
      localStorage.setItem('capichef_history', '"not-an-array"');
      expect(loadHistory()).toEqual([]);
    });
  });

  describe('addHistoryEntry', () => {
    it('adds entry to empty history', () => {
      addHistoryEntry({ id: 'a', levelReached: 3 });
      expect(loadHistory()).toHaveLength(1);
    });

    it('keeps max 5 entries', () => {
      for (let i = 0; i < 6; i++) {
        addHistoryEntry({ id: `entry-${i}`, levelReached: i });
      }
      const history = loadHistory();
      expect(history).toHaveLength(5);
      expect(history[0].id).toBe('entry-5');
    });
  });

  describe('loadSchemaVersion', () => {
    it('returns 0 when no version stored', () => {
      expect(loadSchemaVersion()).toBe(0);
    });

    it('returns stored version', () => {
      localStorage.setItem('capichef_schema_version', '1');
      expect(loadSchemaVersion()).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('removes all capichef keys', () => {
      saveConfig({ difficulty: 'normal' });
      saveProfile({ name: 'Test' });
      saveHistory([{ id: '1' }]);
      clearAll();
      expect(loadConfig()).toBeNull();
      expect(loadProfile()).toBeNull();
      expect(loadHistory()).toEqual([]);
    });
  });

  describe('migrateIfNeeded', () => {
    it('sets schema version when not present', () => {
      migrateIfNeeded();
      expect(loadSchemaVersion()).toBe(1);
    });

    it('does nothing when version is current', () => {
      localStorage.setItem('capichef_schema_version', '1');
      migrateIfNeeded();
      expect(loadSchemaVersion()).toBe(1);
    });
  });

  describe('error handling', () => {
    it('returns null on corrupted JSON', () => {
      localStorage.setItem('capichef_config', '{invalid json');
      expect(loadConfig()).toBeNull();
      // Should also clean up the corrupted key
      expect(localStorage.getItem('capichef_config')).toBeNull();
    });
  });
});
