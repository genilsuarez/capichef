import { describe, it, expect } from 'vitest';
import { getTimerColor, formatTime } from './timerUtils.js';

describe('getTimerColor', () => {
  it('returns green when remaining > 50% of total', () => {
    expect(getTimerColor(80, 100)).toBe('#22c55e');
    expect(getTimerColor(51, 100)).toBe('#22c55e');
    expect(getTimerColor(150, 200)).toBe('#22c55e');
  });

  it('returns yellow when remaining is between 25% and 50% (inclusive)', () => {
    expect(getTimerColor(50, 100)).toBe('#eab308');
    expect(getTimerColor(25, 100)).toBe('#eab308');
    expect(getTimerColor(30, 100)).toBe('#eab308');
  });

  it('returns red when remaining < 25%', () => {
    expect(getTimerColor(24, 100)).toBe('#ef4444');
    expect(getTimerColor(0, 100)).toBe('#ef4444');
    expect(getTimerColor(10, 100)).toBe('#ef4444');
  });

  it('returns red when total is 0 or negative', () => {
    expect(getTimerColor(0, 0)).toBe('#ef4444');
    expect(getTimerColor(5, -1)).toBe('#ef4444');
  });

  it('handles exact boundary at 50%', () => {
    expect(getTimerColor(50, 100)).toBe('#eab308');
  });

  it('handles exact boundary at 25%', () => {
    expect(getTimerColor(25, 100)).toBe('#eab308');
  });
});

describe('formatTime', () => {
  it('formats deciseconds to seconds with one decimal', () => {
    expect(formatTime(125)).toBe('12.5s');
    expect(formatTime(10)).toBe('1.0s');
    expect(formatTime(1)).toBe('0.1s');
  });

  it('formats zero as 0.0s', () => {
    expect(formatTime(0)).toBe('0.0s');
  });

  it('clamps negative values to 0.0s', () => {
    expect(formatTime(-5)).toBe('0.0s');
  });

  it('formats large values correctly', () => {
    expect(formatTime(1000)).toBe('100.0s');
  });
});
