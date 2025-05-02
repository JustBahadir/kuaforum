
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parse, isValid } from "date-fns";
import { tr } from "date-fns/locale";

interface DatePickerFieldProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  textValue: string;
  onTextChange: (value: string) => void;
  label: string;
  id?: string;
  placeholder?: string;
  error?: string;
}

export function DatePickerField({
  value,
  onChange,
  textValue,
  onTextChange,
  label,
  id = "date",
  placeholder = "GG.AA.YYYY",
  error
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  // Format date as DD.MM.YYYY when it changes
  useEffect(() => {
    if (value) {
      onTextChange(format(value, "dd.MM.yyyy"));
    }
  }, [value, onTextChange]);

  // Parse date from text input 
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onTextChange(text);
    
    // Try to parse the date if text matches format pattern
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(text)) {
      try {
        const parsedDate = parse(text, "dd.MM.yyyy", new Date());
        if (isValid(parsedDate)) {
          onChange(parsedDate);
        }
      } catch (error) {
        console.log("Invalid date format");
      }
    }
  };
  
  // Format the input as user types
  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPosition = input.selectionStart || 0;
    
    // Only handle numeric input
    const value = input.value.replace(/[^\d]/g, '');
    
    if (value.length > 0) {
      let formattedText = '';
      
      // Format as DD.MM.YYYY
      if (value.length <= 2) {
        formattedText = value;
      } else if (value.length <= 4) {
        formattedText = `${value.slice(0, 2)}.${value.slice(2)}`;
      } else {
        formattedText = `${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 8)}`;
      }
      
      // Update only if different to avoid cursor jumping
      if (formattedText !== input.value) {
        const newCursorPosition = cursorPosition + (formattedText.length - input.value.length);
        onTextChange(formattedText);
        
        // Restore cursor position
        setTimeout(() => {
          input.selectionStart = newCursorPosition;
          input.selectionEnd = newCursorPosition;
        }, 0);
      }
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative w-full">
              <Input
                id={id}
                value={textValue}
                onChange={handleTextChange}
                onKeyUp={handleKeyUp}
                placeholder={placeholder}
                className={cn(error ? "border-red-500" : "", "pr-10")}
                maxLength={10} // DD.MM.YYYY = 10 chars
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => setOpen(true)}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date);
                setOpen(false);
              }}
              locale={tr}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
