
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentsViewProps {
  appointments: any[];
  loading: boolean;
  reload: () => void;
}

export const AppointmentsView = createDisabledComponentWithProps<AppointmentsViewProps>("AppointmentsView");
