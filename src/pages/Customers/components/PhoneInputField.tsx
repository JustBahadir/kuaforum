
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { formatPhoneNumber, validatePhoneNumber } from "@/utils/phoneFormatter";

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

    const input = e.target.value;
    
    // Remove all non-digit characters for validation
    const digitsOnly = input.replace(/\D/g, '');
    
    // Only proceed if the input is valid (contains only numbers)
    if (validatePhoneNumber(digitsOnly) || digitsOnly === '') {
      // Limit to 11 digits (Turkish phone number format)
      const limitedDigits = digitsOnly.substring(0, 11);
      
      // Update the formatted display value
      setDisplayValue(formatPhoneNumber(limitedDigits));
      
      // Pass only digits to the parent component
      onChange(limitedDigits);
    }
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
        inputMode="numeric" // Show numeric keyboard on mobile
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
