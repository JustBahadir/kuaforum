
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

// Format date as dd.mm.yyyy
const formatDate = (input: string): string => {
  // Only keep digits and dots
  const filteredInput = input.replace(/[^\d.]/g, '');
  
  // Split by dots
  const parts = filteredInput.split('.');
  
  // Handle different lengths
  if (parts.length === 1) {
    // Only day portion
    if (parts[0].length > 2) {
      return `${parts[0].slice(0, 2)}.${parts[0].slice(2, 4)}${parts[0].length > 4 ? '.' + parts[0].slice(4, 8) : ''}`;
    }
    return parts[0];
  } else if (parts.length === 2) {
    // Day and month
    const day = parts[0].slice(0, 2);
    const month = parts[1].length > 0 ? parts[1].slice(0, 2) : parts[1];
    return `${day}.${month}`;
  } else if (parts.length >= 3) {
    // Day, month, and year
    const day = parts[0].slice(0, 2);
    const month = parts[1].slice(0, 2);
    const year = parts[2].slice(0, 4);
    return `${day}.${month}.${year}`;
  }
  
  return filteredInput;
};

// Validate date
const validateDate = (dateString: string): boolean => {
  // Accept if it's only day and month (incomplete date is OK)
  if (/^\d{1,2}\.\d{1,2}$/.test(dateString)) {
    const [day, month] = dateString.split('.').map(Number);
    return day >= 1 && day <= 31 && month >= 1 && month <= 12;
  }
  
  // Check full date format
  if (!/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(dateString)) {
    return false;
  }
  
  const [day, month, year] = dateString.split('.').map(Number);
  
  // Basic validation
  if (
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 1900 || year > new Date().getFullYear() ||
    (year === new Date().getFullYear() && month > new Date().getMonth() + 1) ||
    (year === new Date().getFullYear() && month === new Date().getMonth() + 1 && day > new Date().getDate()) ||
    !(/^(19|20)\d{2}$/.test(year.toString()))
  ) {
    return false;
  }
  
  // Advanced validation (check days in month)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) {
    return false;
  }
  
  return true;
};

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
  id = "date",
  error,
  disabled = false
}: DateInputFieldProps) {
  const [displayValue, setDisplayValue] = useState<string>(value);
  const [isValid, setIsValid] = useState<boolean>(true);
  
  useEffect(() => {
    if (value !== displayValue) {
      setDisplayValue(formatDate(value));
    }
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // Only allow digits and dots
    const inputValue = e.target.value.replace(/[^\d.]/g, '');
    const formattedValue = formatDate(inputValue);
    
    // Update display value
    setDisplayValue(formattedValue);
    
    // Validate date if it's a complete date
    let dateIsValid = true;
    if (formattedValue.length > 0) {
      if (formattedValue.split('.').length === 3) {
        dateIsValid = validateDate(formattedValue);
      } else if (formattedValue.split('.').length === 2) {
        // Allow partial dates (day and month only)
        const [day, month] = formattedValue.split('.').map(Number);
        dateIsValid = day >= 1 && day <= 31 && month >= 1 && month <= 12;
      }
    }
    
    setIsValid(dateIsValid);
    
    // Pass value to parent component
    onChange(formattedValue, dateIsValid);
  };

  return (
    <div>
      <Input
        id={id}
        value={displayValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={error || !isValid ? "border-red-500" : ""}
        disabled={disabled}
        type="text"
        autoComplete="off"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {!isValid && !error && (
        <p className="text-sm text-red-500 mt-1">Geçersiz tarih formatı</p>
      )}
    </div>
  );
}
