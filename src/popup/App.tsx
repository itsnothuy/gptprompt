/**
 * Popup App Component
 * Main entry point for the extension popup
 */

import { useState } from 'react';
import { PromptList } from './pages/PromptList';
import { PromptForm } from './pages/PromptForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import type { Prompt } from '@/shared/types';

type View = 'list' | 'add' | 'edit';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const { toasts, removeToast, success, error } = useToast();

  const handleAdd = () => {
    setEditingPrompt(null);
    setView('add');
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setView('edit');
  };

  const handleBack = () => {
    setEditingPrompt(null);
    setView('list');
  };

  const handleSave = (isEdit: boolean) => {
    success(isEdit ? 'Prompt updated successfully' : 'Prompt created successfully');
    setEditingPrompt(null);
    setView('list');
  };

  const handleDelete = () => {
    success('Prompt deleted successfully');
  };

  const handleError = (message: string) => {
    error(message);
  };

  return (
    <ErrorBoundary>
      <div className="popup">
        {view === 'list' && (
          <PromptList
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onError={handleError}
          />
        )}
        {(view === 'add' || view === 'edit') && (
          <PromptForm
            prompt={editingPrompt}
            onBack={handleBack}
            onSave={handleSave}
            onError={handleError}
          />
        )}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </ErrorBoundary>
  );
}
