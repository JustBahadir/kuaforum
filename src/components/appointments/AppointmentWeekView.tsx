
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentWeekViewProps {
  selectedDate: Date;
  appointments: any[];
  isLoading: boolean;
  currentPersonelId?: number | null;
  onAppointmentStatusUpdate?: (id: number, status: string) => Promise<void>;
  onDateChange?: (date: Date) => void;
}

export const AppointmentWeekView = createDisabledComponentWithProps<AppointmentWeekViewProps>("AppointmentWeekView");
