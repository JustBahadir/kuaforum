
import * as React from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";
import { Dispatch, SetStateAction } from "react";

interface DatePickerWithRangeProps {
  date: DateRange;
  setDate: Dispatch<SetStateAction<DateRange>>;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {
  const handleSelect = (range: DateRange) => {
    // Only update if both dates are selected
    if (range?.from && range?.to) {
      setDate(range);
    }
  };
  
  return (
    <DateRangePicker 
      from={date.from}
      to={date.to}
      onSelect={handleSelect}
    />
  );
}
