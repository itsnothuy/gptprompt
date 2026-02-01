/**
 * Shared utility functions for GPTPrompt extension
 */

/**
 * Generate a unique ID
 * Uses timestamp + random string for uniqueness
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Check if current page is ChatGPT
 */
export function isChatGPTPage(): boolean {
  const hostname = window.location.hostname;
  return hostname === 'chat.openai.com' || hostname === 'chatgpt.com';
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fuzzy search - check if query matches text
 */
export function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Simple substring match first
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy match - all query chars must appear in order
  let queryIndex = 0;
  for (const char of lowerText) {
    if (char === lowerQuery[queryIndex]) {
      queryIndex++;
      if (queryIndex === lowerQuery.length) return true;
    }
  }

  return false;
}

/**
 * Calculate match score for sorting (higher = better match)
 */
export function matchScore(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match is best
  if (lowerText === lowerQuery) return 100;

  // Starts with query is good
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Contains query as substring
  if (lowerText.includes(lowerQuery)) return 60;

  // Fuzzy match
  if (fuzzyMatch(text, query)) return 40;

  return 0;
}

/**
 * Logging utilities with prefix
 */
export const log = {
  content: (...args: unknown[]) =>
    console.log('[GPTPrompt:Content]', ...args),
  popup: (...args: unknown[]) =>
    console.log('[GPTPrompt:Popup]', ...args),
  background: (...args: unknown[]) =>
    console.log('[GPTPrompt:Background]', ...args),
  error: (...args: unknown[]) =>
    console.error('[GPTPrompt:Error]', ...args),
};
