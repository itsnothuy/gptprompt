/**
 * Popup App Component
 * Main entry point for the extension popup
 */

import { useState } from 'react';
import { PromptList } from './pages/PromptList';
import { PromptForm } from './pages/PromptForm';
import type { Prompt } from '@/shared/types';

type View = 'list' | 'add' | 'edit';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

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

  const handleSave = () => {
    setEditingPrompt(null);
    setView('list');
  };

  return (
    <div className="popup">
      {view === 'list' && (
        <PromptList onAdd={handleAdd} onEdit={handleEdit} />
      )}
      {(view === 'add' || view === 'edit') && (
        <PromptForm
          prompt={editingPrompt}
          onBack={handleBack}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
