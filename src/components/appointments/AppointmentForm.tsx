
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface AppointmentFormProps {
  shopId: number;
}

export const AppointmentForm = createDisabledComponentWithProps<AppointmentFormProps>("AppointmentForm");
