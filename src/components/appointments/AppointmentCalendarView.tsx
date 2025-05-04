
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentCalendarViewProps {
  appointments: any[];
  isLoading: boolean;
  selectedDate: Date;
  onDateSelect?: (date: Date) => void;
}

export const AppointmentCalendarView = createDisabledComponentWithProps<AppointmentCalendarViewProps>("AppointmentCalendarView");
