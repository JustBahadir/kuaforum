import React from "react";
import { Input, InputProps } from "@/components/ui/input";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 11 digits (including the leading 0)
    const digitsOnly = e.target.value.replace(/\D/g, '');
    const limitedDigits = digitsOnly.substring(0, 11);
    
    onChange(limitedDigits);
  };
  
  return (
    <Input
      type="tel"
      value={formatPhoneNumber(value)}
      onChange={handleChange}
      placeholder="05xx xxx xx xx"
      {...props}
    />
  );
}
