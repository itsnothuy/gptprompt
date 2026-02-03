/**
 * useKeyboardNavigation Hook
 * Handles keyboard navigation for prompt list
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseKeyboardNavigationOptions {
  items: any[];
  onSelect?: (item: any, index: number) => void;
  onDelete?: (item: any, index: number) => void;
  onEdit?: (item: any, index: number) => void;
  loop?: boolean;
}

export function useKeyboardNavigation({
  items,
  onSelect,
  onDelete,
  onEdit,
  loop = true,
}: UseKeyboardNavigationOptions) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);

  // Navigate up
  const navigateUp = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev <= 0) return loop ? items.length - 1 : 0;
      return prev - 1;
    });
  }, [items.length, loop]);

  // Navigate down
  const navigateDown = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev >= items.length - 1) return loop ? 0 : items.length - 1;
      return prev + 1;
    });
  }, [items.length, loop]);

  // Select current item
  const selectCurrent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      onSelect?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onSelect]);

  // Delete current item
  const deleteCurrent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      onDelete?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onDelete]);

  // Edit current item
  const editCurrent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < items.length) {
      onEdit?.(items[selectedIndex], selectedIndex);
    }
  }, [selectedIndex, items, onEdit]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          navigateUp();
          break;
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          navigateDown();
          break;
        case 'Enter':
          e.preventDefault();
          selectCurrent();
          break;
        case 'Delete':
        case 'Backspace':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            deleteCurrent();
          }
          break;
        case 'e':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            editCurrent();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateUp, navigateDown, selectCurrent, deleteCurrent, editCurrent]);

  // Reset selection when items change
  useEffect(() => {
    if (selectedIndex >= items.length) {
      setSelectedIndex(items.length - 1);
    }
  }, [items.length, selectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  return {
    selectedIndex,
    setSelectedIndex,
    listRef,
  };
}
