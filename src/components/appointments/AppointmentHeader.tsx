
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentHeaderProps {
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export const AppointmentHeader = createDisabledComponentWithProps<AppointmentHeaderProps>("AppointmentHeader");
