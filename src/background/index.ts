/**
 * Background Service Worker for GPTPrompt Extension
 * Handles:
 * - Keyboard shortcuts
 * - Message routing
 * - Storage operations
 */

import { storage } from '@/shared/storage';
import { notifyPromptsUpdated, onMessage } from '@/shared/messaging';
import { log } from '@/shared/utils';
import type { Message, GetPromptsResponse } from '@/shared/types';

// Log initialization
log.background('Service worker initialized');

/**
 * Handle keyboard commands
 */
chrome.commands.onCommand.addListener(async (command) => {
  log.background('Command received:', command);

  if (command === 'open-picker') {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id) {
      // Check if we're on a ChatGPT page
      const url = tab.url || '';
      const isChatGPT =
        url.includes('chat.openai.com') || url.includes('chatgpt.com');

      if (isChatGPT) {
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'OPEN_PICKER' });
          log.background('Sent OPEN_PICKER to tab', tab.id);
        } catch (error) {
          log.error('Failed to send message to tab:', error);
        }
      } else {
        log.background('Not on ChatGPT page, ignoring shortcut');
      }
    }
  }
});

/**
 * Handle messages from popup and content scripts
 */
onMessage((message: Message, _sender, sendResponse) => {
  log.background('Message received:', message.type);

  switch (message.type) {
    case 'GET_PROMPTS':
      handleGetPrompts().then(sendResponse);
      return true; // Indicates async response

    default:
      log.background('Unknown message type:', message.type);
      return false;
  }
});

/**
 * Handle GET_PROMPTS message
 */
async function handleGetPrompts(): Promise<GetPromptsResponse> {
  try {
    const prompts = await storage.getPrompts();
    return { success: true, prompts };
  } catch (error) {
    log.error('Failed to get prompts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Listen for storage changes and notify content scripts
 */
storage.onChanged((changes) => {
  if (changes.prompts) {
    const newPrompts = changes.prompts.newValue;
    if (Array.isArray(newPrompts)) {
      log.background('Prompts changed, notifying tabs');
      notifyPromptsUpdated(newPrompts);
    }
  }
});

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener((details) => {
  log.background('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // First install - could show welcome page or set defaults
    log.background('First install - setting up defaults');
  } else if (details.reason === 'update') {
    // Extension updated
    log.background('Updated from version', details.previousVersion);
  }
});

// Export empty object to make this a module
export {};
