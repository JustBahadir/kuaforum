import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

// Format phone number to xxxx xxx xx xx
const formatPhoneNumber = (input: string): string => {
  // Only keep digits
  const digitsOnly = input.replace(/\D/g, '');
  
  // Format as xxxx xxx xx xx (Turkish format)
  if (digitsOnly.length === 0) return '';
  
  let formatted = '';
  
  if (digitsOnly.length <= 4) {
    formatted = digitsOnly;
  } else if (digitsOnly.length <= 7) {
    formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
  } else if (digitsOnly.length <= 9) {
    formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7)}`;
  } else {
    formatted = `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 7)} ${digitsOnly.slice(7, 9)} ${digitsOnly.slice(9, 11)}`;
  }
  
  return formatted.trim();
};

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export function PhoneInputField({
  value,
  onChange,
  placeholder = "05xx xxx xx xx",
  id = "phone",
  error,
  disabled = false
}: PhoneInputFieldProps) {
  const [displayValue, setDisplayValue] = useState<string>(formatPhoneNumber(value));
  
  // Update display value when external value changes
  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value));
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Remove all non-digit characters
    const digitsOnly = e.target.value.replace(/\D/g, '');
    
    // Limit to 11 digits (Turkish phone number format)
    const limitedDigits = digitsOnly.substring(0, 11);
    
    // Update the formatted display value
    setDisplayValue(formatPhoneNumber(limitedDigits));
    
    // Pass only digits to the parent component
    onChange(limitedDigits);
  };

  return (
    <div>
      <Input
        id={id}
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
        maxLength={15} // Allow some space for formatting
        type="tel"
        inputMode="tel"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
