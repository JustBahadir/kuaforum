
import { createDisabledComponentWithProps } from "@/utils/disabledComponents";

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string | null;
  dukkanId?: number | null;
  onSuccess?: () => void;
}

export const NewAppointmentDialog = createDisabledComponentWithProps<NewAppointmentDialogProps>("NewAppointmentDialog");
