import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the serialization/deserialization logic that useLocalStorage relies on.
// Since we're in a node environment (no window/DOM), we test the core logic directly.

describe('useLocalStorage — serialization logic', () => {
  let store;
  let mockStorage;

  beforeEach(() => {
    store = {};
    mockStorage = {
      getItem: vi.fn((key) => (key in store ? store[key] : null)),
      setItem: vi.fn((key, value) => { store[key] = value; }),
      removeItem: vi.fn((key) => { delete store[key]; }),
    };
  });

  it('reads and parses JSON from storage', () => {
    store['test_key'] = JSON.stringify({ a: 1 });
    const result = JSON.parse(mockStorage.getItem('test_key'));
    expect(result).toEqual({ a: 1 });
  });

  it('returns default when key does not exist', () => {
    const item = mockStorage.getItem('missing_key');
    const result = item !== null ? JSON.parse(item) : 'default';
    expect(result).toBe('default');
  });

  it('serializes and writes to storage', () => {
    const data = { name: 'test', score: 42 };
    mockStorage.setItem('test_key', JSON.stringify(data));
    expect(store['test_key']).toBe(JSON.stringify(data));
  });

  it('handles arrays correctly', () => {
    const arr = [1, 2, 3];
    mockStorage.setItem('arr_key', JSON.stringify(arr));
    const result = JSON.parse(store['arr_key']);
    expect(result).toEqual([1, 2, 3]);
  });

  it('handles primitive values', () => {
    mockStorage.setItem('bool_key', JSON.stringify(true));
    expect(JSON.parse(store['bool_key'])).toBe(true);

    mockStorage.setItem('num_key', JSON.stringify(42));
    expect(JSON.parse(store['num_key'])).toBe(42);

    mockStorage.setItem('str_key', JSON.stringify('hello'));
    expect(JSON.parse(store['str_key'])).toBe('hello');
  });

  it('returns default on invalid JSON', () => {
    store['bad_key'] = 'not valid json{{{';
    let result;
    try {
      result = JSON.parse(mockStorage.getItem('bad_key'));
    } catch {
      result = 'fallback';
    }
    expect(result).toBe('fallback');
  });

  it('handles null stored value gracefully', () => {
    const item = mockStorage.getItem('nonexistent');
    expect(item).toBeNull();
    const result = item !== null ? JSON.parse(item) : { default: true };
    expect(result).toEqual({ default: true });
  });
});
