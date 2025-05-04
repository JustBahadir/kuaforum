
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentDayViewProps {
  appointments: any[];
  isLoading: boolean;
  selectedDate: Date;
  onAppointmentStatusUpdate: (id: number, status: string) => Promise<void>;
  onDateChange?: (date: Date) => void;
}

export const AppointmentDayView = createDisabledComponentWithProps<AppointmentDayViewProps>("AppointmentDayView");
