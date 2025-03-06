import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";

interface DatePickerFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  textValue: string;
  onTextChange: (text: string) => void;
  label?: string;
  placeholder?: string;
  id?: string;
}

export function DatePickerField({
  value,
  onChange,
  textValue,
  onTextChange,
  label = "Tarih",
  placeholder = "GG.MM.YYYY",
  id = "date-picker"
}: DatePickerFieldProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Format date input
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow empty value
    if (!input) {
      onTextChange('');
      onChange(undefined);
      return;
    }
    
    // Keep the actual characters entered
    let formattedInput = '';
    const digitsOnly = input.replace(/[^\d]/g, '');
    
    if (digitsOnly.length <= 2) {
      formattedInput = digitsOnly;
    } else if (digitsOnly.length <= 4) {
      formattedInput = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2)}`;
    } else {
      formattedInput = `${digitsOnly.slice(0, 2)}.${digitsOnly.slice(2, 4)}.${digitsOnly.slice(4, 8)}`;
    }
    
    onTextChange(formattedInput);
    
    // Parse date if complete
    if (formattedInput.length === 10) {
      try {
        const parsedDate = parse(formattedInput, 'dd.MM.yyyy', new Date());
        if (isValid(parsedDate)) {
          onChange(parsedDate);
        }
      } catch (error) {
        console.error("Date parsing error:", error);
      }
    }
  };

  // Calendar select
  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      onTextChange(format(date, 'dd.MM.yyyy'));
    }
    setCalendarOpen(false);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex">
        <Input
          id={id}
          value={textValue}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="flex-1"
        />
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              variant="outline" 
              className="ml-2"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              initialFocus
              locale={tr}
              captionLayout="dropdown-buttons"
              fromYear={1900}
              toYear={new Date().getFullYear()}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
