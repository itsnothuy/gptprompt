/**
 * Picker Component
 * Command palette for searching and selecting prompts
 */

import { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import type { Prompt } from '@/shared/types';
import { storage } from '@/shared/storage';
import { log } from '@/shared/utils';
import { PickerItem } from './PickerItem';

interface PickerProps {
  onClose: () => void;
  onSelect: (prompt: Prompt) => void;
}

export function Picker({ onClose, onSelect }: PickerProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load prompts on mount
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const loadedPrompts = await storage.getPrompts();
        setPrompts(loadedPrompts);
        log.content('Loaded prompts:', loadedPrompts.length);
      } catch (error) {
        log.error('Failed to load prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  // Handle prompt selection
  const handleSelect = useCallback(
    (prompt: Prompt) => {
      log.content('Selected prompt:', prompt.title);
      onSelect(prompt);
      onClose();
    },
    [onSelect, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <div className="gptprompt-picker-backdrop" onClick={handleBackdropClick}>
      <div className="gptprompt-picker-container">
        <Command
          className="gptprompt-picker"
          shouldFilter={true}
          loop={true}
        >
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search prompts..."
            className="gptprompt-picker-input"
            autoFocus
          />

          <Command.List className="gptprompt-picker-list">
            {loading && (
              <Command.Loading className="gptprompt-picker-loading">
                Loading prompts...
              </Command.Loading>
            )}

            <Command.Empty className="gptprompt-picker-empty">
              {prompts.length === 0
                ? 'No prompts yet. Create one in the extension popup.'
                : 'No prompts found.'}
            </Command.Empty>

            {prompts.length > 0 && (
              <Command.Group heading="Prompts">
                {prompts.map((prompt) => (
                  <PickerItem
                    key={prompt.id}
                    prompt={prompt}
                    onSelect={handleSelect}
                  />
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="gptprompt-picker-footer">
            <span>↑↓ Navigate</span>
            <span>↵ Insert</span>
            <span>Esc Close</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
