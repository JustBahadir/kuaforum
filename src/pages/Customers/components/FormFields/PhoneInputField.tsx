
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { formatPhoneNumber } from "@/utils/phoneFormatter";

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digits and control keys
    const isDigit = /\d/.test(e.key);
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
    if (!isDigit && !isControlKey) {
      e.preventDefault();
    }
  };

  return (
    <div>
      <Input
        id={id}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
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
