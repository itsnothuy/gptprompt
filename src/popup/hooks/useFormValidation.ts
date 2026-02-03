/**
 * useFormValidation Hook
 * Handles form validation logic
 */

import { useState, useCallback } from 'react';

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T> {
  rules: ValidationRule<T>[];
}

export type FormValidation<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

export interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation<T extends Record<string, any>>(
  validationSchema: FormValidation<T>
) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (name: keyof T, value: any): string | null => {
      const fieldValidation = validationSchema[name];
      if (!fieldValidation) return null;

      for (const rule of fieldValidation.rules) {
        if (!rule.validate(value)) {
          return rule.message;
        }
      }
      return null;
    },
    [validationSchema]
  );

  const validateForm = useCallback(
    (values: T): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      for (const name in validationSchema) {
        const error = validateField(name, values[name]);
        if (error) {
          newErrors[name] = error;
          isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [validationSchema, validateField]
  );

  const clearError = useCallback((name: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name as string];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
  };
}

// Common validation rules
export const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule<any> => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      return value != null && value !== '';
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),
};
