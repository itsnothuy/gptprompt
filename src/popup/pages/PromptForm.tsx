/**
 * PromptForm Page
 * Add/Edit prompt form
 */

import { useState, useEffect, useRef } from 'react';
import { storage } from '@/shared/storage';
import { log } from '@/shared/utils';
import type { Prompt, PromptInput } from '@/shared/types';
import { Button, Input, Textarea } from '../components';

interface PromptFormProps {
  prompt: Prompt | null;
  onBack: () => void;
  onSave: () => void;
}

interface FormErrors {
  title?: string;
  content?: string;
}

export function PromptForm({ prompt, onBack, onSave }: PromptFormProps) {
  const [title, setTitle] = useState(prompt?.title || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      if (prompt) {
        // Update existing prompt
        await storage.updatePrompt({
          id: prompt.id,
          title: title.trim(),
          content: content.trim(),
          description: description.trim() || undefined,
        });
        log.popup('Updated prompt:', prompt.id);
      } else {
        // Create new prompt
        const input: PromptInput = {
          title: title.trim(),
          content: content.trim(),
          description: description.trim() || undefined,
        };
        await storage.savePrompt(input);
        log.popup('Created new prompt');
      }

      onSave();
    } catch (error) {
      log.error('Failed to save prompt:', error);
      setErrors({ title: 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle keyboard shortcut to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [title, content, description]);

  const isEditing = !!prompt;

  return (
    <div className="prompt-form-page">
      {/* Header */}
      <header className="popup-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          ← Back
        </button>
        <h1 className="popup-title">
          {isEditing ? 'Edit Prompt' : 'Add Prompt'}
        </h1>
      </header>

      {/* Form */}
      <form className="prompt-form" onSubmit={handleSubmit}>
        <Input
          ref={titleInputRef}
          label="Title"
          placeholder="Enter title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
          maxLength={100}
        />

        <Textarea
          label="Content"
          placeholder="Enter prompt content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          error={errors.content}
          required
          rows={6}
          maxLength={10000}
        />

        <Input
          label="Description"
          placeholder="Brief description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={200}
        />

        {/* Actions */}
        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <p className="form-hint">
          Tip: Press Ctrl+Enter (Cmd+Enter on Mac) to save
        </p>
      </form>
    </div>
  );
}
