/**
 * PromptList Page
 * Displays all prompts with search and keyboard navigation
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { storage } from '@/shared/storage';
import { fuzzyMatch, log } from '@/shared/utils';
import type { Prompt } from '@/shared/types';
import { PromptCard, Button, Input } from '../components';
import { EmptyState } from '../components/EmptyState';
import { SkeletonPromptList } from '../components/Skeleton';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';

interface PromptListProps {
  onAdd: () => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: () => void;
  onError: (message: string) => void;
}

export function PromptList({ onAdd, onEdit, onDelete, onError }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const loadedPrompts = await storage.getPrompts();
        setPrompts(loadedPrompts);
        log.popup('Loaded prompts:', loadedPrompts.length);
      } catch (error) {
        log.error('Failed to load prompts:', error);
        onError('Failed to load prompts');
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();

    // Listen for storage changes
    const unsubscribe = storage.onChanged((changes) => {
      if (changes.prompts) {
        const newPrompts = changes.prompts.newValue;
        if (Array.isArray(newPrompts)) {
          setPrompts(newPrompts);
        }
      }
    });

    return unsubscribe;
  }, [onError]);

  // Filter prompts by search
  const filteredPrompts = useMemo(() => {
    if (!search.trim()) return prompts;

    return prompts.filter(
      (prompt) =>
        fuzzyMatch(prompt.title, search) ||
        fuzzyMatch(prompt.content, search) ||
        (prompt.description && fuzzyMatch(prompt.description, search))
    );
  }, [prompts, search]);

  // Delete prompt
  const handleDelete = async (id: string) => {
    try {
      await storage.deletePrompt(id);
      setPrompts((prev) => prev.filter((p) => p.id !== id));
      log.popup('Deleted prompt:', id);
      onDelete();
    } catch (error) {
      log.error('Failed to delete prompt:', error);
      onError('Failed to delete prompt');
    }
  };

  // Keyboard navigation
  const { selectedIndex, listRef } = useKeyboardNavigation({
    items: filteredPrompts,
    onSelect: (prompt) => onEdit(prompt),
    onDelete: (prompt) => handleDelete(prompt.id),
    onEdit: (prompt) => onEdit(prompt),
  });

  // Focus search input on "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="prompt-list-page">
      {/* Header */}
      <header className="popup-header">
        <h1 className="popup-title">GPTPrompt</h1>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <Input
          ref={searchInputRef}
          type="search"
          placeholder="Search prompts... (press / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      <main className="prompt-list" ref={listRef}>
        {loading ? (
          <SkeletonPromptList />
        ) : filteredPrompts.length > 0 ? (
          filteredPrompts.map((prompt, index) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={onEdit}
              onDelete={handleDelete}
              isSelected={index === selectedIndex}
              dataIndex={index}
            />
          ))
        ) : prompts.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No prompts yet"
            description="Create your first prompt to get started."
            action={{
              label: 'Add Prompt',
              onClick: onAdd,
            }}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No results"
            description="Try a different search term."
          />
        )}
      </main>

      {/* Footer */}
      {prompts.length > 0 && (
        <footer className="popup-footer">
          <Button onClick={onAdd} variant="primary" className="btn-full">
            + Add Prompt
          </Button>
        </footer>
      )}

      {/* Keyboard hints */}
      {filteredPrompts.length > 0 && (
        <div className="keyboard-hints">
          <span className="keyboard-hint">↑↓ Navigate</span>
          <span className="keyboard-hint">Enter Select</span>
          <span className="keyboard-hint">/ Search</span>
        </div>
      )}
    </div>
  );
}
