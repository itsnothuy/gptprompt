/**
 * Core TypeScript types for GPTPrompt extension
 */

/**
 * Represents a single prompt template
 */
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for creating a new prompt (id and timestamps auto-generated)
 */
export interface PromptInput {
  title: string;
  content: string;
  description?: string;
}

/**
 * Input for updating an existing prompt
 */
export interface PromptUpdateInput {
  id: string;
  title?: string;
  content?: string;
  description?: string;
}

/**
 * Application settings
 */
export interface Settings {
  theme: 'light' | 'dark' | 'system';
  keyboardShortcut: string;
}

/**
 * Complete storage schema
 */
export interface StorageSchema {
  prompts: Prompt[];
  settings: Settings;
}

/**
 * Message types for communication between extension parts
 */
export type MessageType =
  | 'GET_PROMPTS'
  | 'PROMPTS_UPDATED'
  | 'INSERT_PROMPT'
  | 'OPEN_PICKER'
  | 'CLOSE_PICKER';

/**
 * Base message interface
 */
export interface BaseMessage {
  type: MessageType;
}

/**
 * Message to get all prompts
 */
export interface GetPromptsMessage extends BaseMessage {
  type: 'GET_PROMPTS';
}

/**
 * Message when prompts are updated
 */
export interface PromptsUpdatedMessage extends BaseMessage {
  type: 'PROMPTS_UPDATED';
  prompts: Prompt[];
}

/**
 * Message to insert a prompt into ChatGPT
 */
export interface InsertPromptMessage extends BaseMessage {
  type: 'INSERT_PROMPT';
  content: string;
}

/**
 * Message to open the picker
 */
export interface OpenPickerMessage extends BaseMessage {
  type: 'OPEN_PICKER';
}

/**
 * Message to close the picker
 */
export interface ClosePickerMessage extends BaseMessage {
  type: 'CLOSE_PICKER';
}

/**
 * Union type of all messages
 */
export type Message =
  | GetPromptsMessage
  | PromptsUpdatedMessage
  | InsertPromptMessage
  | OpenPickerMessage
  | ClosePickerMessage;

/**
 * Message response types
 */
export interface GetPromptsResponse {
  success: boolean;
  prompts?: Prompt[];
  error?: string;
}

export interface GenericResponse {
  success: boolean;
  error?: string;
}
