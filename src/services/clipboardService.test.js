// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { generateShareText, copyToClipboard } from './clipboardService.js';

describe('clipboardService', () => {
  describe('generateShareText', () => {
    it('generates correct share text', () => {
      const text = generateShareText(7, 350, 85);
      expect(text).toBe(
        '¡Jugué CapiChef! 🦫👨‍🍳 Llegué al nivel 7, gané 350 monedas y respondí 85% de las matemáticas. ¿Puedes superarme?'
      );
    });

    it('handles zero values', () => {
      const text = generateShareText(1, 0, 0);
      expect(text).toContain('nivel 1');
      expect(text).toContain('0 monedas');
      expect(text).toContain('0%');
    });
  });

  describe('copyToClipboard', () => {
    it('returns true when clipboard API succeeds', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });
      const result = await copyToClipboard('test');
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test');
    });

    it('returns false when clipboard API is not available', async () => {
      Object.assign(navigator, { clipboard: undefined });
      const result = await copyToClipboard('test');
      expect(result).toBe(false);
    });

    it('returns false when clipboard API throws', async () => {
      Object.assign(navigator, {
        clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      });
      const result = await copyToClipboard('test');
      expect(result).toBe(false);
    });
  });
});
