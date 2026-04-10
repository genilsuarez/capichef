import { describe, it, expect, vi } from 'vitest';
import { trackEvent } from './analyticsService.js';

describe('analyticsService', () => {
  it('does not throw when called with event name', () => {
    expect(() => trackEvent('game_start')).not.toThrow();
  });

  it('does not throw when called with event name and data', () => {
    expect(() => trackEvent('level_complete', { level: 5, coins: 100 })).not.toThrow();
  });

  it('does not throw when called with unknown event', () => {
    expect(() => trackEvent('unknown_event')).not.toThrow();
  });
});
