/**
 * Storage utilities for Chrome extension
 * Uses chrome.storage.local for persistent local storage
 */

import type {
  Prompt,
  PromptInput,
  PromptUpdateInput,
  Settings,
  StorageSchema,
} from './types';
import { generateId } from './utils';

const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  SETTINGS: 'settings',
} as const;

const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  keyboardShortcut: 'Ctrl+J',
};

/**
 * Storage API wrapper
 */
export const storage = {
  /**
   * Get all prompts from storage
   */
  async getPrompts(): Promise<Prompt[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.PROMPTS);
      const prompts = result[STORAGE_KEYS.PROMPTS];
      return Array.isArray(prompts) ? prompts : [];
    } catch (error) {
      console.error('[GPTPrompt] Error getting prompts:', error);
      return [];
    }
  },

  /**
   * Save a new prompt
   */
  async savePrompt(input: PromptInput): Promise<Prompt> {
    const prompts = await this.getPrompts();
    const now = Date.now();

    const newPrompt: Prompt = {
      id: generateId(),
      title: input.title.trim(),
      content: input.content.trim(),
      description: input.description?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedPrompts = [newPrompt, ...prompts];
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: updatedPrompts });

    return newPrompt;
  },

  /**
   * Update an existing prompt
   */
  async updatePrompt(input: PromptUpdateInput): Promise<Prompt | null> {
    const prompts = await this.getPrompts();
    const index = prompts.findIndex((p) => p.id === input.id);

    if (index === -1) {
      console.error('[GPTPrompt] Prompt not found:', input.id);
      return null;
    }

    const updatedPrompt: Prompt = {
      ...prompts[index],
      ...(input.title !== undefined && { title: input.title.trim() }),
      ...(input.content !== undefined && { content: input.content.trim() }),
      ...(input.description !== undefined && {
        description: input.description?.trim(),
      }),
      updatedAt: Date.now(),
    };

    prompts[index] = updatedPrompt;
    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: prompts });

    return updatedPrompt;
  },

  /**
   * Delete a prompt by ID
   */
  async deletePrompt(id: string): Promise<boolean> {
    const prompts = await this.getPrompts();
    const filteredPrompts = prompts.filter((p) => p.id !== id);

    if (filteredPrompts.length === prompts.length) {
      console.error('[GPTPrompt] Prompt not found for deletion:', id);
      return false;
    }

    await chrome.storage.local.set({ [STORAGE_KEYS.PROMPTS]: filteredPrompts });
    return true;
  },

  /**
   * Get a single prompt by ID
   */
  async getPromptById(id: string): Promise<Prompt | null> {
    const prompts = await this.getPrompts();
    return prompts.find((p) => p.id === id) || null;
  },

  /**
   * Get application settings
   */
  async getSettings(): Promise<Settings> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
      const stored = result[STORAGE_KEYS.SETTINGS] as Partial<Settings> | undefined;
      return { ...DEFAULT_SETTINGS, ...stored };
    } catch (error) {
      console.error('[GPTPrompt] Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Update application settings
   */
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await chrome.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: updatedSettings,
    });
    return updatedSettings;
  },

  /**
   * Get all storage data
   */
  async getAll(): Promise<StorageSchema> {
    const [prompts, settings] = await Promise.all([
      this.getPrompts(),
      this.getSettings(),
    ]);
    return { prompts, settings };
  },

  /**
   * Clear all storage (use with caution)
   */
  async clearAll(): Promise<void> {
    await chrome.storage.local.clear();
  },

  /**
   * Listen for storage changes
   */
  onChanged(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        callback(changes);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  },
};
