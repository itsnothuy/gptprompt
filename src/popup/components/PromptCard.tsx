/**
 * PromptCard Component
 * Displays a single prompt in the list
 */

import type { Prompt } from '@/shared/types';
import { truncate, formatRelativeTime } from '@/shared/utils';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export function PromptCard({ prompt, onEdit, onDelete }: PromptCardProps) {
  const handleClick = () => {
    onEdit(prompt);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${prompt.title}"?`)) {
      onDelete(prompt.id);
    }
  };

  return (
    <article className="prompt-card" onClick={handleClick}>
      <div className="prompt-card-header">
        <h3 className="prompt-card-title">{prompt.title}</h3>
        <button
          className="prompt-card-delete"
          onClick={handleDelete}
          aria-label="Delete prompt"
          title="Delete"
        >
          🗑️
        </button>
      </div>
      <p className="prompt-card-description">
        {truncate(prompt.description || prompt.content, 80)}
      </p>
      <span className="prompt-card-time">
        {formatRelativeTime(prompt.updatedAt)}
      </span>
    </article>
  );
}
