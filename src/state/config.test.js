// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { loadConfig, saveConfig, resetConfig, getMaxErrors, getMathTimerSeconds } from './config.js';
import { DEFAULT_CONFIG } from './appReducer.js';

describe('config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadConfig', () => {
    it('returns DEFAULT_CONFIG when nothing is stored', () => {
      expect(loadConfig()).toEqual(DEFAULT_CONFIG);
    });

    it('returns stored config merged with defaults', () => {
      const partial = { difficulty: 'hard' };
      localStorage.setItem('capichef_config', JSON.stringify(partial));
      const result = loadConfig();
      expect(result.difficulty).toBe('hard');
      expect(result.mathFocus).toBe(DEFAULT_CONFIG.mathFocus);
      expect(result.textLarge).toBe(DEFAULT_CONFIG.textLarge);
    });

    it('returns DEFAULT_CONFIG for corrupted data', () => {
      localStorage.setItem('capichef_config', '{bad');
      expect(loadConfig()).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('saveConfig', () => {
    it('persists config to localStorage', () => {
      const config = { ...DEFAULT_CONFIG, difficulty: 'easy' };
      saveConfig(config);
      expect(JSON.parse(localStorage.getItem('capichef_config'))).toEqual(config);
    });
  });

  describe('resetConfig', () => {
    it('saves DEFAULT_CONFIG and returns it', () => {
      saveConfig({ ...DEFAULT_CONFIG, difficulty: 'hard' });
      const result = resetConfig();
      expect(result).toEqual(DEFAULT_CONFIG);
      expect(JSON.parse(localStorage.getItem('capichef_config'))).toEqual(DEFAULT_CONFIG);
    });
  });

  describe('getMaxErrors', () => {
    it('returns 4 for easy', () => {
      expect(getMaxErrors('easy')).toBe(4);
    });

    it('returns 3 for normal', () => {
      expect(getMaxErrors('normal')).toBe(3);
    });

    it('returns 2 for hard', () => {
      expect(getMaxErrors('hard')).toBe(2);
    });

    it('falls back to normal for unknown difficulty', () => {
      expect(getMaxErrors('unknown')).toBe(3);
    });
  });

  describe('getMathTimerSeconds', () => {
    it('returns 20 for classic mode', () => {
      expect(getMathTimerSeconds('classic')).toBe(20);
    });

    it('returns 20 for practice mode', () => {
      expect(getMathTimerSeconds('practice')).toBe(20);
    });

    it('returns 15 for speedrun mode', () => {
      expect(getMathTimerSeconds('speedrun')).toBe(15);
    });
  });
});
