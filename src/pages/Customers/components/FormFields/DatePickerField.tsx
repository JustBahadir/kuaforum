
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Input } from "@/components/ui/input";

interface DatePickerFieldProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  label?: string;
  id?: string;
  error?: string;
}

export function DatePickerField({
  value,
  onChange,
  textValue,
  onTextChange,
  label = "Tarih",
  id = "date",
  error
}: DatePickerFieldProps) {
  const [isValid, setIsValid] = useState(true);
  
  useEffect(() => {
    // Format the date value if it exists and is valid
    if (value && !isNaN(value.getTime())) {
      onTextChange(format(value, "dd.MM.yyyy"));
    }
  }, [value, onTextChange]);
  
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onTextChange(inputValue);

    // Validate and parse the date
    if (inputValue) {
      const dateParts = inputValue.split('.');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(dateParts[2], 10);

        // Basic date validation
        const isValidDay = day >= 1 && day <= 31;
        const isValidMonth = month >= 0 && month <= 11;
        const isValidYear = year >= 1900 && year <= 2100 && dateParts[2].length === 4;
        
        if (isValidDay && isValidMonth && isValidYear) {
          const parsedDate = new Date(year, month, day);
          
          // Check if day is valid for this month (e.g., not Feb 30)
          const isActuallyValid = parsedDate.getDate() === day && 
                                parsedDate.getMonth() === month &&
                                parsedDate.getFullYear() === year;
                                
          if (isActuallyValid) {
            setIsValid(true);
            onChange(parsedDate);
            return;
          }
        }
        setIsValid(false);
      } else {
        // Empty input is valid (optional field)
        setIsValid(inputValue === '');
      }
    } else {
      setIsValid(true);
      onChange(undefined);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digits, period, and control keys
    const isDigit = /\d/.test(e.key);
    const isPeriod = e.key === '.';
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
    
    if (!isDigit && !isPeriod && !isControlKey) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            type="text"
            value={textValue}
            onChange={handleDateInputChange}
            onKeyDown={handleKeyPress}
            placeholder="gg.aa.yyyy"
            className={!isValid ? "border-red-500" : ""}
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" type="button">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
              locale={tr}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!isValid && !error && <p className="text-sm text-red-500">Geçersiz tarih formatı</p>}
    </div>
  );
}
