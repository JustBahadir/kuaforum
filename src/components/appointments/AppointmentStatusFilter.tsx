
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export const AppointmentStatusFilter = createDisabledComponentWithProps<AppointmentStatusFilterProps>("AppointmentStatusFilter");
