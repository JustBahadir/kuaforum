
import React from 'react';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { formatPhoneNumber, validatePhoneNumber } from '@/utils/phoneFormatter';

interface PhoneInputFieldProps {
  control: any;
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export function PhoneInputField({
  control,
  name,
  label,
  required = false,
  placeholder = "05__ ___ __ __",
  className,
}: PhoneInputFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        control={control}
        name={name}
        rules={{
          required: required ? `${label} alanı zorunludur.` : false,
          validate: {
            validPhone: (value) => !value || !required || validatePhoneNumber(value) || 'Geçerli bir telefon numarası giriniz.',
          },
        }}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Input
              id={name}
              {...field}
              value={field.value || ''}
              onChange={(e) => {
                const formattedValue = formatPhoneNumber(e.target.value);
                field.onChange(formattedValue);
              }}
              placeholder={placeholder}
              className={`${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
          </div>
        )}
      />
    </div>
  );
}

export default PhoneInputField;
