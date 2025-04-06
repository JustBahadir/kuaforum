
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { musteriServisi } from "@/lib/supabase";
import { Musteri } from "@/lib/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingButton } from "@/components/ui/loading-button";

interface DeleteCustomerDialogProps {
  customer: Musteri;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteCustomerDialog({
  customer,
  isOpen,
  onClose,
  onSuccess,
}: DeleteCustomerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const deleteCustomer = useMutation({
    mutationFn: async () => {
      if (!customer.id) {
        throw new Error("Müşteri ID bulunamadı");
      }
      return musteriServisi.sil(customer.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["musteriler"] });
      toast.success("Müşteri başarıyla silindi");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("Error deleting customer:", error);
      toast.error("Müşteri silinirken bir hata oluştu");
    },
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCustomer.mutateAsync();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{customer.first_name} {customer.last_name}</strong> adlı müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
          <LoadingButton
            variant="destructive"
            loading={isDeleting}
            onClick={handleDelete}
          >
            Sil
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
