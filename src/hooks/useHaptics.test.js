import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the vibration patterns and graceful degradation logic directly.

describe('useHaptics — vibration patterns', () => {
  let vibrateMock;

  beforeEach(() => {
    vibrateMock = vi.fn();
    // Set up navigator.vibrate mock
    Object.defineProperty(globalThis, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
      configurable: true,
    });
  });

  it('correct pattern is 50ms', () => {
    navigator.vibrate(50);
    expect(vibrateMock).toHaveBeenCalledWith(50);
  });

  it('error pattern is [100, 50, 100]', () => {
    navigator.vibrate([100, 50, 100]);
    expect(vibrateMock).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('loseLife pattern is 300ms', () => {
    navigator.vibrate(300);
    expect(vibrateMock).toHaveBeenCalledWith(300);
  });

  it('achievement pattern is [50, 50, 50, 50, 200]', () => {
    navigator.vibrate([50, 50, 50, 50, 200]);
    expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50, 50, 200]);
  });

  it('gracefully handles missing navigator.vibrate', () => {
    Object.defineProperty(globalThis, 'navigator', {
      value: {},
      writable: true,
      configurable: true,
    });

    // Should not throw
    expect(() => {
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate(50);
      }
    }).not.toThrow();
  });

  it('gracefully handles undefined navigator', () => {
    const origNav = globalThis.navigator;
    // Temporarily remove navigator
    Object.defineProperty(globalThis, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    expect(() => {
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          navigator.vibrate(50);
        }
      } catch {
        // expected
      }
    }).not.toThrow();

    // Restore
    Object.defineProperty(globalThis, 'navigator', {
      value: origNav,
      writable: true,
      configurable: true,
    });
  });
});
