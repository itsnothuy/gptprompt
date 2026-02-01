/**
 * Storage Module Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { storage } from '@/shared/storage';

describe('storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPrompts', () => {
    it('returns empty array when no prompts exist', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({})
      );

      const result = await storage.getPrompts();

      expect(result).toEqual([]);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('prompts');
    });

    it('returns prompts from storage', async () => {
      const mockPrompts = [
        {
          id: '1',
          title: 'Test Prompt',
          content: 'Test content',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({ prompts: mockPrompts })
      );

      const result = await storage.getPrompts();

      expect(result).toEqual(mockPrompts);
    });
  });

  describe('savePrompt', () => {
    it('creates a new prompt with generated id and timestamps', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({ prompts: [] })
      );

      const input = {
        title: 'New Prompt',
        content: 'Prompt content',
        description: 'A description',
      };

      const result = await storage.savePrompt(input);

      expect(result).toMatchObject({
        title: 'New Prompt',
        content: 'Prompt content',
        description: 'A description',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: [expect.objectContaining({ title: 'New Prompt' })],
      });
    });
  });

  describe('deletePrompt', () => {
    it('removes prompt from storage', async () => {
      const mockPrompts = [
        { id: '1', title: 'Keep', content: '', createdAt: 0, updatedAt: 0 },
        { id: '2', title: 'Delete', content: '', createdAt: 0, updatedAt: 0 },
      ];

      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({ prompts: mockPrompts })
      );

      const result = await storage.deletePrompt('2');

      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        prompts: [expect.objectContaining({ id: '1' })],
      });
    });

    it('returns false if prompt not found', async () => {
      vi.mocked(chrome.storage.local.get).mockImplementation(() =>
        Promise.resolve({ prompts: [] })
      );

      const result = await storage.deletePrompt('nonexistent');

      expect(result).toBe(false);
    });
  });
});
