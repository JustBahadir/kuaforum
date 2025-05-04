
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface CalendarDatePickerProps {
  date: Date | null;
  onSelect: (date: Date | null) => void;
}

export const CalendarDatePicker = createDisabledComponentWithProps<CalendarDatePickerProps>("CalendarDatePicker");
