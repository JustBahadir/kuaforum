
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentsListProps {
  appointments: any[];
  loading: boolean;
  reload: () => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  defaultStatus: string;
}

export const AppointmentsList = createDisabledComponentWithProps<AppointmentsListProps>("AppointmentsList");
