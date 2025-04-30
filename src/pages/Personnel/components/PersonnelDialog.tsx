
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonnelDialog({ open, onOpenChange }: PersonnelDialogProps) {
  const queryClient = useQueryClient();
  const { userRole } = useCustomerAuth();
  
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
          <DialogTitle>Personel Sistemi</DialogTitle>
        </DialogHeader>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Personel eklemek için, personellerinizin dükkan kodunuzu kullanarak üye olmalarını sağlayın. 
            Dükkanınızın kodunu İşletme Ayarları sayfasından öğrenebilirsiniz.
          </AlertDescription>
        </Alert>
        
        {userRole === 'admin' ? (
          <PersonnelForm onSubmit={mutate} isLoading={isPending} />
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Yalnızca İşletme Sahipleri personel ekleyebilir.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
