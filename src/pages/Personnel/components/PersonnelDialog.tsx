
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonnelForm } from "./PersonnelForm";
import { usePersonnelMutation } from "../hooks/usePersonnelMutation";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDialog({ open, onOpenChange }: PersonnelDialogProps) {
  const { mutate: personelEkle, isPending } = usePersonnelMutation(() => {
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Personel Ekle</DialogTitle>
        </DialogHeader>
        <PersonnelForm onSubmit={personelEkle} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
}
