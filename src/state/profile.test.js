import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProfile, saveProfile, DEFAULT_PROFILE } from './profile';
import * as storageService from '../services/storageService';

vi.mock('../services/storageService', () => ({
  loadProfile: vi.fn(),
  saveProfile: vi.fn(),
}));

describe('profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadProfile', () => {
    it('returns null when no profile exists in storage', () => {
      storageService.loadProfile.mockReturnValue(null);
      expect(loadProfile()).toBeNull();
    });

    it('returns stored profile merged with defaults', () => {
      storageService.loadProfile.mockReturnValue({
        name: 'Ana',
        selectedSkin: 'elegant',
      });

      const result = loadProfile();
      expect(result.name).toBe('Ana');
      expect(result.selectedSkin).toBe('elegant');
      // Defaults filled in
      expect(result.stats).toEqual(DEFAULT_PROFILE.stats);
      expect(result.unlockedSkins).toEqual(['classic', 'elegant', 'mexican', 'japanese']);
      expect(result.unlockedAchievements).toEqual([]);
    });

    it('merges partial stats with defaults', () => {
      storageService.loadProfile.mockReturnValue({
        name: 'Luis',
        stats: { bestLevel: 5, totalCoins: 100 },
      });

      const result = loadProfile();
      expect(result.stats.bestLevel).toBe(5);
      expect(result.stats.totalCoins).toBe(100);
      expect(result.stats.totalDishes).toBe(0);
      expect(result.stats.gamesPlayed).toBe(0);
    });

    it('preserves existing unlockedSkins from storage', () => {
      storageService.loadProfile.mockReturnValue({
        name: 'Test',
        unlockedSkins: ['classic', 'space'],
      });

      const result = loadProfile();
      expect(result.unlockedSkins).toContain('classic');
      expect(result.unlockedSkins).toContain('space');
      expect(result.unlockedSkins).toContain('elegant');
      expect(result.unlockedSkins).toContain('mexican');
      expect(result.unlockedSkins).toContain('japanese');
    });
  });

  describe('saveProfile', () => {
    it('delegates to storageService.saveProfile', () => {
      const profile = { name: 'Test', selectedSkin: 'classic' };
      saveProfile(profile);
      expect(storageService.saveProfile).toHaveBeenCalledWith(profile);
    });
  });
});
