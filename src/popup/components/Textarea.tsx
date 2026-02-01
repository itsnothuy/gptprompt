/**
 * Textarea Component
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="input-wrapper">
        {label && (
          <label className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`textarea ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="input-error-message">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
