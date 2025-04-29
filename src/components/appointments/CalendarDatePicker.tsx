
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarDatePickerProps {
  date: Date | null;
  onSelect: (date: Date | null) => void;
}

export function CalendarDatePicker({ date, onSelect }: CalendarDatePickerProps) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium">Tarih Seçin</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={onSelect}
            locale={tr}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
