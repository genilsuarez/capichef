/**
 * Profile State Module for CapiChef
 *
 * Manages player profile loading and saving via storageService.
 * The profile structure includes: name, selectedSkin, unlockedSkins,
 * unlockedAchievements, and historical stats.
 *
 * @module profile
 */

import { loadProfile as storageLoadProfile, saveProfile as storageSaveProfile } from '../services/storageService';
import { SKIN_DEFINITIONS } from '../constants/skinDefinitions';

/**
 * Default player profile structure.
 * @type {object}
 */
export const DEFAULT_PROFILE = {
  name: '',
  selectedSkin: 'classic',
  unlockedSkins: ['classic', 'elegant'],
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
 * Load the player profile from localStorage.
 * Returns the stored profile merged with defaults (to handle schema additions),
 * or null if no profile exists.
 *
 * @returns {object|null} PlayerProfile or null if not found
 */
export function loadProfile() {
  const stored = storageLoadProfile();
  if (!stored) return null;

  // Merge with defaults to handle any missing fields from older versions
  return {
    ...DEFAULT_PROFILE,
    ...stored,
    stats: {
      ...DEFAULT_PROFILE.stats,
      ...(stored.stats || {}),
    },
    unlockedSkins: Array.from(new Set([
      ...(stored.unlockedSkins || []),
      ...SKIN_DEFINITIONS.filter(s => !s.isLockedByDefault).map(s => s.id),
    ])),
    unlockedAchievements: stored.unlockedAchievements || [],
  };
}

/**
 * Save the player profile to localStorage.
 *
 * @param {object} profile - PlayerProfile to persist
 */
export function saveProfile(profile) {
  storageSaveProfile(profile);
}
