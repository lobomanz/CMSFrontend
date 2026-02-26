import React from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label?: string;
  htmlFor?: string;
  error?: FieldError;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, htmlFor, error, children }) => {
  return (
    <div className="space-y-1">
      {label && htmlFor && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default FormField;
