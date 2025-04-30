
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface DateInputFieldProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  id?: string;
  error?: string;
  disabled?: boolean;
}

export function DateInputField({
  value,
  onChange,
  placeholder = "gg.aa.yyyy",
  id = "birthdate",
  error,
  disabled = false
}: DateInputFieldProps) {
  const [displayValue, setDisplayValue] = useState<string>(value || "");
  const [isValid, setIsValid] = useState<boolean>(true);
  
  // Validate date format and values
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true; // Empty is considered valid
    
    // Allow incomplete dates like "dd.mm."
    if (/^\d{1,2}\.\d{1,2}\.?$/.test(dateStr)) return true;
    
    // For complete dates, validate properly
    const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const match = dateStr.match(dateRegex);
    
    if (!match) return false;
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    
    // Only allow years starting with 19 or 20
    if (!(year.toString().startsWith('19') || year.toString().startsWith('20'))) return false;
    
    // Check if date is in the future
    const currentDate = new Date();
    const inputDate = new Date(year, month - 1, day);
    if (inputDate > currentDate) return false;
    
    // Additional validation for days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;
    
    return true;
  };
  
  // Format input as user types
  const formatDateInput = (input: string): string => {
    // Remove non-digits and non-dots
    const cleaned = input.replace(/[^\d.]/g, '');
    
    // Split by dots
    const parts = cleaned.split('.');
    const formattedParts: string[] = [];
    
    // Format day
    if (parts[0]) {
      if (parts[0].length > 2) {
        formattedParts.push(parts[0].substring(0, 2));
        if (parts.length === 1) {
          parts.push(parts[0].substring(2));
        } else {
          parts[1] = parts[0].substring(2) + parts[1];
        }
      } else {
        formattedParts.push(parts[0]);
      }
    }
    
    // Format month
    if (parts[1]) {
      if (parts[1].length > 2) {
        formattedParts.push(parts[1].substring(0, 2));
        if (parts.length === 2) {
          parts.push(parts[1].substring(2));
        } else {
          parts[2] = parts[1].substring(2) + parts[2];
        }
      } else {
        formattedParts.push(parts[1]);
      }
    }
    
    // Format year
    if (parts[2]) {
      formattedParts.push(parts[2].substring(0, 4));
    }
    
    // Join with dots
    return formattedParts.join('.');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const rawValue = e.target.value;
    const formattedValue = formatDateInput(rawValue);
    
    // Auto-insert dots if needed
    let valueWithDots = formattedValue;
    if (rawValue.endsWith('.')) {
      valueWithDots = formattedValue + '.';
    } else if (formattedValue.length === 2 && rawValue.length > formattedValue.length) {
      valueWithDots = formattedValue + '.';
    } else if (formattedValue.length === 5 && rawValue.length > formattedValue.length) {
      valueWithDots = formattedValue + '.';
    }
    
    setDisplayValue(valueWithDots);
    
    const valid = validateDate(valueWithDots);
    setIsValid(valid);
    
    onChange(valueWithDots, valid);
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
        maxLength={10} // DD.MM.YYYY = 10 chars
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
