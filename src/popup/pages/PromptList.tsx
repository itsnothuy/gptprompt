/**
 * PromptList Page
 * Displays all prompts with search functionality
 */

import { useState, useEffect, useMemo } from 'react';
import { storage } from '@/shared/storage';
import { fuzzyMatch, log } from '@/shared/utils';
import type { Prompt } from '@/shared/types';
import { PromptCard, Button, Input } from '../components';

interface PromptListProps {
  onAdd: () => void;
  onEdit: (prompt: Prompt) => void;
}

export function PromptList({ onAdd, onEdit }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const loadedPrompts = await storage.getPrompts();
        setPrompts(loadedPrompts);
        log.popup('Loaded prompts:', loadedPrompts.length);
      } catch (error) {
        log.error('Failed to load prompts:', error);
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
  }, []);

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
    } catch (error) {
      log.error('Failed to delete prompt:', error);
    }
  };

  return (
    <div className="prompt-list-page">
      {/* Header */}
      <header className="popup-header">
        <h1 className="popup-title">GPTPrompt</h1>
      </header>

      {/* Search */}
      <div className="search-wrapper">
        <Input
          type="search"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content */}
      <main className="prompt-list">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredPrompts.length > 0 ? (
          filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          ))
        ) : prompts.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <p className="empty-title">No prompts yet</p>
            <p className="empty-description">
              Create your first prompt to get started.
            </p>
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-title">No results</p>
            <p className="empty-description">
              Try a different search term.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="popup-footer">
        <Button onClick={onAdd} variant="primary" className="btn-full">
          + Add Prompt
        </Button>
      </footer>
    </div>
  );
}
