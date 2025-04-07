
import * as React from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "./date-range-picker";

interface DatePickerWithRangeProps {
  date: DateRange;
  setDate: (date: DateRange) => void;
}

export function DatePickerWithRange({ date, setDate }: DatePickerWithRangeProps) {
  const handleSelect = (range: { from: Date; to: Date }) => {
    setDate({
      from: range.from,
      to: range.to
    });
  };
  
  return (
    <DateRangePicker 
      from={date.from}
      to={date.to}
      onSelect={handleSelect}
    />
  );
}
