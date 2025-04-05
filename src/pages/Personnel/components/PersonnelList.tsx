
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelDialog } from "./PersonnelDialog";
import { Plus, Trash } from "lucide-react";
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

  const handleDeleteOpen = (personel: Personnel, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent opening details when clicking delete
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-10 h-10 border-4 border-t-purple-600 border-purple-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold">Personel Listesi</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setOpenDialog(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Personel Ekle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {personelListesi.map((personel) => (
          <div 
            key={personel.id} 
            className="bg-white rounded-lg shadow-md p-5 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => handleDetailsOpen(personel)}
          >
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {personel.avatar_url ? (
                  <AvatarImage src={personel.avatar_url} alt={personel.ad_soyad} />
                ) : (
                  <AvatarFallback className="bg-purple-100 text-purple-800 text-lg">
                    {personel.ad_soyad
                      .split(' ')
                      .map((name: string) => name[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-grow">
                <h2 className="text-lg font-semibold">{personel.ad_soyad}</h2>
                <p className="text-gray-500">{personel.unvan || "Personel"}</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                className="self-start"
                onClick={(e) => handleDeleteOpen(personel, e)}
              >
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
