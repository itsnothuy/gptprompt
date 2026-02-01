/**
 * Utility Functions Tests
 */

import { describe, it, expect } from 'vitest';
import {
  generateId,
  truncate,
  formatRelativeTime,
  fuzzyMatch,
  matchScore,
} from '@/shared/utils';

describe('utils', () => {
  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('truncate', () => {
    it('returns original text if shorter than max length', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });

    it('truncates text with ellipsis', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('handles empty string', () => {
      expect(truncate('', 10)).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for recent timestamps', () => {
      const now = Date.now();
      expect(formatRelativeTime(now)).toBe('just now');
    });

    it('returns minutes ago', () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      expect(formatRelativeTime(twoHoursAgo)).toBe('2h ago');
    });

    it('returns days ago', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      expect(formatRelativeTime(threeDaysAgo)).toBe('3d ago');
    });
  });

  describe('fuzzyMatch', () => {
    it('matches substring', () => {
      expect(fuzzyMatch('Hello World', 'World')).toBe(true);
    });

    it('matches case-insensitively', () => {
      expect(fuzzyMatch('Hello World', 'hello')).toBe(true);
    });

    it('matches fuzzy pattern', () => {
      expect(fuzzyMatch('Hello World', 'hwd')).toBe(true);
    });

    it('returns false for non-matching', () => {
      expect(fuzzyMatch('Hello World', 'xyz')).toBe(false);
    });
  });

  describe('matchScore', () => {
    it('returns 100 for exact match', () => {
      expect(matchScore('hello', 'hello')).toBe(100);
    });

    it('returns 80 for starts-with match', () => {
      expect(matchScore('hello world', 'hello')).toBe(80);
    });

    it('returns 60 for substring match', () => {
      expect(matchScore('hello world', 'world')).toBe(60);
    });

    it('returns 0 for no match', () => {
      expect(matchScore('hello', 'xyz')).toBe(0);
    });
  });
});
