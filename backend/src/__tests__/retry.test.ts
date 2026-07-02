import { describe, it, expect } from 'vitest';
import { calculateBackoffDelay } from '../worker/retry.js';

describe('calculateBackoffDelay', () => {
  describe('FIXED strategy', () => {
    it('returns constant delay regardless of attempts', () => {
      expect(calculateBackoffDelay('FIXED', 5, 1)).toBe(5);
      expect(calculateBackoffDelay('FIXED', 5, 2)).toBe(5);
      expect(calculateBackoffDelay('FIXED', 5, 5)).toBe(5);
    });
  });

  describe('LINEAR strategy', () => {
    it('returns delay * attempts', () => {
      expect(calculateBackoffDelay('LINEAR', 5, 1)).toBe(5);
      expect(calculateBackoffDelay('LINEAR', 5, 2)).toBe(10);
      expect(calculateBackoffDelay('LINEAR', 5, 3)).toBe(15);
    });
  });

  describe('EXPONENTIAL strategy', () => {
    it('returns delay * 2^attempts', () => {
      expect(calculateBackoffDelay('EXPONENTIAL', 5, 0)).toBe(5);
      expect(calculateBackoffDelay('EXPONENTIAL', 5, 1)).toBe(10);
      expect(calculateBackoffDelay('EXPONENTIAL', 5, 2)).toBe(20);
      expect(calculateBackoffDelay('EXPONENTIAL', 5, 3)).toBe(40);
    });
  });

  describe('edge cases', () => {
    it('handles zero base delay', () => {
      expect(calculateBackoffDelay('EXPONENTIAL', 0, 5)).toBe(0);
    });
    it('handles first attempt', () => {
      expect(calculateBackoffDelay('LINEAR', 10, 1)).toBe(10);
    });
  });
});
