/**
 * PromptForm Page
 * Add/Edit prompt form with validation
 */

import { useState, useEffect, useRef } from 'react';
import { storage } from '@/shared/storage';
import { log } from '@/shared/utils';
import type { Prompt, PromptInput } from '@/shared/types';
import { Button, Input, Textarea } from '../components';
import { useFormValidation, ValidationRules } from '../hooks/useFormValidation';

interface PromptFormProps {
  prompt: Prompt | null;
  onBack: () => void;
  onSave: (isEdit: boolean) => void;
  onError: (message: string) => void;
}

interface FormData {
  title: string;
  content: string;
  description: string;
}

const validationSchema = {
  title: {
    rules: [
      ValidationRules.required('Title is required'),
      ValidationRules.minLength(3, 'Title must be at least 3 characters'),
      ValidationRules.maxLength(100, 'Title must not exceed 100 characters'),
    ],
  },
  content: {
    rules: [
      ValidationRules.required('Content is required'),
      ValidationRules.minLength(10, 'Content must be at least 10 characters'),
      ValidationRules.maxLength(10000, 'Content must not exceed 10,000 characters'),
    ],
  },
  description: {
    rules: [
      ValidationRules.maxLength(200, 'Description must not exceed 200 characters'),
    ],
  },
};

export function PromptForm({ prompt, onBack, onSave, onError }: PromptFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: prompt?.title || '',
    content: prompt?.content || '',
    description: prompt?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const { errors, validateForm, clearError } = useFormValidation<FormData>(validationSchema);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input on mount
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  // Handle field changes
  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      clearError(field);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData)) {
      return;
    }

    setSaving(true);

    try {
      if (prompt) {
        // Update existing prompt
        await storage.updatePrompt({
          id: prompt.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          description: formData.description.trim() || undefined,
        });
        log.popup('Updated prompt:', prompt.id);
        onSave(true);
      } else {
        // Create new prompt
        const input: PromptInput = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          description: formData.description.trim() || undefined,
        };
        await storage.savePrompt(input);
        log.popup('Created new prompt');
        onSave(false);
      }
    } catch (error) {
      log.error('Failed to save prompt:', error);
      onError('Failed to save prompt. Please try again.');
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
  }, [formData]);

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
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          required
          maxLength={100}
        />

        <Textarea
          label="Content"
          placeholder="Enter prompt content..."
          value={formData.content}
          onChange={handleChange('content')}
          error={errors.content}
          required
          rows={6}
          maxLength={10000}
        />

        <Input
          label="Description"
          placeholder="Brief description (optional)"
          value={formData.description}
          onChange={handleChange('description')}
          error={errors.description}
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
