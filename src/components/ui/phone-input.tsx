
// Rewrite phone input from profile page to reuse anywhere

import * as React from "react";
import { Input } from "./input";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export function PhoneInput({ value, onChange, placeholder = "Telefon numarası", id, ...props }: PhoneInputProps) {
  // Format phone number as you like (simple formatting here)
  const formatPhone = (phone: string) => {
    // Remove non-digits
    const digits = phone.replace(/\D/g, "");
    // Format as (XXX) XXX-XXXX or more generic
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    if (digits.length <= 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)} ext.${digits.slice(10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <Input
      id={id}
      type="tel"
      inputMode="tel"
      value={formatPhone(value)}
      onChange={handleChange}
      placeholder={placeholder}
      {...props}
    />
  );
}

