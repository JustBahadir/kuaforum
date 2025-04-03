import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PersonnelDetailsDialog } from "./PersonnelDetailsDialog";
import { PersonnelDialog } from "./PersonnelDialog";
import { PersonnelEditDialog } from "./PersonnelEditDialog";
import { Pencil, Trash, Eye, Plus, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { usePersonnelMutation } from "../hooks/usePersonnelMutation";
import { LoadingButton } from "@/components/ui/loading-button";
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
  personelListesi: Personnel[];
  dukkanId: number;
  onPersonnelAdded: () => void;
  onPersonnelUpdated: () => void;
}

export function PersonnelList({ personelListesi, dukkanId, onPersonnelAdded, onPersonnelUpdated }: PersonnelListProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { deletePersonnel } = usePersonnelMutation();

  const handleOpen = () => setOpen(true);
  const handleEditOpen = (personel: Personnel) => {
    setSelectedPersonnel(personel);
    setEditOpen(true);
  };
  const handleDetailsOpen = (personel: Personnel) => {
    setSelectedPersonnel(personel);
    setDetailsOpen(true);
  };

  const handleDeleteOpen = (personel: Personnel) => {
    setSelectedPersonnel(personel);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPersonnel) {
      setIsDeleting(true);
      try {
        await deletePersonnel(selectedPersonnel.id);
        toast.success("Personel başarıyla silindi");
      } catch (error) {
        console.error("Personel silinirken hata:", error);
        toast.error("Personel silinirken bir hata oluştu");
      } finally {
        setIsDeleting(false);
        setDeleteOpen(false);
        setSelectedPersonnel(null);
      }
    }
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-semibold">Personel Listesi</h1>
        </div>
        <div>
          <Button onClick={handleOpen}>
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
                <Badge className="mt-1">ID: {personel.id}</Badge>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="icon" onClick={() => handleDetailsOpen(personel)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleEditOpen(personel)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDeleteOpen(personel)}>
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <PersonnelDialog open={open} setOpen={setOpen} dukkanId={dukkanId} onPersonnelAdded={onPersonnelAdded} />

      {selectedPersonnel && (
        <PersonnelEditDialog
          open={editOpen}
          setOpen={setEditOpen}
          personel={selectedPersonnel}
          dukkanId={dukkanId}
          onPersonnelUpdated={onPersonnelUpdated}
        />
      )}

      {selectedPersonnel && (
        <PersonnelDetailsDialog
          open={detailsOpen}
          setOpen={setDetailsOpen}
          personel={selectedPersonnel}
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
