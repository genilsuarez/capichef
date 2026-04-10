/**
 * useLocalStorage — Generic hook for localStorage persistence.
 *
 * Provides a useState-like API backed by localStorage with
 * automatic JSON serialization/deserialization and try/catch
 * for environments where localStorage is unavailable.
 *
 * @module useLocalStorage
 */
import { useState, useCallback } from 'react';

/**
 * Hook genérico para persistencia en localStorage.
 *
 * @template T
 * @param {string} key - Clave de localStorage
 * @param {T} defaultValue - Valor por defecto si no existe o hay error
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} Tuple [value, setValue]
 */
export function useLocalStorage(key, defaultValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          typeof value === 'function' ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch {
        // Silently fail — localStorage may be unavailable (private browsing)
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue];
}
