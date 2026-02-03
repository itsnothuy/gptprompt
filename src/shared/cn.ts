/**
 * Utility for merging class names
 * Simple version without clsx dependency
 */

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
