/**
 * PickerItem Component
 * Individual prompt item in the command palette
 */

import { Command } from 'cmdk';
import type { Prompt } from '@/shared/types';
import { truncate } from '@/shared/utils';

interface PickerItemProps {
  prompt: Prompt;
  onSelect: (prompt: Prompt) => void;
}

export function PickerItem({ prompt, onSelect }: PickerItemProps) {
  return (
    <Command.Item
      key={prompt.id}
      value={`${prompt.title} ${prompt.description || ''} ${prompt.content}`}
      onSelect={() => onSelect(prompt)}
      className="picker-item"
    >
      <div className="picker-item-icon">📋</div>
      <div className="picker-item-content">
        <div className="picker-item-title">{prompt.title}</div>
        <div className="picker-item-description">
          {truncate(prompt.description || prompt.content, 60)}
        </div>
      </div>
    </Command.Item>
  );
}
