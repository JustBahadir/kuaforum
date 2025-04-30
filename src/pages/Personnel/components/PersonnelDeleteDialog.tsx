
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { personelServisi } from "@/lib/supabase";
import { toast } from "sonner";

export interface PersonnelDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any; // Changed from personnelId to personnel for compatibility
  onSuccess?: () => void;
}

export function PersonnelDeleteDialog({
  open,
  onOpenChange,
  personnel,
  onSuccess
}: PersonnelDeleteDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const personnelId = personnel?.id;
  const personnelName = personnel?.ad_soyad || 'Personel';

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!personnelId) return;
      setIsLoading(true);
      return await personelServisi.sil(personnelId);
    },
    onSuccess: () => {
      toast.success("Personel başarıyla silindi");
      queryClient.invalidateQueries({ queryKey: ["personeller"] });
      queryClient.invalidateQueries({ queryKey: ["personel-list"] });
      queryClient.invalidateQueries({ queryKey: ["personel"] });
      onOpenChange(false);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Personel silinirken bir hata oluştu");
      setIsLoading(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Personeli silmek istediğinize emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            <p>
              <strong>{personnelName}</strong> isimli personel kaydı kalıcı olarak silinecek.
            </p>
            <p className="mt-2">Bu işlem geri alınamaz.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>İptal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Siliniyor..." : "Evet, Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
