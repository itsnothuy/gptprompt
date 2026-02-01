/**
 * ChatGPT DOM Utilities
 * 
 * Handles interaction with ChatGPT's input area.
 * ChatGPT uses ProseMirror editor, so we need to:
 * 1. Find the editor element
 * 2. Create <p> elements (not set .value)
 * 3. Dispatch input events for React state sync
 */

import { log } from '@/shared/utils';

/**
 * Selectors for ChatGPT's input area
 * ChatGPT has changed their DOM structure several times, so we try multiple selectors
 */
const SELECTORS = {
  // Primary: ProseMirror editor
  PROSEMIRROR: '#prompt-textarea',
  // Fallback: contenteditable div
  CONTENTEDITABLE: '[contenteditable="true"]',
  // Legacy: textarea (older ChatGPT versions)
  TEXTAREA: 'textarea[data-id="root"]',
  // Submit button
  SUBMIT_BUTTON: 'button[data-testid="send-button"]',
} as const;

/**
 * Find the ChatGPT input element
 */
export function findInputElement(): HTMLElement | null {
  // Try ProseMirror first
  let element = document.querySelector<HTMLElement>(SELECTORS.PROSEMIRROR);
  if (element) {
    log.content('Found input via PROSEMIRROR selector');
    return element;
  }

  // Try contenteditable
  element = document.querySelector<HTMLElement>(SELECTORS.CONTENTEDITABLE);
  if (element) {
    log.content('Found input via CONTENTEDITABLE selector');
    return element;
  }

  // Try legacy textarea
  const textarea = document.querySelector<HTMLTextAreaElement>(SELECTORS.TEXTAREA);
  if (textarea) {
    log.content('Found input via TEXTAREA selector');
    return textarea;
  }

  log.error('Could not find ChatGPT input element');
  return null;
}

/**
 * Check if element is a ProseMirror editor
 */
function isProseMirror(element: HTMLElement): boolean {
  return (
    element.classList.contains('ProseMirror') ||
    element.getAttribute('contenteditable') === 'true' ||
    element.id === 'prompt-textarea'
  );
}

/**
 * Insert text into ChatGPT's input
 */
export function insertText(text: string): boolean {
  const element = findInputElement();
  if (!element) {
    log.error('Cannot insert text: input element not found');
    return false;
  }

  try {
    if (isProseMirror(element)) {
      return insertIntoProseMirror(element, text);
    } else if (element instanceof HTMLTextAreaElement) {
      return insertIntoTextarea(element, text);
    } else {
      // Fallback for contenteditable
      return insertIntoContentEditable(element, text);
    }
  } catch (error) {
    log.error('Error inserting text:', error);
    return false;
  }
}

/**
 * Insert text into ProseMirror editor
 */
function insertIntoProseMirror(element: HTMLElement, text: string): boolean {
  // Focus the editor
  element.focus();

  // Clear existing content (optional - append instead if needed)
  // element.innerHTML = '';

  // ProseMirror expects content in <p> tags
  const lines = text.split('\n');
  const fragment = document.createDocumentFragment();

  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line || '\u200B'; // Use zero-width space for empty lines
    fragment.appendChild(p);
  }

  // Clear and insert
  element.innerHTML = '';
  element.appendChild(fragment);

  // Dispatch input event for React to pick up the change
  dispatchInputEvent(element);

  log.content('Inserted text into ProseMirror');
  return true;
}

/**
 * Insert text into a textarea
 */
function insertIntoTextarea(textarea: HTMLTextAreaElement, text: string): boolean {
  textarea.focus();
  textarea.value = text;

  // Dispatch events for React
  dispatchInputEvent(textarea);

  log.content('Inserted text into textarea');
  return true;
}

/**
 * Insert text into a contenteditable element
 */
function insertIntoContentEditable(element: HTMLElement, text: string): boolean {
  element.focus();
  element.textContent = text;

  dispatchInputEvent(element);

  log.content('Inserted text into contenteditable');
  return true;
}

/**
 * Dispatch input event to trigger React state update
 */
function dispatchInputEvent(element: HTMLElement): void {
  // Create and dispatch input event
  const inputEvent = new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
  });
  element.dispatchEvent(inputEvent);

  // Also dispatch change event
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(changeEvent);
}

/**
 * Find the submit button
 */
export function findSubmitButton(): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(SELECTORS.SUBMIT_BUTTON);
}

/**
 * Click the submit button
 */
export function clickSubmit(): boolean {
  const button = findSubmitButton();
  if (button && !button.disabled) {
    button.click();
    log.content('Clicked submit button');
    return true;
  }
  log.error('Submit button not found or disabled');
  return false;
}

/**
 * Check if we're on a ChatGPT page
 */
export function isChatGPTPage(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'chat.openai.com' || hostname === 'chatgpt.com';
}

/**
 * Wait for the input element to be available
 */
export async function waitForInput(timeout = 5000): Promise<HTMLElement | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = findInputElement();
    if (element) return element;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return null;
}
