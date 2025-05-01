
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
        const isValidYear = year >= 1900 && year <= 2100 && dateParts[2].length === 4 && (dateParts[2].startsWith('19') || dateParts[2].startsWith('20'));
        
        if (isValidDay && isValidMonth && isValidYear) {
          const parsedDate = new Date(year, month, day);
          setIsValid(true);
          onChange(parsedDate);
        } else {
          setIsValid(false);
        }
      } else {
        setIsValid(inputValue === '');
      }
    } else {
      setIsValid(true);
      onChange(undefined);
    }
  };

  // Function to format the input as the user types
  const formatDateInput = (input: string): string => {
    // Remove non-digits
    const digits = input.replace(/\D/g, '');

    // Format as DD.MM.YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only digits and control keys
    const isDigit = /\d/.test(e.key);
    const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key);
    if (!isDigit && !isControlKey && e.key !== '.') {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex w-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !value && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "PP", { locale: tr }) : <span>Tarih seçin</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          id={id}
          placeholder="gg.aa.yyyy"
          value={textValue}
          onChange={handleDateInputChange}
          onKeyPress={handleKeyPress}
          className={cn("ml-2", !isValid && "border-red-500")}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!isValid && !error && (
        <p className="text-sm text-red-500">Geçersiz tarih formatı</p>
      )}
    </div>
  );
}
