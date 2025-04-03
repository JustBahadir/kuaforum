
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonnelForm } from "./PersonnelForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDialog({ open, onOpenChange }: PersonnelDialogProps) {
  const queryClient = useQueryClient();
  
  const { mutate, isPending } = useMutation({
    mutationFn: (personelData: any) => personelServisi.ekle(personelData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success("Personel başarıyla eklendi");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Personel eklenirken hata:", error);
      toast.error("Personel eklenirken bir hata oluştu");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Personel Ekle</DialogTitle>
        </DialogHeader>
        <PersonnelForm onSubmit={mutate} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
}
