/**
 * Content Script Entry Point
 * 
 * This script runs on ChatGPT pages and handles:
 * 1. Mounting/unmounting the Picker component
 * 2. Listening for keyboard shortcuts
 * 3. Inserting prompts into the ChatGPT input
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Picker } from './picker';
import { insertText, isChatGPTPage } from './chatgpt-dom';
import { onMessage } from '@/shared/messaging';
import { log } from '@/shared/utils';
import type { Prompt, Message, GenericResponse } from '@/shared/types';
import './content.css';

// Container ID for our UI
const CONTAINER_ID = 'gptprompt-root';

// Store reference to React root
let root: Root | null = null;
let isPickerOpen = false;

/**
 * Create or get the container for our UI
 */
function getOrCreateContainer(): HTMLDivElement {
  let container = document.getElementById(CONTAINER_ID) as HTMLDivElement;

  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
    log.content('Created container element');
  }

  return container;
}

/**
 * Mount the Picker component
 */
function mountPicker(): void {
  if (isPickerOpen) {
    log.content('Picker already open, ignoring');
    return;
  }

  const container = getOrCreateContainer();

  // Create React root if needed
  if (!root) {
    root = createRoot(container);
  }

  // Render the Picker
  root.render(
    <React.StrictMode>
      <Picker onClose={unmountPicker} onSelect={handlePromptSelect} />
    </React.StrictMode>
  );

  isPickerOpen = true;
  log.content('Picker mounted');
}

/**
 * Unmount the Picker component
 */
function unmountPicker(): void {
  if (!isPickerOpen) {
    return;
  }

  if (root) {
    root.render(null);
  }

  isPickerOpen = false;
  log.content('Picker unmounted');
}

/**
 * Handle prompt selection
 */
function handlePromptSelect(prompt: Prompt): void {
  log.content('Inserting prompt:', prompt.title);

  const success = insertText(prompt.content);

  if (success) {
    log.content('Prompt inserted successfully');
  } else {
    log.error('Failed to insert prompt');
    // Could show a toast notification here
  }
}

/**
 * Handle messages from background script
 */
function handleMessage(
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: GenericResponse) => void
): boolean {
  log.content('Message received:', message.type);

  switch (message.type) {
    case 'OPEN_PICKER':
      mountPicker();
      sendResponse({ success: true });
      return false;

    case 'CLOSE_PICKER':
      unmountPicker();
      sendResponse({ success: true });
      return false;

    case 'INSERT_PROMPT':
      if ('content' in message) {
        const success = insertText(message.content);
        sendResponse({ success });
      } else {
        sendResponse({ success: false, error: 'No content provided' });
      }
      return false;

    case 'PROMPTS_UPDATED':
      // Prompts updated - if picker is open, it will re-fetch
      log.content('Prompts updated notification received');
      sendResponse({ success: true });
      return false;

    default:
      return false;
  }
}

/**
 * Initialize the content script
 */
function init(): void {
  // Verify we're on a ChatGPT page
  if (!isChatGPTPage()) {
    log.content('Not on ChatGPT page, exiting');
    return;
  }

  log.content('Initializing content script');

  // Listen for messages
  onMessage(handleMessage);

  // Optional: Add keyboard shortcut listener as backup
  // (primary handler is in background script)
  document.addEventListener('keydown', (e) => {
    // Cmd+J (Mac) or Ctrl+J (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
      e.preventDefault();
      e.stopPropagation();
      
      if (isPickerOpen) {
        unmountPicker();
      } else {
        mountPicker();
      }
    }
  });

  log.content('Content script initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
