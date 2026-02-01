/**
 * Messaging utilities for Chrome extension communication
 */

import type { Message, GetPromptsResponse, GenericResponse, Prompt } from './types';

/**
 * Send a message to the background script
 */
export async function sendToBackground<T>(message: Message): Promise<T> {
  return chrome.runtime.sendMessage(message);
}

/**
 * Send a message to a specific tab's content script
 */
export async function sendToTab<T>(tabId: number, message: Message): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message);
}

/**
 * Send a message to the active tab's content script
 */
export async function sendToActiveTab<T>(message: Message): Promise<T> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error('No active tab found');
  }
  return chrome.tabs.sendMessage(tab.id, message);
}

/**
 * Request prompts from background script
 */
export async function requestPrompts(): Promise<Prompt[]> {
  const response = await sendToBackground<GetPromptsResponse>({
    type: 'GET_PROMPTS',
  });

  if (!response.success || !response.prompts) {
    throw new Error(response.error || 'Failed to get prompts');
  }

  return response.prompts;
}

/**
 * Notify that prompts have been updated
 */
export async function notifyPromptsUpdated(prompts: Prompt[]): Promise<void> {
  // Broadcast to all tabs
  const tabs = await chrome.tabs.query({});
  
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'PROMPTS_UPDATED',
          prompts,
        });
      } catch {
        // Tab might not have content script, ignore
      }
    }
  }
}

/**
 * Request to insert a prompt into ChatGPT
 */
export async function requestInsertPrompt(content: string): Promise<boolean> {
  try {
    const response = await sendToActiveTab<GenericResponse>({
      type: 'INSERT_PROMPT',
      content,
    });
    return response.success;
  } catch (error) {
    console.error('[GPTPrompt] Error inserting prompt:', error);
    return false;
  }
}

/**
 * Request to open the picker in the active tab
 */
export async function requestOpenPicker(): Promise<boolean> {
  try {
    const response = await sendToActiveTab<GenericResponse>({
      type: 'OPEN_PICKER',
    });
    return response.success;
  } catch (error) {
    console.error('[GPTPrompt] Error opening picker:', error);
    return false;
  }
}

/**
 * Listen for messages
 */
export function onMessage(
  callback: (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void
  ) => boolean | void
): () => void {
  chrome.runtime.onMessage.addListener(callback);
  return () => chrome.runtime.onMessage.removeListener(callback);
}
