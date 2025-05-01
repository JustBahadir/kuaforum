import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';

// Form Field component
export interface FormFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// Form Textarea component
export interface FormTextareaProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea({
  id,
  label,
  placeholder = '',
  value,
  onChange,
  required = false,
  error,
  rows = 3,
  className,
}: FormTextareaProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={id}>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
      <textarea
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={cn(
          'w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500' : ''
        )}
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

// Adding the missing components
export function FormGroup({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn('space-y-2', className)}>{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <Label>{children}</Label>;
}

export function FormMessage({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-red-500 mt-1">{children}</p>;
}
