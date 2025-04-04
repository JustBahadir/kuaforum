
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelDialog } from "./PersonnelDialog";
import { Trash, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingButton } from "@/components/ui/loading-button";
import { personelServisi } from "@/lib/supabase";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
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

interface Personnel {
  id: number;
  ad_soyad: string;
  unvan: string;
  auth_id: string;
  dukkan_id: number;
  avatar_url?: string;
}

interface PersonnelListProps {
  onPersonnelSelect?: (personelId: number) => void;
}

export function PersonnelList({ onPersonnelSelect }: PersonnelListProps) {
  const [openDetails, setOpenDetails] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { dukkanId } = useCustomerAuth();
  const queryClient = useQueryClient();

  const { data: personelListesi = [], isLoading } = useQuery({
    queryKey: ['personel', dukkanId],
    queryFn: () => personelServisi.hepsiniGetir(),
    enabled: !!dukkanId
  });

  const deletePersonnelMutation = useMutation({
    mutationFn: (id: number) => personelServisi.sil(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personel'] });
      toast.success("Personel başarıyla silindi");
    },
    onError: (error) => {
      console.error("Personel silinirken hata:", error);
      toast.error("Personel silinirken bir hata oluştu");
    }
  });

  const handleDetailsOpen = (personel: Personnel) => {
    setSelectedPersonnel(personel);
    setOpenDetails(true);
    if (onPersonnelSelect) {
      onPersonnelSelect(personel.id);
    }
  };

  const handleDeleteOpen = (personel: Personnel) => {
    setSelectedPersonnel(personel);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPersonnel) {
      setIsDeleting(true);
      try {
        await deletePersonnelMutation.mutateAsync(selectedPersonnel.id);
      } catch (error) {
        console.error("Personel silinirken hata:", error);
      } finally {
        setIsDeleting(false);
        setDeleteOpen(false);
        setSelectedPersonnel(null);
      }
    }
  };

  const handlePersonnelAdded = () => {
    queryClient.invalidateQueries({ queryKey: ['personel'] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold">Personel Listesi</h1>
        </div>
        <div>
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Personel Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {personelListesi.map((personel) => (
          <div key={personel.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                {personel.avatar_url ? (
                  <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
                ) : (
                  <AvatarFallback>{personel.ad_soyad.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold">{personel.ad_soyad}</h2>
                <p className="text-gray-500">{personel.unvan}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleDetailsOpen(personel)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteOpen(personel)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <PersonnelDialog 
        open={openDialog} 
        onOpenChange={setOpenDialog} 
      />

      {selectedPersonnel && (
        <PersonnelDetailsDialog
          personel={selectedPersonnel}
          open={openDetails}
          onOpenChange={setOpenDetails}
        />
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personeli Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlemi gerçekleştirmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <LoadingButton
              variant="destructive"
              loading={isDeleting}
              onClick={confirmDelete}
            >
              Sil
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
